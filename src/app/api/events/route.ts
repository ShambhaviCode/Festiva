import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { publicEnv, supabaseConfigured } from "@/lib/env";
import { readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.enum(EVENT_NAMES),
  label: z.string().max(60).regex(/^[a-z0-9-]*$/).optional(),
  path: z.string().max(200).regex(/^\/[A-Za-z0-9/_\-[\]]*$/).optional(),
});

/**
 * First-party analytics sink. Stores an event name, an optional slug-like
 * label and a path. No IP address, user agent, cookie or identifier is kept.
 * With no database configured, events are accepted and discarded.
 */
export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "events"), 120, 60_000).ok) return new Response(null, { status: 429 });
  const body = await readJson(request, schema, 2_000);
  if ("response" in body) return new Response(null, { status: 400 });
  if (supabaseConfigured) {
    const client = createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    await client.from("analytics_events").insert({ name: body.data.name, label: body.data.label ?? null, path: body.data.path?.replace(/\/share\/[^/]+/, "/share/[token]") ?? null });
  }
  return new Response(null, { status: 204 });
}
