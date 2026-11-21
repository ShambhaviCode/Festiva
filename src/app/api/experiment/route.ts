import { z } from "zod";
import { recordExperimentEvent } from "@/lib/circles/experiment";
import { experimentId, flagsFor, limit } from "@/lib/circles/service";
import { readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

const bodySchema = z.object({ name: z.literal("onboarding_started"), variant: z.enum(["guided", "single_page"]) });

/**
 * The browser reports only one event itself: that onboarding started. Every
 * later step is recorded by the server when it actually happens.
 * The variant is taken from the server's own flag evaluation, not trusted from the browser.
 */
export const POST = instrument("/api/experiment", async (request: Request) => {
  const limited = limit(request, "experiment", 30, 60_000);
  if (limited) return limited;
  const body = await readJson(request, bodySchema, 500);
  if ("response" in body) return new Response(null, { status: 400 });
  const anon = experimentId(request);
  if (!anon) return new Response(null, { status: 204 });
  const flags = await flagsFor(request);
  if (flags.onboarding.inExperiment && flags.onboarding.variant === body.data.variant) {
    await recordExperimentEvent({ name: "onboarding_started", variant: flags.onboarding.variant, assignedBy: flags.onboarding.assignedBy, anonymousId: anon, circleId: null, ms: null });
  }
  return new Response(null, { status: 204 });
});
