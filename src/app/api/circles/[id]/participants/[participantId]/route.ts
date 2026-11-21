import { removeParticipant } from "@/domain/circle/engine";
import { authorise, fail, mutate, withCircle } from "@/lib/circles/service";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string; participantId: string }> };

/**
 * Remove a participant and everything they added (preferences, wishlist,
 * contribution). A participant can leave; the organiser can remove anyone else.
 */
export const DELETE = instrument("/api/circles/[id]/participants/[participantId]", async (request: Request, { params }: Ctx) => {
  const { id, participantId } = await params;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  if (caller.role !== "organiser" && caller.participant.id !== participantId) return fail(403, "forbidden", "You can only remove yourself.");
  const result = await mutate(id, (record) => {
    const circle = removeParticipant(record.circle, participantId, new Date());
    const hashes = { ...record.secrets.participantKeyHashes };
    delete hashes[participantId];
    return { record: { ...withCircle(record, circle), secrets: { ...record.secrets, participantKeyHashes: hashes } }, result: true };
  });
  if (result instanceof Response) return result;
  return new Response(null, { status: 204 });
});
