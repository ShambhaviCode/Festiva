import { budgetInsights, organiserView, participantView } from "@/domain/circle/engine";
import { verifiedContext } from "@/domain/circle/culture";
import { circleRepository } from "@/lib/circles/repository";
import { authorise, flagsFor, requireFlag, todayIso } from "@/lib/circles/service";
import { getSarvam } from "@/lib/integrations/sarvam";
import { json } from "@/lib/http";
import { getControls } from "@/lib/ops/controls";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Read a circle. The organiser receives everything except Secret Santa pairs;
 * a participant receives only their own data and the person they give to.
 * Feature flags decide which optional parts the server computes at all.
 */
export const GET = instrument("/api/circles/[id]", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const { circle } = caller.record;
  const controls = await getControls();
  const sarvam = getSarvam();
  const capabilities = {
    voice: flags.flags.sarvam_voice_enabled && Boolean(sarvam) && !controls.voicePaused,
    voiceReason: !flags.flags.sarvam_voice_enabled
      ? "Voice input is switched off."
      : !sarvam
        ? "Voice input needs Sarvam, which is not configured on this server."
        : controls.voicePaused
          ? "Voice input is paused by an administrator. You can still type."
          : null,
    translation: Boolean(sarvam),
    aiStructuring: Boolean(sarvam) && !controls.aiStructuringPaused,
    aiCulture: flags.flags.cultural_context_enabled && Boolean(sarvam),
    recommendations: flags.flags.gift_recommendations_enabled,
    secretSanta: flags.flags.secret_santa_enabled,
    budgetInsights: flags.flags.group_budget_insights_enabled,
    premiumGifting: flags.flags.premium_gifting_experience_enabled,
    matchmakerInline: flags.flags.matchmaker_experiment_enabled,
    multilingual: flags.flags.multilingual_onboarding_enabled,
    maxRecordingSeconds: flags.config.max_recording_seconds,
  };
  const culture = verifiedContext(circle.occasion.festivalSlug);
  // The organiser is also a participant: `?view=participant` returns their personal view.
  const personal = new URL(request.url).searchParams.get("view") === "participant";
  if (caller.role === "organiser" && !personal) {
    const record = caller.record;
    return json({
      role: "organiser",
      me: caller.participant,
      circle: organiserView(circle),
      invite: record.secrets.invite ? { createdAt: record.secrets.invite.createdAt, expiresAt: record.secrets.invite.expiresAt, revokedAt: record.secrets.invite.revokedAt } : null,
      insights: flags.flags.group_budget_insights_enabled ? budgetInsights(circle, todayIso()) : null,
      culture,
      capabilities,
    });
  }
  const view = participantView(circle, caller.participant.id);
  return json({
    role: "participant",
    organiser: caller.role === "organiser",
    me: caller.participant,
    circle: { ...view, myAssignment: flags.flags.secret_santa_enabled ? view.myAssignment : null },
    culture,
    capabilities,
  });
});

/** The organiser can delete the whole circle and everything in it. */
export const DELETE = instrument("/api/circles/[id]", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const caller = await authorise(request, id, { organiserOnly: true });
  if (caller instanceof Response) return caller;
  await circleRepository().delete(id);
  return new Response(null, { status: 204 });
});
