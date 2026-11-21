import { connection } from "next/server";
import { supabaseConfigured } from "@/lib/env";
import { aiStatus } from "@/lib/env.server";
import { shareMode } from "@/lib/share-store";
import { flagsmithMode } from "@/lib/integrations/flagsmith";
import { nudgebeeConfig } from "@/lib/integrations/nudgebee";
import { sarvamConfig } from "@/lib/integrations/sarvam";

/** Reports which optional integrations are live, without revealing any secret values. */
export async function GET() {
  await connection();
  const ai = aiStatus();
  return Response.json(
    {
      status: "ok",
      features: { ai: ai.configured, aiProvider: ai.provider ?? null, supabase: supabaseConfigured, sharing: shareMode },
      // Configuration presence only. Whether each integration has actually worked is on /admin/integrations.
      integrations: { sarvam: Boolean(sarvamConfig()), flagsmith: flagsmithMode() ?? false, nudgebee: Boolean(nudgebeeConfig().eventWebhookUrl) },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
