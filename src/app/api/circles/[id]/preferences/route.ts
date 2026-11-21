import { addPreference } from "@/domain/circle/engine";
import { z } from "zod";
import { preferenceInputSchema, type PreferenceInput } from "@/domain/circle/schema";
import { canonical, sha256, verifyReceipt } from "@/lib/circles/receipts";
import { recordExperimentEvent } from "@/lib/circles/experiment";
import { experimentId, authorise, fail, flagsFor, ids, limit, mutate, requireFlag, withCircle } from "@/lib/circles/service";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/**
 * What the browser sends. Provider details (model, request ID, detected
 * language, whether the text was edited) are not trusted from here: they come
 * from the signed receipt the Sarvam route issued, or the save is refused.
 */
const receipt = z.string().max(4000);
const bodySchema = preferenceInputSchema.extend({
  translation: preferenceInputSchema.shape.translation.unwrap().extend({ receipt: receipt.optional() }).nullable(),
  transcript: preferenceInputSchema.shape.transcript.unwrap().extend({ receipt: receipt.optional() }).nullable(),
  structureReceipt: receipt.nullable().optional(),
});

/**
 * Save a preference the participant has reviewed and approved.
 * The original text and any translation are stored as separate fields.
 */
export const POST = instrument("/api/circles/[id]/preferences", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const limited = limit(request, `preference:${caller.participant.id}`, 20, 60_000);
  if (limited) return limited;
  const body = await readJson(request, bodySchema, 24_000);
  if ("response" in body) return body.response;
  const sent = body.data;
  if (sent.source === "voice" && !sent.transcript) return fail(400, "invalid", "A voice preference needs its transcript details.");
  if (sent.translation && sent.translation.language === sent.originalLanguage) return fail(400, "invalid", "A translation must be in a different language from the original.");
  const who = { circleId: id, participantId: caller.participant.id };

  let transcript: PreferenceInput["transcript"] = null;
  if (sent.transcript) {
    const r = verifyReceipt(sent.transcript.receipt, { kind: "transcript", ...who });
    if (!r) return fail(400, "unverified_transcript", "This transcript could not be matched to a Sarvam transcription on this server. Record it again, or save it as typed text.");
    transcript = { model: r.model, requestId: r.requestId, detectedLanguage: r.language as PreferenceInput["originalLanguage"] | null, languageProbability: r.languageProbability, edited: sha256(sent.originalText.trim()) !== r.outputHash };
  }

  let translation: PreferenceInput["translation"] = null;
  if (sent.translation) {
    const r = verifyReceipt(sent.translation.receipt, { kind: "translation", ...who });
    if (!r || r.language !== sent.translation.language) return fail(400, "unverified_translation", "This translation could not be matched to a Sarvam translation on this server. Translate it again, or save without it.");
    if (r.inputHash !== sha256(sent.originalText.trim()) && r.inputHash !== sha256(sent.originalText)) return fail(400, "stale_translation", "Your text changed after it was translated. Translate it again, or save without it.");
    translation = { text: sent.translation.text, language: sent.translation.language, model: r.model, edited: sha256(sent.translation.text) !== r.outputHash && sha256(sent.translation.text.trim()) !== r.outputHash };
  }

  // Fields count as Sarvam's only if they are exactly what Sarvam proposed; otherwise the participant supplied them.
  let structuredBy = sent.structuredBy;
  if (structuredBy === "sarvam") {
    const r = verifyReceipt(sent.structureReceipt, { kind: "structure", ...who });
    if (!r || r.outputHash !== sha256(canonical(sent.structured))) structuredBy = "person";
  }

  const input: PreferenceInput = { source: sent.source, originalText: sent.originalText, originalLanguage: sent.originalLanguage, translation, transcript, structured: sent.structured, structuredBy };

  const result = await mutate(id, (record) => {
    const { circle, preference } = addPreference(record.circle, caller.participant.id, input, ids, new Date());
    return { record: withCircle(record, circle), result: { preference, circle } };
  });
  if (result instanceof Response) return result;
  const anon = experimentId(request);
  if (anon) await recordExperimentEvent({ name: "preference_submitted", variant: result.circle.onboardingVariant, assignedBy: result.circle.onboardingAssignedBy, anonymousId: anon, circleId: id, ms: null });
  return json({ preference: result.preference }, 201);
});
