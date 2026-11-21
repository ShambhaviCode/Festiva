import { z } from "zod";
import { LANGUAGE_TAGS, supportsTranslation } from "@/domain/languages";
import { authorise, fail, flagsFor, limit, requireFlag } from "@/lib/circles/service";
import { getSarvam, SarvamError } from "@/lib/integrations/sarvam";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";
import { issueReceipt, sha256 } from "@/lib/circles/receipts";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ text: z.string().trim().min(1).max(1200), from: z.enum(LANGUAGE_TAGS), to: z.enum(LANGUAGE_TAGS) });

/** Translate a preference with Sarvam. The original is untouched; the caller stores both separately. */
export const POST = instrument("/api/circles/[id]/translate", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  // Per participant, and a ceiling per client address on paid Sarvam calls.
  const limited = limit(request, `translate:${caller.participant.id}`, 20, 60_000) ?? limit(request, "translate", 300, 60 * 60_000);
  if (limited) return limited;
  const body = await readJson(request, bodySchema, 8_000);
  if ("response" in body) return body.response;
  const { text, from, to } = body.data;
  if (!supportsTranslation(from, to)) return fail(400, "unsupported_language", "Sarvam cannot translate between these two languages.");
  const sarvam = getSarvam();
  if (!sarvam) return fail(503, "not_configured", "Translation needs Sarvam, which is not configured on this server.");
  try {
    const result = await sarvam.translate(text, from, to);
    // Signed here, checked on save: only this response can put Sarvam's name on a translation.
    const receipt = issueReceipt({ kind: "translation", circleId: id, participantId: caller.participant.id, model: result.model, requestId: result.requestId, language: to, languageProbability: null, inputHash: sha256(text), outputHash: sha256(result.text) });
    return json({ text: result.text, language: to, model: result.model, requestId: result.requestId, provider: "sarvam", receipt });
  } catch (error) {
    if (error instanceof SarvamError) return fail(error.code === "quota" ? 429 : error.code === "timeout" ? 504 : 502, error.code, error.message);
    throw error;
  }
});
