import { z } from "zod";
import { ADMIN_COOKIE, adminConfigured, adminFromRequest, checkAdminToken, createAdminSession, sameOrigin } from "@/lib/admin-auth";
import { json, readJson } from "@/lib/http";
import { audit } from "@/lib/ops/audit";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ token: z.string().min(1).max(512) });

function cookie(value: string, maxAge: number, request: Request): string {
  const secure = new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  return `${ADMIN_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

/** Sign in as an administrator with FESTIVA_ADMIN_TOKEN. */
export async function POST(request: Request) {
  if (!adminConfigured()) return json({ error: "Admin access is not configured on this server. Set FESTIVA_ADMIN_TOKEN." }, 404);
  if (!sameOrigin(request)) return json({ error: "Cross-site request refused." }, 403);
  const limited = rateLimit(clientKey(request, "admin-login"), 5, 15 * 60_000);
  if (!limited.ok) return json({ error: "Too many attempts. Wait and try again." }, 429, { "retry-after": String(limited.retryAfterSeconds) });
  const body = await readJson(request, bodySchema, 1_000);
  if ("response" in body) return body.response;
  if (!checkAdminToken(body.data.token)) {
    await audit({ actor: "anonymous", action: "admin.sign_in", target: "admin", outcome: "rejected", detail: "Wrong token" });
    return json({ error: "That token is not correct." }, 401);
  }
  const session = createAdminSession();
  await audit({ actor: `admin:${session.sessionId}`, action: "admin.sign_in", target: "admin", outcome: "ok", detail: "Signed in" });
  return json({ ok: true }, 200, { "set-cookie": cookie(session.value, session.maxAge, request) });
}

export async function DELETE(request: Request) {
  const actor = adminFromRequest(request);
  if (actor) await audit({ actor: actor.label, action: "admin.sign_out", target: "admin", outcome: "ok", detail: "Signed out" });
  return new Response(null, { status: 204, headers: { "set-cookie": cookie("", 0, request), "cache-control": "no-store" } });
}
