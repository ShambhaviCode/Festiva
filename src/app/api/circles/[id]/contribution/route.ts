import { setContribution } from "@/domain/circle/engine";
import { contributionInputSchema } from "@/domain/circle/schema";
import { authorise, flagsFor, mutate, requireFlag, withCircle } from "@/lib/circles/service";
import { json, readJson } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Record your own contribution commitment. FESTIVA does not process, hold or
 * verify payments: "paid outside FESTIVA" is the participant's own statement.
 */
export const PUT = instrument("/api/circles/[id]/contribution", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const body = await readJson(request, contributionInputSchema, 1_000);
  if ("response" in body) return body.response;
  const result = await mutate(id, (record) => {
    const circle = setContribution(record.circle, caller.participant.id, body.data.amount, body.data.status, new Date());
    return { record: withCircle(record, circle), result: circle.contributions.find((c) => c.participantId === caller.participant.id) ?? null };
  });
  if (result instanceof Response) return result;
  return json({ contribution: result });
});
