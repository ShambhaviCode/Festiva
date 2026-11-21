import { z } from "zod";
import { addParticipant } from "@/domain/circle/engine";
import { joinSchema } from "@/domain/circle/schema";
import { DEFAULT_LANGUAGE } from "@/domain/languages";
import { recordExperimentEvent } from "@/lib/circles/experiment";
import { SECRET_PATTERN, secretMatches } from "@/lib/circles/repository";
import { experimentId, fail, flagsFor, ids, limit, mutate, newKey, requireFlag, withCircle } from "@/lib/circles/service";
import { CircleError } from "@/domain/circle/engine";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = joinSchema.extend({ token: z.string().regex(SECRET_PATTERN) });

/** Join with a valid invitation. Returns a participant key once; only its hash is stored. */
export const POST = instrument("/api/circles/[id]/join", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const limited = limit(request, "circle-join", 20, 10 * 60_000);
  if (limited) return limited;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const body = await readJson(request, bodySchema, 2_000);
  if ("response" in body) return fail(400, "invalid", "Enter your name and choose a language.");
  const language = flags.flags.multilingual_onboarding_enabled ? body.data.language : DEFAULT_LANGUAGE;
  const { key, hash } = newKey();

  const result = await mutate(id, (record) => {
    const invite = record.secrets.invite;
    if (!invite || invite.revokedAt || Date.parse(invite.expiresAt) < Date.now() || !secretMatches(body.data.token, invite.tokenHash)) {
      throw new CircleError("forbidden", "This invitation has expired or been replaced. Ask the organiser for a new link.");
    }
    // Remote configuration can lower the limit for new joins.
    const cap = Math.min(record.circle.maxParticipants, flags.config.max_participants);
    if (record.circle.participants.length >= cap) throw new CircleError("circle_full", "This circle is full.");
    const { circle, participant } = addParticipant(record.circle, body.data.name, language, ids, new Date());
    return {
      record: { ...withCircle(record, circle), secrets: { ...record.secrets, participantKeyHashes: { ...record.secrets.participantKeyHashes, [participant.id]: hash } } },
      result: { participant, circle },
    };
  });
  if (result instanceof Response) return result;
  const anon = experimentId(request);
  if (anon) await recordExperimentEvent({ name: "participant_joined", variant: result.circle.onboardingVariant, assignedBy: result.circle.onboardingAssignedBy, anonymousId: anon, circleId: id, ms: null });
  return json({ participantId: result.participant.id, participantKey: key, circleId: id }, 201);
});
