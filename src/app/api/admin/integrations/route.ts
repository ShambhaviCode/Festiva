import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { z } from "zod";
import { LANGUAGES } from "@/domain/languages";
import { requireAdmin } from "@/lib/admin-auth";
import { experimentSummary } from "@/lib/circles/experiment";
import { aiStatus } from "@/lib/env.server";
import { FLAG_INFO, FLAG_KEYS, DEFAULT_CONFIG, REMOTE_CONFIG_KEY } from "@/lib/flags/definitions";
import { evaluateFlags, flagsmithState } from "@/lib/integrations/flagsmith";
import { listNudgeBeeEvents, nudgebeeConfig, nudgebeePrerequisites, sendEvent } from "@/lib/integrations/nudgebee";
import { getSarvam, sarvamConfig, SarvamError } from "@/lib/integrations/sarvam";
import { hasGenuineSuccess, statusBook } from "@/lib/integrations/status";
import { json, readJson } from "@/lib/http";
import { audit } from "@/lib/ops/audit";
import { instrument } from "@/lib/ops/telemetry";

/**
 * Integration status for administrators. Reports configuration *presence* and
 * the recorded outcome of real requests; never a key or token value.
 * "Connected" requires a genuine successful request, not just a configured key.
 */
export const GET = instrument("/api/admin/integrations", async (request: Request) => {
  await connection();
  const admin = requireAdmin(request);
  if (admin instanceof Response) return admin;
  const book = await statusBook();
  const sarvam = sarvamConfig();
  const flagsmith = flagsmithState();
  const nb = nudgebeeConfig();
  const evaluation = await evaluateFlags("admin-dashboard-probe");
  const sarvamLanguages = LANGUAGES.filter((l) => l.availability === "available");

  // A provider URL on localhost is a local test double (see tests/stubs), never the real service.
  const local = (url: string | null | undefined) => {
    if (!url) return false;
    try {
      return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname);
    } catch {
      return false;
    }
  };
  const state = (configured: boolean, capabilities: Record<string, { lastSuccess: unknown; last: { ok: boolean } | null }>) =>
    !configured ? "not_configured" : hasGenuineSuccess(capabilities as never) ? (Object.values(capabilities).some((c) => c.last && !c.last.ok) ? "degraded" : "connected") : "configured_unverified";

  return json({
    sarvam: {
      state: sarvam && local(sarvam.baseUrl) ? "test_stub" : state(Boolean(sarvam), book.sarvam),
      baseUrl: sarvam?.baseUrl ?? "https://api.sarvam.ai",
      models: sarvam ? { speechToText: sarvam.sttModel, translation: sarvam.translateModel, chat: sarvam.chatModel } : null,
      capabilities: [
        { id: "speech_to_text", label: "Speech to text", detail: `${sarvamLanguages.length} languages (22 Indian languages and Indian English); REST requests up to 30 seconds of audio` },
        { id: "translate", label: "Text translation", detail: "sarvam-translate:v1, formal mode, up to 2,000 characters, between the same 23 languages" },
        { id: "chat", label: "Preference structuring and cultural suggestions", detail: "sarvam-105b with JSON-schema output, validated before use" },
        { id: "text_to_speech", label: "Text to speech", detail: "Not used: it would not improve this experience" },
      ],
      languages: LANGUAGES.map((l) => ({ tag: l.tag, name: l.name, nativeName: l.nativeName, script: l.script, direction: l.direction, availability: l.availability })),
      status: book.sarvam,
    },
    flagsmith: {
      state: flagsmith.mode === "offline" ? "offline_document" : local(flagsmith.apiUrl) ? "test_stub" : state(Boolean(flagsmith.mode), book.flagsmith),
      ...flagsmith,
      evaluation: { source: evaluation.source, reason: evaluation.reason, evaluatedAt: evaluation.evaluatedAt, onboarding: evaluation.onboarding, config: evaluation.config, configIssues: evaluation.configIssues },
      flags: FLAG_KEYS.map((key) => ({ key, value: evaluation.flags[key], default: FLAG_INFO[key].default, controls: FLAG_INFO[key].controls, whenOff: FLAG_INFO[key].whenOff })),
      remoteConfig: { key: REMOTE_CONFIG_KEY, defaults: DEFAULT_CONFIG },
      experiment: await experimentSummary(),
      status: book.flagsmith,
    },
    nudgebee: {
      state: !nb.eventWebhookUrl && !nb.apiUrl ? "not_configured" : local(nb.eventWebhookUrl ?? nb.apiUrl) ? "test_stub" : state(true, book.nudgebee),
      configured: { eventWebhook: Boolean(nb.eventWebhookUrl), api: Boolean(nb.apiUrl && nb.apiToken) },
      appUrl: nb.appUrl,
      prerequisites: nudgebeePrerequisites(),
      status: book.nudgebee,
    },
    ai: aiStatus(),
  });
});

const actionSchema = z.object({ action: z.enum(["test_sarvam", "test_flagsmith", "test_nudgebee_webhook", "list_nudgebee_events"]) });

/** Run a genuine connection test. Each test is one small, real request to the provider. */
export const POST = instrument("/api/admin/integrations", async (request: Request) => {
  const admin = requireAdmin(request, true);
  if (admin instanceof Response) return admin;
  const body = await readJson(request, actionSchema, 500);
  if ("response" in body) return body.response;
  const { action } = body.data;
  let result: { ok: boolean; detail: string; data?: unknown };

  if (action === "test_sarvam") {
    const sarvam = getSarvam();
    if (!sarvam) result = { ok: false, detail: "Sarvam is not configured: set SARVAM_API_KEY." };
    else {
      try {
        const translation = await sarvam.translate("Happy Diwali to everyone in the family.", "en-IN", "hi-IN");
        result = { ok: true, detail: `Sarvam translated a test sentence with ${translation.model}.`, data: { output: translation.text, requestId: translation.requestId } };
      } catch (error) {
        result = { ok: false, detail: error instanceof SarvamError ? error.message : "Sarvam test failed." };
      }
    }
  } else if (action === "test_flagsmith") {
    const evaluation = await evaluateFlags(`admin-test-${randomUUID()}`);
    result = { ok: evaluation.source !== "defaults", detail: evaluation.source === "defaults" ? evaluation.reason ?? "Defaults in use" : `Flags evaluated from ${evaluation.source === "flagsmith" ? "Flagsmith" : "the offline environment document"}.`, data: evaluation.flags };
  } else if (action === "test_nudgebee_webhook") {
    const id = `festiva-integration-test-${randomUUID()}`;
    const base = { id, fingerprint: "festiva:integration_test", title: "FESTIVA: [Controlled test] Integration test event", rule_name: "festiva_integration_test", severity: "info" as const, subject: { name: "festiva-web", type: "service" }, source_tool: "FESTIVA", labels: { service: "festiva", controlled_test: "true" } };
    const firing = await sendEvent({ ...base, status: "firing", starts_at: new Date().toISOString(), description: "Sent from FESTIVA's integration page to check the Event Webhook. Safe to ignore." }, true);
    const resolved = firing.ok ? await sendEvent({ ...base, status: "resolved", ends_at: new Date().toISOString() }, true) : null;
    result = { ok: firing.ok && Boolean(resolved?.ok), detail: [firing.detail, resolved?.detail].filter(Boolean).join(" Then: ") };
  } else {
    const events = await listNudgeBeeEvents();
    result = { ok: events.ok, detail: events.detail, data: events.rows };
  }
  await audit({ actor: admin.label, action: `integration.${action}`, target: action.split("_")[1], outcome: result.ok ? "ok" : "failed", detail: result.detail });
  return json(result, 200);
});
