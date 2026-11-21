import { removeWishlistItem } from "@/domain/circle/engine";
import { authorise, mutate, withCircle } from "@/lib/circles/service";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

export const DELETE = instrument("/api/circles/[id]/wishlist/[itemId]", async (request: Request, { params }: Ctx) => {
  const { id, itemId } = await params;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const result = await mutate(id, (record) => ({ record: withCircle(record, removeWishlistItem(record.circle, itemId, caller.participant, new Date())), result: true }));
  if (result instanceof Response) return result;
  return new Response(null, { status: 204 });
});
