import { bearer, json } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { demoStore, shareMode, supabaseStore, TOKEN_PATTERN } from "@/lib/share-store";

/** Revoke a share link. Only its creator can: by account in Supabase mode, by the revoke key in demo mode. */
export async function DELETE(request: Request, context: { params: Promise<{ token: string }> }) {
  const limit = rateLimit(clientKey(request, "share-revoke"), 40, 10 * 60_000);
  if (!limit.ok) return json({ error: "Too many requests." }, 429, { "retry-after": String(limit.retryAfterSeconds) });
  const { token } = await context.params;
  if (!TOKEN_PATTERN.test(token)) return json({ error: "Not found." }, 404);

  if (shareMode === "supabase") {
    const access = bearer(request);
    if (!access) return json({ error: "Sign in to revoke this link." }, 401);
    return (await supabaseStore.revoke(token, access)) ? json({ revoked: true }) : json({ error: "Not found." }, 404);
  }

  const key = request.headers.get("x-revoke-key") ?? "";
  if (!TOKEN_PATTERN.test(key)) return json({ error: "A revoke key is required." }, 403);
  return demoStore.revoke(token, key) ? json({ revoked: true }) : json({ error: "Not found." }, 404);
}
