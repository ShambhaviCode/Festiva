import { randomUUID } from "node:crypto";
import { CircleError, type Ids } from "@/domain/circle/engine";
import type { Circle, Participant } from "@/domain/circle/schema";
import type { FlagKey } from "../flags/definitions";
import { evaluateFlags, type Evaluation } from "../integrations/flagsmith";
import { json } from "../http";
import { clientKey, rateLimit } from "../rate-limit";
import { circleRepository, hashSecret, newSecret, NotFoundError, secretMatches, SECRET_PATTERN, UUID_PATTERN, type CircleRecord } from "./repository";

/**
 * Shared plumbing for the Gift Circle API routes: identifying the caller,
 * enforcing feature flags on the server, rate limits, and consistent errors.
 *
 * Callers authenticate with `Authorization: Bearer <key>`, where the key is
 * the organiser key or a participant key issued once by this server. Keys are
 * compared by hash in constant time.
 */

export const ids: Ids = { next: () => randomUUID() };

export function fail(status: number, code: string, message: string): Response {
  return json({ error: message, code }, status);
}

const ANON_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

/** The browser's random, anonymous identifier, used only for flag evaluation and experiment counts. */
export function anonymousId(request: Request): string | null {
  const value = request.headers.get("x-festiva-anon");
  return value && ANON_PATTERN.test(value) ? value : null;
}

/**
 * The identifier used for experiment counts, or null when the browser asks not
 * to be tracked (Do Not Track or Global Privacy Control). Flags still evaluate.
 */
export function experimentId(request: Request): string | null {
  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return null;
  return anonymousId(request);
}

export async function flagsFor(request: Request): Promise<Evaluation> {
  return evaluateFlags(anonymousId(request));
}

/** Server-side flag enforcement: the UI hides disabled features, and the API refuses them too. */
export function requireFlag(flags: Evaluation, key: FlagKey): Response | null {
  return flags.flags[key] ? null : fail(403, "feature_disabled", `This feature is switched off (${key}).`);
}

export function limit(request: Request, scope: string, max: number, windowMs: number): Response | null {
  const result = rateLimit(clientKey(request, scope), max, windowMs);
  return result.ok ? null : json({ error: "Too many requests. Wait a moment and try again.", code: "rate_limited" }, 429, { "retry-after": String(result.retryAfterSeconds) });
}

export interface Caller {
  record: CircleRecord;
  participant: Participant;
  role: "organiser" | "participant";
}

function bearerKey(request: Request): string | null {
  const match = /^Bearer\s+([A-Za-z0-9_-]{24,64})$/.exec(request.headers.get("authorization") ?? "");
  return match ? match[1] : null;
}

export function identify(record: CircleRecord, key: string | null): Caller | null {
  if (!key || !SECRET_PATTERN.test(key)) return null;
  if (secretMatches(key, record.secrets.organiserKeyHash)) {
    const organiser = record.circle.participants.find((p) => p.role === "organiser");
    return organiser ? { record, participant: organiser, role: "organiser" } : null;
  }
  for (const [participantId, hash] of Object.entries(record.secrets.participantKeyHashes)) {
    if (secretMatches(key, hash)) {
      const participant = record.circle.participants.find((p) => p.id === participantId);
      if (participant) return { record, participant, role: participant.role };
    }
  }
  return null;
}

/** Load a circle and identify the caller, or produce the right error response. */
export async function authorise(request: Request, circleId: string, options: { organiserOnly?: boolean } = {}): Promise<Caller | Response> {
  if (!UUID_PATTERN.test(circleId)) return fail(404, "not_found", "This circle does not exist.");
  const record = await circleRepository().get(circleId);
  if (!record) return fail(404, "not_found", "This circle does not exist or has been deleted.");
  const caller = identify(record, bearerKey(request));
  if (!caller) {
    // Slow down anyone trying keys: 30 failed attempts a minute per client, then 429.
    const tooMany = limit(request, "circle-auth-failures", 30, 60_000);
    return tooMany ?? fail(401, "unauthorised", "This device does not have access to this circle.");
  }
  if (options.organiserOnly && caller.role !== "organiser") return fail(403, "forbidden", "Only the organiser can do this.");
  return caller;
}

/** Apply a change to a circle atomically, translating domain errors into responses. */
export async function mutate<R>(circleId: string, change: (record: CircleRecord) => { record: CircleRecord; result: R }): Promise<R | Response> {
  try {
    return await circleRepository().update(circleId, change);
  } catch (error) {
    if (error instanceof CircleError) {
      const status = error.code === "not_found" ? 404 : error.code === "forbidden" ? 403 : error.code === "circle_full" || error.code === "duplicate_name" ? 409 : 400;
      return fail(status, error.code, error.message);
    }
    if (error instanceof NotFoundError) return fail(404, "not_found", "This circle does not exist or has been deleted.");
    throw error;
  }
}

export const withCircle = (record: CircleRecord, circle: Circle): CircleRecord => ({ ...record, circle });

export function newKey(): { key: string; hash: string } {
  const key = newSecret();
  return { key, hash: hashSecret(key) };
}

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
