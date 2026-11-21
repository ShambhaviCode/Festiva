import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { serverEnv } from "@/lib/env.server";
import { json, readJson } from "@/lib/http";
import { propose, RUNBOOK_IDS } from "@/lib/ops/runbooks";
import { instrument } from "@/lib/ops/telemetry";

const bodySchema = z.object({
  runbook: z.enum(RUNBOOK_IDS),
  reason: z.string().trim().min(5).max(300),
  nudgebee_event_id: z.string().trim().max(120).optional(),
});

/**
 * Inbound endpoint for a NudgeBee workflow's HTTP task (`integrations.http`,
 * auth_type bearer). It can only *propose* one of FESTIVA's predefined
 * runbooks. The proposal then waits for a FESTIVA administrator to approve it;
 * this token cannot approve or execute anything.
 */
export const POST = instrument("/api/ops/runbook-proposals", async (request: Request) => {
  const expected = serverEnv().FESTIVA_OPS_WEBHOOK_TOKEN;
  if (!expected) return json({ error: "Runbook proposals are not enabled on this server." }, 404);
  const given = /^Bearer\s+(.+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return json({ error: "Invalid token." }, 401);
  const body = await readJson(request, bodySchema, 2_000);
  if ("response" in body) return body.response;
  const proposal = await propose({ runbook: body.data.runbook, reason: body.data.reason, externalReference: body.data.nudgebee_event_id ?? null, proposedBy: "nudgebee-workflow" });
  return json({ id: proposal.id, status: "pending_approval", message: "Proposal recorded. A FESTIVA administrator must approve it before anything runs." }, 202);
});
