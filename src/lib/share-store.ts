import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { planSchema, type Plan } from "@/domain/matchmaker/schema";
import { publicEnv, supabaseConfigured } from "./env";

/**
 * Shared plans.
 *
 * Sharing is always explicit (a person presses Share) and always revocable.
 * A share stores a snapshot of the plan under an unguessable token; the token
 * is the only thing that appears in the public URL.
 *
 * - With Supabase configured, shares live in the `shared_plans` table, owned
 *   by the signed-in user and protected by Row Level Security.
 * - Without Supabase, a demo store keeps shares in server memory. They vanish
 *   when the server restarts and are not shared between serverless instances;
 *   the UI says so.
 */

export interface ShareRecord {
  plan: Plan;
  createdAt: string;
}

interface MemoryEntry extends ShareRecord {
  revokeHash: Buffer;
  revokedAt: string | null;
}

const MAX_DEMO_SHARES = 500;
const globalStore = globalThis as unknown as { __festivaShares?: Map<string, MemoryEntry> };
const memory: Map<string, MemoryEntry> = (globalStore.__festivaShares ??= new Map());

const hash = (value: string): Buffer => createHash("sha256").update(value).digest();
export const newToken = (): string => randomBytes(18).toString("base64url");
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export const demoStore = {
  create(plan: Plan, now: Date = new Date()): { token: string; revokeKey: string } {
    if (memory.size >= MAX_DEMO_SHARES) {
      const oldest = memory.keys().next().value;
      if (oldest) memory.delete(oldest);
    }
    const token = newToken();
    const revokeKey = newToken();
    memory.set(token, { plan, createdAt: now.toISOString(), revokeHash: hash(revokeKey), revokedAt: null });
    return { token, revokeKey };
  },
  get(token: string): ShareRecord | null {
    const entry = memory.get(token);
    if (!entry || entry.revokedAt) return null;
    return { plan: entry.plan, createdAt: entry.createdAt };
  },
  revoke(token: string, revokeKey: string, now: Date = new Date()): boolean {
    const entry = memory.get(token);
    if (!entry || entry.revokedAt) return false;
    const given = hash(revokeKey);
    if (given.length !== entry.revokeHash.length || !timingSafeEqual(given, entry.revokeHash)) return false;
    entry.revokedAt = now.toISOString();
    return true;
  },
  clear(): void {
    memory.clear();
  },
};

function supabaseFor(accessToken?: string) {
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL!, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });
}

export const supabaseStore = {
  /** Creates a share owned by the signed-in user. RLS rejects the insert for anyone else. */
  async create(plan: Plan, accessToken: string): Promise<{ token: string } | { error: "unauthorised" | "failed" }> {
    const client = supabaseFor(accessToken);
    const { data: user, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !user.user) return { error: "unauthorised" };
    const token = newToken();
    const { error } = await client.from("shared_plans").insert({ token, owner_id: user.user.id, title: plan.title, snapshot: plan });
    return error ? { error: "failed" } : { token };
  },
  /** Public read goes through a SECURITY DEFINER function, so the table itself is never exposed to anonymous users. */
  async get(token: string): Promise<ShareRecord | null> {
    const { data, error } = await supabaseFor().rpc("get_shared_plan", { p_token: token });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) return null;
    const parsed = planSchema.safeParse(row.snapshot);
    return parsed.success ? { plan: parsed.data, createdAt: row.created_at } : null;
  },
  async revoke(token: string, accessToken: string): Promise<boolean> {
    const { data, error } = await supabaseFor(accessToken)
      .from("shared_plans")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token", token)
      .is("revoked_at", null)
      .select("token");
    return !error && (data?.length ?? 0) > 0;
  },
};

export const shareMode: "supabase" | "demo" = supabaseConfigured ? "supabase" : "demo";

export async function getShared(token: string): Promise<ShareRecord | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  return shareMode === "supabase" ? supabaseStore.get(token) : demoStore.get(token);
}
