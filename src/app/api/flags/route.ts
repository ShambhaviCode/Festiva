import { connection } from "next/server";
import { flagsFor } from "@/lib/circles/service";
import { json } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

/**
 * Evaluated feature flags for this visitor. Returns booleans, validated
 * configuration and the onboarding variant only; no keys and no Flagsmith
 * environment details. The browser re-fetches this every few seconds, so a
 * change in Flagsmith shows up without a reload or a redeploy.
 */
export const GET = instrument("/api/flags", async (request: Request) => {
  await connection();
  const evaluation = await flagsFor(request);
  return json({
    flags: evaluation.flags,
    config: evaluation.config,
    onboarding: evaluation.onboarding,
    source: evaluation.source,
    evaluatedAt: evaluation.evaluatedAt,
  });
});
