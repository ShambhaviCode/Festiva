import { randomBytes } from "node:crypto";
import { clearAssignments, generateAssignments } from "@/domain/circle/engine";
import { authorise, flagsFor, mutate, requireFlag, withCircle } from "@/lib/circles/service";
import { json } from "@/lib/http";
import { instrument } from "@/lib/ops/telemetry";

type Ctx = { params: Promise<{ id: string }> };

/** Draw Secret Santa (organiser only). The organiser learns that pairs exist, never who drew whom. */
export const POST = instrument("/api/circles/[id]/secret-santa", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled") ?? requireFlag(flags, "secret_santa_enabled");
  if (off) return off;
  const caller = await authorise(request, id, { organiserOnly: true });
  if (caller instanceof Response) return caller;
  const result = await mutate(id, (record) => {
    const circle = generateAssignments(record.circle, randomBytes(16).toString("hex"), new Date());
    return { record: withCircle(record, circle), result: { generatedAt: circle.assignments!.generatedAt, count: circle.assignments!.pairs.length } };
  });
  if (result instanceof Response) return result;
  return json({ assignments: result }, 201);
});

export const DELETE = instrument("/api/circles/[id]/secret-santa", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const caller = await authorise(request, id, { organiserOnly: true });
  if (caller instanceof Response) return caller;
  const result = await mutate(id, (record) => ({ record: withCircle(record, clearAssignments(record.circle, new Date())), result: true }));
  if (result instanceof Response) return result;
  return new Response(null, { status: 204 });
});
