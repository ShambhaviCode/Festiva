/**
 * Fixed-window, in-memory rate limiter.
 * Good enough for a single server instance. On serverless platforms each
 * instance keeps its own counters, so production deployments should back this
 * with a shared store (see docs/KNOWN_LIMITATIONS.md).
 */
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_KEYS = 5000;

export interface RateResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): RateResult {
  let entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    if (windows.size >= MAX_KEYS) {
      for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
      // Still full of live windows: drop the oldest tenth rather than clearing everything,
      // so flooding the table with new keys cannot reset everyone else's limits.
      if (windows.size >= MAX_KEYS) {
        let drop = Math.ceil(MAX_KEYS / 10);
        for (const k of windows.keys()) {
          if (drop-- <= 0) break;
          windows.delete(k);
        }
      }
    }
    entry = { count: 0, resetAt: now + windowMs };
    windows.set(key, entry);
  }
  entry.count += 1;
  const ok = entry.count <= limit;
  return { ok, remaining: Math.max(0, limit - entry.count), retryAfterSeconds: ok ? 0 : Math.ceil((entry.resetAt - now) / 1000) };
}

export function resetRateLimits(): void {
  windows.clear();
}

/**
 * Derive a coarse client key. The address is used only as a counter key and is never logged or stored.
 *
 * Which header to trust depends on what sits in front of the app (FESTIVA_TRUST_PROXY):
 *   - "vercel" (the default when VERCEL is set): x-real-ip, which Vercel sets itself;
 *   - "1" (the default otherwise): the last x-forwarded-for entry, added by one reverse proxy;
 *   - "none": ignore client headers entirely and share one counter per scope (strictest).
 * The first x-forwarded-for entry is never used, because a client can write anything there.
 */
export function clientKey(request: Request, scope: string, mode: string | undefined = process.env.FESTIVA_TRUST_PROXY ?? (process.env.VERCEL ? "vercel" : "1")): string {
  let address: string | undefined;
  if (mode === "vercel") address = request.headers.get("x-real-ip")?.trim() || undefined;
  else if (mode !== "none") {
    const hops = request.headers.get("x-forwarded-for")?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];
    address = hops[hops.length - 1] || request.headers.get("x-real-ip")?.trim() || undefined;
  }
  return `${scope}:${address ?? "shared"}`;
}
