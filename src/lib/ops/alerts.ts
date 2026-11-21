import { randomUUID } from "node:crypto";
import path from "node:path";
import { circleRepository } from "../circles/repository";
import { sendEvent, type DeliveryResult, type NudgeBeeEvent } from "../integrations/nudgebee";
import { site } from "../site";
import { dataDir, readJsonFile, updateJsonFile } from "../server/json-store";
import { audit } from "./audit";
import { percentile, samples, setGauge } from "./metrics";
import { propose, type RunbookId } from "./runbooks";

/**
 * FESTIVA's alert rules, evaluated against real samples from metrics.ts.
 *
 * When a rule starts or stops firing, FESTIVA records an operations event with
 * the evidence it saw (counts, percentiles, status and error codes; never
 * personal content), proposes the matching runbook for human approval, and,
 * if configured, sends the event to NudgeBee's Event Webhook.
 *
 * The same rules are provided as Prometheus alerting rules in
 * ops/prometheus/festiva-alerts.yml for deployments that run Prometheus and
 * Alertmanager (for example alongside the NudgeBee agent in Kubernetes).
 *
 * The "findings" written here come from FESTIVA's own checks and are labelled
 * as such. Investigation by NudgeBee happens in NudgeBee.
 */

export type RuleName = "gift_circle_api_latency_high" | "voice_transcription_failing" | "storage_unhealthy" | "api_error_rate_high" | "preference_processing_failing";

export interface Evidence {
  [key: string]: string | number | null;
}

interface RuleResult {
  firing: boolean;
  evidence: Evidence;
  findings: string[];
  controlledTest: boolean;
  sufficientData: boolean;
}

export interface RuleDefinition {
  name: RuleName;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  condition: string;
  runbooks: RunbookId[];
}

export const RULES: RuleDefinition[] = [
  { name: "gift_circle_api_latency_high", title: "Gift Circle API latency is high", severity: "high", condition: "p95 latency of /api/circles/* above 1,500 ms over 5 minutes, with at least 5 requests", runbooks: ["pause_ai_structuring", "end_controlled_tests"] },
  { name: "voice_transcription_failing", title: "Voice transcription is failing", severity: "high", condition: "At least 3 failed voice transcriptions in 10 minutes, making up at least half of attempts", runbooks: ["pause_voice_capture", "end_controlled_tests"] },
  { name: "storage_unhealthy", title: "Circle storage is unhealthy", severity: "critical", condition: "The storage health check fails, or takes longer than 1,000 ms", runbooks: ["recheck_storage"] },
  { name: "api_error_rate_high", title: "API error rate is high", severity: "high", condition: "At least 10% of API requests answered 5xx over 5 minutes, with at least 20 requests", runbooks: ["end_controlled_tests"] },
  { name: "preference_processing_failing", title: "Preference processing is failing", severity: "medium", condition: "At least 3 failed preference-structuring steps in 10 minutes", runbooks: ["pause_ai_structuring"] },
];

export interface OpsEvent {
  id: string;
  rule: RuleName;
  title: string;
  severity: RuleDefinition["severity"];
  status: "firing" | "resolved";
  startsAt: string;
  endsAt: string | null;
  controlledTest: boolean;
  evidence: Evidence;
  findings: string[];
  runbooks: RunbookId[];
  deliveries: DeliveryResult[];
}

interface OpsState {
  active: Partial<Record<RuleName, string>>;
  events: OpsEvent[];
  lastEvaluatedAt: string | null;
}

const EMPTY: OpsState = { active: {}, events: [], lastEvaluatedAt: null };
const file = () => path.join(dataDir(), "ops-events.json");

const fmt = (ms: number | null) => (ms === null ? "n/a" : ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`);

function countBy<T>(items: T[], key: (item: T) => string): string {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  return [...counts.entries()].map(([k, v]) => `${k}: ${v}`).join(", ") || "none";
}

export async function evaluateRules(now = Date.now()): Promise<Record<RuleName, RuleResult>> {
  const five = samples(5 * 60_000, now);
  const ten = samples(10 * 60_000, now);

  // 1. Gift Circle API latency
  const circleRequests = five.requests.filter((r) => r.route.startsWith("/api/circles"));
  const durations = circleRequests.map((r) => r.ms);
  const p95 = percentile(durations, 95);
  const latencyTest = circleRequests.filter((r) => r.controlledTest).length;
  const latency: RuleResult = {
    firing: circleRequests.length >= 5 && (p95 ?? 0) > 1500,
    sufficientData: circleRequests.length >= 5,
    controlledTest: latencyTest > 0,
    evidence: { window: "5 minutes", requests: circleRequests.length, p50_ms: percentile(durations, 50), p95_ms: p95, max_ms: durations.length ? Math.max(...durations) : null, threshold_ms: 1500, during_controlled_test: latencyTest },
    findings: [
      `p95 latency of the Gift Circle API is ${fmt(p95)} across ${circleRequests.length} request(s) in the last 5 minutes (threshold 1.5 s).`,
      ...(latencyTest ? [`${latencyTest} of these requests ran during a controlled latency test.`] : []),
      `Slowest routes: ${[...circleRequests].sort((a, b) => b.ms - a.ms).slice(0, 3).map((r) => `${r.method} ${r.route} ${fmt(r.ms)}`).join("; ") || "none"}.`,
    ],
  };

  // 2. Voice transcription failures
  const stt = ten.providers.filter((p) => p.provider === "sarvam" && p.capability === "speech_to_text");
  const sttFailures = stt.filter((p) => !p.ok);
  const voice: RuleResult = {
    firing: sttFailures.length >= 3 && sttFailures.length / Math.max(1, stt.length) >= 0.5,
    sufficientData: stt.length >= 3,
    controlledTest: sttFailures.some((p) => p.controlledTest),
    evidence: { window: "10 minutes", attempts: stt.length, failures: sttFailures.length, failure_codes: countBy(sttFailures, (p) => p.code), during_controlled_test: sttFailures.filter((p) => p.controlledTest).length },
    findings: [
      `${sttFailures.length} of ${stt.length} voice transcription attempt(s) failed in the last 10 minutes.`,
      `Failure codes: ${countBy(sttFailures, (p) => p.code)}.`,
      ...(sttFailures.some((p) => p.code === "auth") ? ["Sarvam rejected the API key: check SARVAM_API_KEY."] : []),
      ...(sttFailures.some((p) => p.code === "quota") ? ["Sarvam's rate limit or quota was reached."] : []),
      ...(sttFailures.some((p) => p.controlledTest) ? ["Some failures were injected by a controlled test and never reached Sarvam."] : []),
    ],
  };

  // 3. Storage health (a real probe, run now)
  const health = await circleRepository()
    .health()
    .catch((error: Error) => ({ ok: false, kind: "file" as const, detail: error.message.slice(0, 120), ms: 0 }));
  setGauge("festiva_storage_healthy", health.ok ? 1 : 0);
  setGauge("festiva_storage_probe_seconds", health.ms / 1000);
  const storage: RuleResult = {
    firing: !health.ok || health.ms > 1000,
    sufficientData: true,
    controlledTest: false,
    evidence: { store: health.kind, healthy: health.ok ? "yes" : "no", probe_ms: health.ms, detail: health.detail },
    findings: [`Storage (${health.kind}) health check: ${health.detail}, in ${fmt(health.ms)}.`],
  };

  // 4. API error rate
  const api = five.requests;
  const errors = api.filter((r) => r.status >= 500);
  const rate = api.length ? errors.length / api.length : 0;
  const errorRate: RuleResult = {
    firing: api.length >= 20 && rate >= 0.1,
    sufficientData: api.length >= 20,
    controlledTest: errors.some((r) => r.controlledTest),
    evidence: { window: "5 minutes", requests: api.length, server_errors: errors.length, error_rate_percent: Math.round(rate * 1000) / 10, by_route: countBy(errors, (r) => `${r.method} ${r.route} ${r.status}`) },
    findings: [`${errors.length} of ${api.length} API request(s) answered 5xx in the last 5 minutes (${(rate * 100).toFixed(1)}%).`, `By route: ${countBy(errors, (r) => `${r.method} ${r.route} ${r.status}`)}.`],
  };

  // 5. Preference processing
  const jobs = ten.processing.filter((p) => p.job === "structure_preference");
  const jobFailures = jobs.filter((p) => !p.ok);
  const processing: RuleResult = {
    firing: jobFailures.length >= 3,
    sufficientData: jobs.length >= 3,
    controlledTest: false,
    evidence: { window: "10 minutes", steps: jobs.length, failures: jobFailures.length, failure_codes: countBy(jobFailures, (p) => p.code) },
    findings: [`${jobFailures.length} of ${jobs.length} preference-structuring step(s) failed in the last 10 minutes. Each failure fell back to FESTIVA's rules, so no preference was lost.`, `Failure codes: ${countBy(jobFailures, (p) => p.code)}.`],
  };

  return { gift_circle_api_latency_high: latency, voice_transcription_failing: voice, storage_unhealthy: storage, api_error_rate_high: errorRate, preference_processing_failing: processing };
}

function toNudgeBee(event: OpsEvent, rule: RuleDefinition): NudgeBeeEvent {
  const prefix = event.controlledTest ? "FESTIVA: [Controlled test] " : "FESTIVA: ";
  return {
    id: event.id,
    fingerprint: `festiva:${rule.name}`,
    status: event.status,
    title: `${prefix}${rule.title}`,
    rule_name: rule.name,
    severity: rule.severity,
    description: [...event.findings, `Condition: ${rule.condition}.`].join(" ").slice(0, 2000),
    starts_at: event.startsAt,
    ...(event.endsAt ? { ends_at: event.endsAt } : {}),
    subject: { name: "festiva-web", type: "service" },
    source_tool: "FESTIVA",
    url: `${site.url}/admin/operations#event-${event.id}`,
    labels: {
      service: "festiva",
      component: rule.name.startsWith("voice") ? "voice-transcription" : rule.name.startsWith("storage") ? "storage" : "api",
      controlled_test: event.controlledTest ? "true" : "false",
      environment: process.env.NODE_ENV ?? "unknown",
    },
  };
}

let evaluating: Promise<OpsState> | null = null;

/** Evaluate every rule, record transitions, notify NudgeBee and propose runbooks. Safe to call often. */
export function runAlertCycle(now = Date.now()): Promise<OpsState> {
  if (evaluating) return evaluating;
  evaluating = (async () => {
    const results = await evaluateRules(now);
    const transitions: { event: OpsEvent; rule: RuleDefinition }[] = [];
    await updateJsonFile<OpsState, OpsState>(file(), EMPTY, (current) => {
      const next: OpsState = { active: { ...current.active }, events: [...current.events], lastEvaluatedAt: new Date(now).toISOString() };
      for (const rule of RULES) {
        const result = results[rule.name];
        const activeId = next.active[rule.name];
        if (result.firing && !activeId) {
          const event: OpsEvent = {
            id: randomUUID(),
            rule: rule.name,
            title: rule.title,
            severity: rule.severity,
            status: "firing",
            startsAt: new Date(now).toISOString(),
            endsAt: null,
            controlledTest: result.controlledTest,
            evidence: result.evidence,
            findings: result.findings,
            runbooks: rule.runbooks,
            deliveries: [],
          };
          next.events.push(event);
          next.active[rule.name] = event.id;
          transitions.push({ event, rule });
        } else if (result.firing && activeId) {
          // Keep the latest evidence on the open event.
          next.events = next.events.map((e) => (e.id === activeId ? { ...e, evidence: result.evidence, findings: result.findings, controlledTest: e.controlledTest || result.controlledTest } : e));
        } else if (!result.firing && activeId) {
          const resolved = next.events.find((e) => e.id === activeId);
          if (resolved) {
            const updated: OpsEvent = { ...resolved, status: "resolved", endsAt: new Date(now).toISOString() };
            next.events = next.events.map((e) => (e.id === activeId ? updated : e));
            transitions.push({ event: updated, rule });
          }
          delete next.active[rule.name];
        }
      }
      next.events = next.events.slice(-200);
      return { next, result: next };
    });

    for (const { event, rule } of transitions) {
      await audit({ actor: "festiva-alert-rules", action: `alert.${event.status}`, target: rule.name, outcome: "info", detail: event.controlledTest ? "During a controlled test scenario" : event.findings[0] ?? "" });
      if (event.status === "firing") {
        for (const runbook of rule.runbooks) await propose({ runbook, reason: `Proposed by FESTIVA's alert rule "${rule.title}"`, alertEventId: event.id, proposedBy: "festiva-alert-rules" });
      }
      const delivery = await sendEvent(toNudgeBee(event, rule), event.controlledTest);
      if (delivery.attempted) await audit({ actor: "festiva-alert-rules", action: "nudgebee.event_sent", target: rule.name, outcome: delivery.ok ? "ok" : "failed", detail: delivery.detail });
      await updateJsonFile<OpsState, null>(file(), EMPTY, (current) => ({
        next: { ...current, events: current.events.map((e) => (e.id === event.id ? { ...e, deliveries: [...e.deliveries, delivery].slice(-10) } : e)) },
        result: null,
      }));
    }
    return readJsonFile<OpsState>(file(), EMPTY);
  })().finally(() => {
    evaluating = null;
  });
  return evaluating;
}

export async function opsState(): Promise<OpsState> {
  return readJsonFile<OpsState>(file(), EMPTY);
}

/** Evaluate in the background every 30 seconds while the server runs. */
export function startAlertLoop(): void {
  const holder = globalThis as unknown as { __festivaAlertLoop?: ReturnType<typeof setInterval> };
  if (holder.__festivaAlertLoop || process.env.NODE_ENV === "test") return;
  holder.__festivaAlertLoop = setInterval(() => void runAlertCycle().catch(() => undefined), 30_000);
  holder.__festivaAlertLoop.unref?.();
}
