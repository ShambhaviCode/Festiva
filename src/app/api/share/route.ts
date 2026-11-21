import { z } from "zod";
import { planSchema } from "@/domain/matchmaker/schema";
import { bearer, json, readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { demoStore, shareMode, supabaseStore } from "@/lib/share-store";

const bodySchema = z.object({ plan: planSchema });

/** Create a share link for a plan snapshot. Explicit, revocable, and token-addressed. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "share"), 20, 10 * 60_000);
  if (!limit.ok) return json({ error: "Too many share links created. Try again shortly." }, 429, { "retry-after": String(limit.retryAfterSeconds) });

  const body = await readJson(request, bodySchema);
  if ("response" in body) return body.response;

  if (shareMode === "supabase") {
    const token = bearer(request);
    if (!token) return json({ error: "Sign in to share a plan." }, 401);
    const result = await supabaseStore.create(body.data.plan, token);
    if ("error" in result) return json({ error: result.error === "unauthorised" ? "Sign in to share a plan." : "The share could not be saved." }, result.error === "unauthorised" ? 401 : 502);
    return json({ token: result.token, mode: "supabase" }, 201);
  }

  const { token, revokeKey } = demoStore.create(body.data.plan);
  return json({ token, revokeKey, mode: "demo" }, 201);
}
