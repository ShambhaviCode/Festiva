import { connection } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { circleRepository } from "@/lib/circles/repository";
import { nudgebeeConfig } from "@/lib/integrations/nudgebee";
import { json, readJson } from "@/lib/http";
import { RULES, runAlertCycle } from "@/lib/ops/alerts";
import { audit, auditLog } from "@/lib/ops/audit";
import { changeControls, getControls } from "@/lib/ops/controls";
import { percentile, samples } from "@/lib/ops/metrics";
import { ApprovalError, decide, propose, proposals, RUNBOOK_IDS, RUNBOOKS } from "@/lib/ops/runbooks";
import { instrument } from "@/lib/ops/telemetry";

async function recheckStorage(): Promise<string> {
  const health = await circleRepository().health();
  return `Storage (${health.kind}) ${health.ok ? "healthy" : "unhealthy"}: ${health.detail} in ${health.ms} ms.`;
}

/** Operations centre data: live telemetry summary, alerts, proposals, controls and the audit trail. */
export const GET = instrument("/api/admin/ops", async (request: Request) => {
  await connection();
  const admin = requireAdmin(request);
  if (admin instanceof Response) return admin;
  const state = await runAlertCycle();
  const window = samples(15 * 60_000);
  const circle = window.requests.filter((r) => r.route.startsWith("/api/circles"));
  const stt = window.providers.filter((p) => p.provider === "sarvam" && p.capability === "speech_to_text");
  const nb = nudgebeeConfig();
  return json({
    telemetry: {
      window: "15 minutes",
      requests: window.requests.length,
      serverErrors: window.requests.filter((r) => r.status >= 500).length,
      circleRequests: circle.length,
      circleP95Ms: percentile(circle.map((r) => r.ms), 95),
      voiceAttempts: stt.length,
      voiceFailures: stt.filter((p) => !p.ok).length,
      processingFailures: window.processing.filter((p) => !p.ok).length,
      controlledTestSamples: window.requests.filter((r) => r.controlledTest).length + window.providers.filter((p) => p.controlledTest).length,
    },
    rules: RULES,
    active: state.active,
    events: [...state.events].reverse().slice(0, 50),
    lastEvaluatedAt: state.lastEvaluatedAt,
    proposals: await proposals(50),
    runbooks: RUNBOOKS,
    controls: await getControls(),
    audit: await auditLog(100),
    nudgebee: { eventWebhook: Boolean(nb.eventWebhookUrl), appUrl: nb.appUrl },
  });
});

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("evaluate") }),
  z.object({ action: z.literal("start_test"), scenario: z.enum(["latency", "voice_failures"]), confirm: z.literal(true) }),
  z.object({ action: z.literal("propose"), runbook: z.enum(RUNBOOK_IDS), reason: z.string().trim().min(5).max(300) }),
  z.object({ action: z.literal("decide"), proposalId: z.string().uuid(), approve: z.boolean(), note: z.string().trim().max(300) }),
]);

export const POST = instrument("/api/admin/ops", async (request: Request) => {
  const admin = requireAdmin(request, true);
  if (admin instanceof Response) return admin;
  const body = await readJson(request, actionSchema, 2_000);
  if ("response" in body) return body.response;
  const input = body.data;

  if (input.action === "evaluate") {
    const state = await runAlertCycle();
    return json({ ok: true, active: state.active });
  }
  if (input.action === "start_test") {
    const until = new Date(Date.now() + 10 * 60_000).toISOString();
    await changeControls((c) => ({
      ...c,
      tests:
        input.scenario === "latency"
          ? { ...c.tests, latency: { addMs: 1800, until, startedBy: admin.label } }
          : { ...c.tests, voiceFailures: { remaining: 5, until, startedBy: admin.label } },
    }));
    await audit({
      actor: admin.label,
      action: "controlled_test.started",
      target: input.scenario,
      outcome: "ok",
      detail: input.scenario === "latency" ? "Adds 1.8 s to every Gift Circle API request for up to 10 minutes" : "Fails the next 5 voice requests before they reach Sarvam, for up to 10 minutes",
    });
    return json({ ok: true, until });
  }
  if (input.action === "propose") {
    const proposal = await propose({ runbook: input.runbook, reason: input.reason, proposedBy: admin.label });
    return json({ ok: true, proposal }, 201);
  }
  try {
    const proposal = await decide(input.proposalId, input.approve, input.note, admin.label, recheckStorage);
    return json({ ok: true, proposal });
  } catch (error) {
    if (error instanceof ApprovalError) return json({ error: error.message }, 400);
    throw error;
  }
});
