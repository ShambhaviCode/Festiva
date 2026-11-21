import { z } from "zod";
import { createCircle } from "@/domain/circle/engine";
import { createCircleSchema } from "@/domain/circle/schema";
import { festivalBySlug } from "@/data/festivals";
import { DEFAULT_LANGUAGE } from "@/domain/languages";
import { recordExperimentEvent } from "@/lib/circles/experiment";
import { circleRepository, hashSecret, newSecret } from "@/lib/circles/repository";
import { experimentId, fail, flagsFor, ids, limit, requireFlag } from "@/lib/circles/service";
import { organiserView } from "@/domain/circle/engine";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

const bodySchema = z.object({
  circle: z.unknown(),
  /** Milliseconds the organiser spent in onboarding, measured in the browser. */
  elapsedMs: z.number().int().min(0).max(4 * 60 * 60 * 1000).nullable(),
});

/** Create a circle. Returns the organiser key once; it is stored only as a hash. */
export const POST = instrument("/api/circles", async (request: Request) => {
  const limited = limit(request, "circle-create", 10, 60 * 60_000);
  if (limited) return limited;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;

  const body = await readJson(request, bodySchema, 20_000);
  if ("response" in body) return body.response;
  const parsed = createCircleSchema.safeParse(body.data.circle);
  if (!parsed.success) return fail(400, "invalid", parsed.error.issues[0]?.message ?? "Check the circle details.");
  const input = parsed.data;
  if (input.festivalSlug && !festivalBySlug.has(input.festivalSlug)) return fail(400, "invalid", "Choose a festival from the list, or describe your own occasion.");
  if (!flags.flags.multilingual_onboarding_enabled) input.organiserLanguage = DEFAULT_LANGUAGE;

  const now = new Date();
  const enrolled = flags.onboarding.inExperiment && flags.onboarding.variant === input.onboardingVariant;
  const { circle, organiser } = createCircle(input, ids, now, flags.config.max_participants, enrolled ? flags.onboarding.assignedBy : "none");
  const organiserKey = newSecret();
  await circleRepository().create({ circle, secrets: { organiserKeyHash: hashSecret(organiserKey), participantKeyHashes: {}, invite: null }, version: 1 });

  const anon = experimentId(request);
  if (anon) await recordExperimentEvent({ name: "circle_created", variant: circle.onboardingVariant, assignedBy: circle.onboardingAssignedBy, anonymousId: anon, circleId: circle.id, ms: body.data.elapsedMs });

  return json({ circle: organiserView(circle), organiserKey, participantId: organiser.id }, 201);
});
