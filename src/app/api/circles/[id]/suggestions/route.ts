import { mergeStructures } from "@/domain/circle/structure";
import { suggestGifts } from "@/domain/circle/suggestions";
import { authorise, fail, flagsFor, requireFlag } from "@/lib/circles/service";
import { json } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Gift suggestions for one person in the circle, from FESTIVA's curated ideas.
 * Allowed for: the organiser, the person themselves, and whoever gives to them.
 */
export const GET = instrument("/api/circles/[id]/suggestions", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled") ?? requireFlag(flags, "gift_recommendations_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const { circle } = caller.record;
  const forId = new URL(request.url).searchParams.get("for") ?? caller.participant.id;
  const recipient = circle.participants.find((p) => p.id === forId);
  if (!recipient) return fail(404, "not_found", "That person is not in this circle.");
  const givesTo = circle.assignments?.pairs.find((p) => p.giverId === caller.participant.id)?.receiverId;
  if (caller.role !== "organiser" && forId !== caller.participant.id && givesTo !== forId) return fail(403, "forbidden", "You can see suggestions for yourself and the person you give to.");

  const profile = mergeStructures(circle.preferences.filter((p) => p.participantId === forId).map((p) => p.structured));
  const suggestions = suggestGifts(circle, profile, { count: flags.config.recommendation_count, premiumExperience: flags.flags.premium_gifting_experience_enabled });
  return json({
    for: { id: recipient.id, name: recipient.name },
    basedOn: circle.preferences.filter((p) => p.participantId === forId).length,
    suggestions,
    notice: "Ideas from FESTIVA's curated guide. They carry no prices: FESTIVA has no live product data. Brand links go to each brand's own site; FESTIVA has no partnership with them.",
  });
});
