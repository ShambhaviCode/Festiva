import { z } from "zod";
import { serverEnv, type ServerEnv } from "../env.server";
import { recordProviderCall } from "../ops/metrics";
import { recordAttempt } from "./status";

/**
 * NudgeBeeIntegration: FESTIVA's connection to NudgeBee, an AI SRE / CloudOps
 * platform. FESTIVA uses only interfaces documented at docs.nudgebee.com
 * (nudgebee/nudgebee-docs, checked 17 November 2026):
 *
 * 1. Event Webhook, `POST https://<nudgebee-domain>/api/webhooks/event`,
 *    `Authorization: Bearer <token>`, JSON in NudgeBee's documented format.
 *    FESTIVA sends an event when one of its alert rules fires or resolves;
 *    NudgeBee then creates, enriches and triages the event.
 * 2. GraphQL API, `POST https://<nudgebee-domain>/api/graphql` with a Platform
 *    API token (`sk-nb-…`), read-only use of the `events_list` action, so the
 *    operations centre can show what NudgeBee recorded.
 *
 * The Prometheus metrics endpoint and alert rules in /ops are the path for a
 * NudgeBee agent running alongside FESTIVA in Kubernetes.
 *
 * NudgeBee is never asked to change FESTIVA directly. A NudgeBee workflow may
 * *propose* a FESTIVA runbook (see /api/ops/runbook-proposals); a FESTIVA
 * administrator must approve it before anything runs.
 */

export interface NudgeBeeConfig {
  eventWebhookUrl: string | null;
  eventWebhookToken: string | null;
  apiUrl: string | null;
  apiToken: string | null;
  appUrl: string | null;
}

export function nudgebeeConfig(env: ServerEnv = serverEnv()): NudgeBeeConfig {
  return {
    eventWebhookUrl: env.NUDGEBEE_EVENT_WEBHOOK_URL ?? null,
    eventWebhookToken: env.NUDGEBEE_EVENT_WEBHOOK_TOKEN ?? null,
    apiUrl: env.NUDGEBEE_API_URL?.replace(/\/$/, "") ?? null,
    apiToken: env.NUDGEBEE_API_TOKEN ?? null,
    appUrl: (env.NUDGEBEE_APP_URL ?? env.NUDGEBEE_API_URL)?.replace(/\/$/, "") ?? null,
  };
}

/** Body of one alert, exactly as NudgeBee's Event Webhook documents it. */
export interface NudgeBeeEvent {
  id: string;
  fingerprint: string;
  status: "firing" | "resolved";
  title: string;
  rule_name: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  description?: string;
  starts_at?: string;
  ends_at?: string;
  subject?: { name: string; type?: string; namespace?: string };
  source_tool?: string;
  url?: string;
  labels?: Record<string, string>;
}

export function webhookIssues(config: NudgeBeeConfig): string[] {
  const issues: string[] = [];
  if (!config.eventWebhookUrl) return issues;
  const url = new URL(config.eventWebhookUrl);
  if (!/\/api\/webhooks\/event$/.test(url.pathname)) issues.push("The Event Webhook URL should end in /api/webhooks/event (copy it from Admin > Integrations > Webhooks > Event Webhook).");
  if (!config.eventWebhookToken && !url.searchParams.has("token")) issues.push("No webhook token: set NUDGEBEE_EVENT_WEBHOOK_TOKEN.");
  if (url.searchParams.has("token")) issues.push("The token is in the URL. NudgeBee also accepts it as a Bearer header; prefer NUDGEBEE_EVENT_WEBHOOK_TOKEN so it stays out of logs.");
  return issues;
}

export function validateEvent(event: NudgeBeeEvent): string[] {
  const problems: string[] = [];
  for (const key of ["id", "fingerprint", "rule_name"] as const) {
    if (!event[key] || event[key].length > 256) problems.push(`${key} must be 1–256 characters`);
    if (/[\u0000-\u001f]/.test(event[key] ?? "")) problems.push(`${key} must not contain control characters`);
  }
  if (!event.title) problems.push("title is required");
  if (event.starts_at && event.ends_at && event.ends_at < event.starts_at) problems.push("ends_at must not be before starts_at");
  for (const [key, value] of Object.entries(event.labels ?? {})) {
    if (key.startsWith("nb_")) problems.push(`label ${key} uses the reserved nb_ prefix`);
    if (typeof value !== "string") problems.push(`label ${key} must be a string`);
  }
  return problems;
}

export interface DeliveryResult {
  attempted: boolean;
  ok: boolean;
  httpStatus: number | null;
  detail: string;
  at: string;
}

export async function sendEvent(event: NudgeBeeEvent, controlledTest: boolean, env: ServerEnv = serverEnv(), fetchImpl: typeof fetch = fetch): Promise<DeliveryResult> {
  const config = nudgebeeConfig(env);
  const at = new Date().toISOString();
  if (!config.eventWebhookUrl) return { attempted: false, ok: false, httpStatus: null, detail: "NudgeBee Event Webhook is not configured", at };
  const problems = validateEvent(event);
  if (problems.length) return { attempted: false, ok: false, httpStatus: null, detail: `Event not sent: ${problems.join("; ")}`, at };

  const started = performance.now();
  let httpStatus: number | null = null;
  let detail: string;
  let ok = false;
  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (config.eventWebhookToken) headers.authorization = `Bearer ${config.eventWebhookToken}`;
    const response = await fetchImpl(config.eventWebhookUrl, { method: "POST", headers, body: JSON.stringify(event), signal: AbortSignal.timeout(8000) });
    httpStatus = response.status;
    ok = response.ok;
    if (ok) detail = `Accepted by NudgeBee (HTTP ${response.status})`;
    else {
      let reason = "";
      try {
        const body = (await response.json()) as { message?: string; errors?: { field?: string; reason?: string }[] };
        reason = [body.message, ...(body.errors ?? []).map((e) => `${e.field}: ${e.reason}`)].filter(Boolean).join("; ");
      } catch {
        reason = "";
      }
      detail = `NudgeBee answered HTTP ${response.status}${reason ? `: ${reason.slice(0, 160)}` : ""}`;
    }
  } catch (error) {
    detail = (error as Error).name === "TimeoutError" ? "NudgeBee did not answer within 8 seconds" : "NudgeBee could not be reached";
  }
  const ms = Math.round(performance.now() - started);
  recordProviderCall({ provider: "nudgebee", capability: "event_webhook", ok, code: ok ? "ok" : httpStatus ? `http_${httpStatus}` : "network", ms, controlledTest: false });
  await recordAttempt("nudgebee", "event_webhook", { ok, detail, httpStatus, ms, model: null, controlledTest });
  return { attempted: true, ok, httpStatus, detail, at };
}

const eventRow = z
  .object({
    id: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    priority: z.string().nullable().optional(),
    nb_status: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    starts_at: z.string().nullable().optional(),
    ends_at: z.string().nullable().optional(),
    fingerprint: z.string().nullable().optional(),
    evidences: z.string().nullable().optional(),
  })
  .passthrough();

const graphqlResponse = z.object({
  data: z.object({ events_list: z.object({ rows: z.array(eventRow).nullable() }).nullable() }).nullable().optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export type NudgeBeeEventRow = z.infer<typeof eventRow>;

export const EVENTS_QUERY = `query FestivaEvents {
  events_list(
    where: { title: { _ilike: "FESTIVA:%" } }
    limit: 20
    order_by: [{ column: "created_at", order: desc }]
  ) {
    rows { id title status priority nb_status created_at starts_at ends_at fingerprint evidences }
  }
}`;

/** Read FESTIVA's events back from NudgeBee (read-only). */
export async function listNudgeBeeEvents(env: ServerEnv = serverEnv(), fetchImpl: typeof fetch = fetch): Promise<{ ok: boolean; rows: NudgeBeeEventRow[]; detail: string }> {
  const config = nudgebeeConfig(env);
  if (!config.apiUrl || !config.apiToken) return { ok: false, rows: [], detail: "NudgeBee API is not configured" };
  const started = performance.now();
  let ok = false;
  let detail = "";
  let rows: NudgeBeeEventRow[] = [];
  let httpStatus: number | null = null;
  try {
    const response = await fetchImpl(`${config.apiUrl}/api/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.apiToken}` },
      body: JSON.stringify({ query: EVENTS_QUERY }),
      signal: AbortSignal.timeout(8000),
    });
    httpStatus = response.status;
    const parsed = graphqlResponse.safeParse(await response.json().catch(() => null));
    if (!response.ok) detail = `NudgeBee API answered HTTP ${response.status}`;
    else if (!parsed.success) detail = "NudgeBee API returned an unexpected shape";
    else if (parsed.data.errors?.length) detail = `NudgeBee API error: ${parsed.data.errors.map((e) => e.message).join("; ").slice(0, 200)}`;
    else {
      ok = true;
      rows = parsed.data.data?.events_list?.rows ?? [];
      detail = `${rows.length} FESTIVA event(s) returned by NudgeBee`;
    }
  } catch {
    detail = "NudgeBee API could not be reached";
  }
  const ms = Math.round(performance.now() - started);
  recordProviderCall({ provider: "nudgebee", capability: "graphql_events", ok, code: ok ? "ok" : httpStatus ? `http_${httpStatus}` : "network", ms, controlledTest: false });
  await recordAttempt("nudgebee", "graphql_events", { ok, detail, httpStatus, ms, model: null });
  return { ok, rows, detail };
}

export interface Prerequisite {
  label: string;
  met: boolean | null;
  detail: string;
}

/** What NudgeBee needs, checked from what this server can actually observe. */
export function nudgebeePrerequisites(env: ServerEnv = serverEnv()): Prerequisite[] {
  const config = nudgebeeConfig(env);
  const inKubernetes = Boolean(process.env.KUBERNETES_SERVICE_HOST);
  return [
    {
      label: "A NudgeBee server (NudgeBee Cloud, or the self-hosted Community edition on Kubernetes)",
      met: config.eventWebhookUrl || config.apiUrl ? null : false,
      detail: config.eventWebhookUrl || config.apiUrl ? "A NudgeBee address is configured; reachability is shown by the last request below." : "No NudgeBee address configured.",
    },
    {
      label: "Event Webhook integration created in NudgeBee (Admin > Integrations > Webhooks > Event Webhook)",
      met: config.eventWebhookUrl ? (webhookIssues(config).length === 0 ? true : null) : false,
      detail: config.eventWebhookUrl ? webhookIssues(config).join(" ") || "URL and token configured." : "Set NUDGEBEE_EVENT_WEBHOOK_URL and NUDGEBEE_EVENT_WEBHOOK_TOKEN.",
    },
    {
      label: "Read-only NudgeBee API token for showing NudgeBee's events here (optional)",
      met: Boolean(config.apiUrl && config.apiToken),
      detail: config.apiUrl && config.apiToken ? "Configured." : "Set NUDGEBEE_API_URL and NUDGEBEE_API_TOKEN (a Platform token limited to Events).",
    },
    {
      label: "Prometheus-format metrics exposed for scraping",
      met: Boolean(env.FESTIVA_METRICS_TOKEN),
      detail: env.FESTIVA_METRICS_TOKEN ? "GET /api/ops/metrics with the bearer token." : "Set FESTIVA_METRICS_TOKEN to allow scraping of /api/ops/metrics.",
    },
    {
      label: "FESTIVA running in a Kubernetes cluster watched by the NudgeBee agent (needed for NudgeBee's own infrastructure telemetry)",
      met: inKubernetes,
      detail: inKubernetes ? "KUBERNETES_SERVICE_HOST is set: this process runs in Kubernetes." : "This process is not running in Kubernetes, so NudgeBee's agent cannot observe its pods. Alerts still reach NudgeBee through the Event Webhook.",
    },
    {
      label: "Runbook proposals from NudgeBee workflows (optional)",
      met: Boolean(env.FESTIVA_OPS_WEBHOOK_TOKEN),
      detail: env.FESTIVA_OPS_WEBHOOK_TOKEN ? "A NudgeBee HTTP task can propose runbooks to POST /api/ops/runbook-proposals." : "Set FESTIVA_OPS_WEBHOOK_TOKEN to let a NudgeBee workflow propose (never run) a FESTIVA runbook.",
    },
  ];
}
