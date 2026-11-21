import { addWishlistItem } from "@/domain/circle/engine";
import { wishlistInputSchema } from "@/domain/circle/schema";
import { authorise, flagsFor, ids, limit, mutate, requireFlag, withCircle } from "@/lib/circles/service";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/** Add an item to your own wishlist. Manual wishlists work whatever the recommendation flag says. */
export const POST = instrument("/api/circles/[id]/wishlist", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const limited = limit(request, `wishlist:${caller.participant.id}`, 30, 60_000);
  if (limited) return limited;
  const body = await readJson(request, wishlistInputSchema, 4_000);
  if ("response" in body) return body.response;
  const result = await mutate(id, (record) => {
    const { circle, item } = addWishlistItem(record.circle, caller.participant.id, body.data, ids, new Date());
    return { record: withCircle(record, circle), result: item };
  });
  if (result instanceof Response) return result;
  return json({ item: result }, 201);
});
