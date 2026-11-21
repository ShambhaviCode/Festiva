import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { adminFromRequest } from "@/lib/admin-auth";
import { serverEnv } from "@/lib/env.server";
import { runAlertCycle } from "@/lib/ops/alerts";
import { renderPrometheus } from "@/lib/ops/metrics";

function tokenMatches(request: Request): boolean {
  const expected = serverEnv().FESTIVA_METRICS_TOKEN;
  const given = /^Bearer\s+(.+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Prometheus scrape endpoint. Requires `Authorization: Bearer <FESTIVA_METRICS_TOKEN>`
 * (or an admin session). Contains no personal data: route templates, status
 * classes, provider outcome codes, durations and counts only.
 */
export async function GET(request: Request) {
  await connection();
  if (!tokenMatches(request) && !adminFromRequest(request)) {
    return new Response("Metrics require a bearer token.\n", { status: 401, headers: { "content-type": "text/plain", "cache-control": "no-store" } });
  }
  // Refresh storage gauges and alert state on each scrape.
  await runAlertCycle().catch(() => undefined);
  return new Response(renderPrometheus(), { headers: { "content-type": "text/plain; version=0.0.4; charset=utf-8", "cache-control": "no-store" } });
}
