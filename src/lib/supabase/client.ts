"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, supabaseConfigured } from "../env";

let client: Promise<SupabaseClient> | null = null;

/**
 * Browser Supabase client, or null when the deployment has no Supabase project
 * configured. The SDK is imported lazily, so deployments without Supabase
 * never download it.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured) return Promise.resolve(null);
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }),
  );
  return client;
}

export async function accessToken(): Promise<string | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
