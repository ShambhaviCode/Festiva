import { verifiedContext } from "@/domain/circle/culture";
import { authorise, fail, flagsFor, limit, requireFlag } from "@/lib/circles/service";
import { getSarvam, SarvamError } from "@/lib/integrations/sarvam";
import { json } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/**
 * AI-written cultural suggestions from Sarvam, grounded in FESTIVA's guide
 * entry for the circle's festival. Always labelled as AI suggestions; the
 * guide entry itself is returned separately by GET /api/circles/[id].
 */
export const POST = instrument("/api/circles/[id]/cultural", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled") ?? requireFlag(flags, "cultural_context_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const limited = limit(request, `cultural:${caller.record.circle.id}`, 6, 10 * 60_000);
  if (limited) return limited;
  const sarvam = getSarvam();
  if (!sarvam) return fail(503, "not_configured", "AI suggestions need Sarvam, which is not configured on this server.");
  const { circle } = caller.record;
  const context = verifiedContext(circle.occasion.festivalSlug);
  if (!context) return fail(400, "no_reference", "AI suggestions are only offered for festivals in FESTIVA's guide, so they can be grounded in it.");
  const reference = [
    `${context.festival.name}: ${context.festival.tagline}.`,
    `Gift customs: ${context.giftCustoms.join("; ") || "none recorded"}.`,
    `Etiquette: ${context.etiquette.join("; ")}.`,
    `Greetings: ${context.greetings.map((g) => `${g.text} (${g.language}${g.meaning ? `, "${g.meaning}"` : ""})`).join("; ")}.`,
  ].join("\n");
  try {
    const suggestions = await sarvam.culturalSuggestions(reference, circle.occasion.label, caller.participant.language);
    return json({ suggestions, model: sarvam.models.chat, provider: "sarvam", label: "AI suggestion from Sarvam, based on FESTIVA's guide. Not verified; customs vary by family and region." });
  } catch (error) {
    if (error instanceof SarvamError) return fail(error.code === "quota" ? 429 : 502, error.code, error.message);
    throw error;
  }
});
