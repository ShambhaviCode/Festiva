import { removePreference } from "@/domain/circle/engine";
import { authorise, mutate, withCircle } from "@/lib/circles/service";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string; preferenceId: string }> };

/** Delete a preference: its owner or the organiser. The original, its translation and its structured fields go together. */
export const DELETE = instrument("/api/circles/[id]/preferences/[preferenceId]", async (request: Request, { params }: Ctx) => {
  const { id, preferenceId } = await params;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const result = await mutate(id, (record) => ({ record: withCircle(record, removePreference(record.circle, preferenceId, caller.participant, new Date())), result: true }));
  if (result instanceof Response) return result;
  return new Response(null, { status: 204 });
});
