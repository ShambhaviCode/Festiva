import { z } from "zod";
import { recordExperimentEvent } from "@/lib/circles/experiment";
import { circleRepository, hashSecret, newSecret, SECRET_PATTERN, secretMatches, UUID_PATTERN } from "@/lib/circles/repository";
import { experimentId, authorise, fail, flagsFor, limit, mutate, requireFlag } from "@/lib/circles/service";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Invitations. The organiser creates a link; creating a new one replaces the
 * old one, and revoking stops it working. The token travels in the URL
 * fragment (#), so it is not sent to servers or written to access logs, and it
 * is stored here only as a hash with an expiry.
 */
export const POST = instrument("/api/circles/[id]/invite", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id, { organiserOnly: true });
  if (caller instanceof Response) return caller;
  const token = newSecret();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + flags.config.invite_expiry_days * 86_400_000).toISOString();
  const result = await mutate(id, (record) => ({
    record: { ...record, secrets: { ...record.secrets, invite: { tokenHash: hashSecret(token), createdAt: now.toISOString(), expiresAt, revokedAt: null } } },
    result: true,
  }));
  if (result instanceof Response) return result;
  const anon = experimentId(request);
  const { circle } = caller.record;
  if (anon) await recordExperimentEvent({ name: "invite_created", variant: circle.onboardingVariant, assignedBy: circle.onboardingAssignedBy, anonymousId: anon, circleId: id, ms: null });
  return json({ token, expiresAt, path: `/circles/join#c=${id}&t=${token}` }, 201);
});

export const DELETE = instrument("/api/circles/[id]/invite", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const caller = await authorise(request, id, { organiserOnly: true });
  if (caller instanceof Response) return caller;
  const result = await mutate(id, (record) => ({
    record: { ...record, secrets: { ...record.secrets, invite: record.secrets.invite ? { ...record.secrets.invite, revokedAt: new Date().toISOString() } : null } },
    result: true,
  }));
  if (result instanceof Response) return result;
  return new Response(null, { status: 204 });
});

const checkSchema = z.object({ token: z.string().regex(SECRET_PATTERN) });

/** Anyone holding a valid invitation can see the circle's public basics before joining. */
export const PUT = instrument("/api/circles/[id]/invite", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const limited = limit(request, "invite-check", 30, 10 * 60_000);
  if (limited) return limited;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const body = await readJson(request, checkSchema, 1_000);
  if ("response" in body) return fail(404, "invalid_invite", "This invitation is not valid.");
  const record = UUID_PATTERN.test(id) ? await circleRepository().get(id) : null;
  const invite = record?.secrets.invite;
  if (!record || !invite || invite.revokedAt || Date.parse(invite.expiresAt) < Date.now() || !secretMatches(body.data.token, invite.tokenHash)) {
    return fail(404, "invalid_invite", "This invitation has expired or been replaced. Ask the organiser for a new link.");
  }
  const { circle } = record;
  const anon = experimentId(request);
  if (anon) await recordExperimentEvent({ name: "invite_opened", variant: circle.onboardingVariant, assignedBy: circle.onboardingAssignedBy, anonymousId: anon, circleId: id, ms: null });
  return json({
    name: circle.name,
    occasion: circle.occasion,
    celebrationDate: circle.celebrationDate,
    organiser: circle.participants.find((p) => p.role === "organiser")?.name ?? "",
    organiserLanguage: circle.organiserLanguage,
    spotsLeft: Math.max(0, circle.maxParticipants - circle.participants.length),
    participants: circle.participants.length,
    multilingual: flags.flags.multilingual_onboarding_enabled,
  });
});
