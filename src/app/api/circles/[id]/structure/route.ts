import { z } from "zod";
import { structureByRules } from "@/domain/circle/structure";
import { authorise, flagsFor, limit, requireFlag } from "@/lib/circles/service";
import { getSarvam, SarvamError } from "@/lib/integrations/sarvam";
import { json, readJson } from "@/lib/http";
import { getControls } from "@/lib/ops/controls";
import { recordProcessing } from "@/lib/ops/metrics";
import { instrument } from "@/lib/ops/telemetry";
import { canonical, issueReceipt, sha256 } from "@/lib/circles/receipts";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({ englishText: z.string().trim().min(1).max(2400) });

/**
 * Propose structured wishlist fields for an approved preference.
 * With Sarvam configured (and not paused by an administrator) the chat model
 * proposes them; on any failure, or without Sarvam, FESTIVA's rules do. The
 * participant reviews and edits the fields before saving either way.
 */
export const POST = instrument("/api/circles/[id]/structure", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  // Per participant, and a ceiling per client address on paid Sarvam calls.
  const limited = limit(request, `structure:${caller.participant.id}`, 20, 60_000) ?? limit(request, "structure", 300, 60 * 60_000);
  if (limited) return limited;
  const body = await readJson(request, bodySchema, 10_000);
  if ("response" in body) return body.response;

  const sarvam = getSarvam();
  const paused = (await getControls()).aiStructuringPaused;
  if (sarvam && !paused) {
    try {
      const structured = await sarvam.structure(body.data.englishText);
      recordProcessing({ job: "structure_preference", ok: true, code: "sarvam" });
      const receipt = issueReceipt({ kind: "structure", circleId: id, participantId: caller.participant.id, model: sarvam.models.chat, requestId: null, language: null, languageProbability: null, inputHash: null, outputHash: sha256(canonical(structured)) });
      return json({ structured, structuredBy: "sarvam", model: sarvam.models.chat, receipt, notice: "Suggested by Sarvam's model. Check each field before saving." });
    } catch (error) {
      const code = error instanceof SarvamError ? error.code : "unexpected";
      recordProcessing({ job: "structure_preference", ok: false, code });
      return json({
        structured: structureByRules(body.data.englishText),
        structuredBy: "rules",
        model: null,
        notice: "Sarvam could not structure this preference, so FESTIVA's rules filled in the fields. Check them before saving.",
      });
    }
  }
  recordProcessing({ job: "structure_preference", ok: true, code: paused ? "rules_paused" : "rules" });
  return json({
    structured: structureByRules(body.data.englishText),
    structuredBy: "rules",
    model: null,
    notice: paused ? "AI structuring is paused by an administrator; FESTIVA's rules filled in the fields." : "FESTIVA's rules filled in the fields. Check them before saving.",
  });
});
