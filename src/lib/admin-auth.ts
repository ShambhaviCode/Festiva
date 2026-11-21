import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { serverEnv } from "./env.server";

/**
 * Administrator access for the integration status page and the operations centre.
 *
 * - Access requires FESTIVA_ADMIN_TOKEN (server-only, at least 24 characters).
 *   Without it, admin pages are closed to everyone.
 * - Signing in exchanges the token for an HttpOnly, SameSite=Strict session
 *   cookie signed with HMAC-SHA256. The token itself is never stored in the browser.
 * - Scripts may send `Authorization: Bearer <FESTIVA_ADMIN_TOKEN>` instead.
 * - State-changing admin requests must come from this site's own origin.
 *
 * Participants and organisers never have admin rights, so nobody using the
 * product can change global feature flags or run operational actions.
 */

export const ADMIN_COOKIE = "festiva_admin";
const SESSION_SECONDS = 8 * 60 * 60;

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function adminConfigured(): boolean {
  return Boolean(serverEnv().FESTIVA_ADMIN_TOKEN);
}

function sign(payload: string, token: string): string {
  return createHmac("sha256", `festiva-admin-session:${token}`).update(payload).digest("base64url");
}

export function checkAdminToken(candidate: string): boolean {
  const token = serverEnv().FESTIVA_ADMIN_TOKEN;
  return Boolean(token) && safeEqual(candidate, token!);
}

export function createAdminSession(now = Date.now()): { value: string; maxAge: number; sessionId: string } {
  const token = serverEnv().FESTIVA_ADMIN_TOKEN!;
  const sessionId = randomBytes(9).toString("base64url");
  const payload = `v1.${Math.floor(now / 1000) + SESSION_SECONDS}.${sessionId}`;
  return { value: `${payload}.${sign(payload, token)}`, maxAge: SESSION_SECONDS, sessionId };
}

/** Returns the session id for a valid session cookie value, or null. */
export function verifyAdminSession(value: string | undefined | null, now = Date.now()): string | null {
  const token = serverEnv().FESTIVA_ADMIN_TOKEN;
  if (!token || !value) return null;
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  const payload = parts.slice(0, 3).join(".");
  if (!safeEqual(parts[3], sign(payload, token))) return null;
  if (Number(parts[1]) * 1000 < now) return null;
  return parts[2];
}

function cookieValue(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export interface AdminActor {
  kind: "session" | "token";
  label: string;
}

/** Identify an admin request from its cookie or bearer token. */
export function adminFromRequest(request: Request): AdminActor | null {
  const header = request.headers.get("authorization") ?? "";
  const bearer = /^Bearer\s+(.+)$/.exec(header)?.[1];
  if (bearer && checkAdminToken(bearer)) return { kind: "token", label: "admin:token" };
  const session = verifyAdminSession(cookieValue(request, ADMIN_COOKIE));
  return session ? { kind: "session", label: `admin:${session}` } : null;
}

/** Cookie-authenticated writes must come from this origin (defence in depth on top of SameSite=Strict). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    return false;
  }
}

export function requireAdmin(request: Request, write = false): AdminActor | Response {
  if (!adminConfigured()) return Response.json({ error: "Admin access is not configured on this server." }, { status: 404, headers: { "cache-control": "no-store" } });
  const actor = adminFromRequest(request);
  if (!actor) return Response.json({ error: "Sign in as an administrator." }, { status: 401, headers: { "cache-control": "no-store" } });
  if (write && actor.kind === "session" && !sameOrigin(request)) return Response.json({ error: "Cross-site request refused." }, { status: 403, headers: { "cache-control": "no-store" } });
  return actor;
}
