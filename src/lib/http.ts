import { z } from "zod";

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  Response.json(body, { status, headers: { "cache-control": "no-store", ...headers } });

/** Read and validate a JSON body with a hard size cap. Returns a Response on failure. */
export async function readJson<T>(request: Request, schema: z.ZodType<T>, maxBytes = 200_000): Promise<{ data: T } | { response: Response }> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) return { response: json({ error: "Request is too large." }, 413) };
  let text: string;
  try {
    text = await request.text();
  } catch {
    return { response: json({ error: "Request body could not be read." }, 400) };
  }
  if (text.length > maxBytes) return { response: json({ error: "Request is too large." }, 413) };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { response: json({ error: "Request body must be JSON." }, 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { response: json({ error: "Request did not match the expected shape." }, 400) };
  return { data: parsed.data };
}

export function bearer(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9._-]{20,4096})$/.exec(header);
  return match ? match[1] : null;
}
