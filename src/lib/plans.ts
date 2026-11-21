"use client";

import { planSchema, type Plan } from "@/domain/matchmaker/schema";
import { createLocalStore } from "./store";
import { getSupabase } from "./supabase/client";

/**
 * Saved celebration plans.
 * Plans are always kept on the device. When Supabase is configured and the
 * person is signed in, saves and deletes are also written to their private
 * `celebration_plans` rows (protected by Row Level Security).
 */
export const localPlans = createLocalStore<Plan[]>("festiva.plans", [], (value): value is Plan[] =>
  Array.isArray(value) && value.every((p) => planSchema.safeParse(p).success),
);

export interface ShareHandle {
  planId: string;
  token: string;
  revokeKey?: string;
  mode: "demo" | "supabase";
  createdAt: string;
}

export const localShares = createLocalStore<ShareHandle[]>("festiva.shares", []);

export function getLocalPlan(id: string): Plan | undefined {
  return localPlans.get().find((p) => p.id === id);
}

export async function savePlan(plan: Plan): Promise<{ cloud: boolean }> {
  localPlans.set((plans) => [plan, ...plans.filter((p) => p.id !== plan.id)].slice(0, 50));
  const supabase = await getSupabase();
  if (!supabase) return { cloud: false };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { cloud: false };
  const { error } = await supabase.from("celebration_plans").upsert({ id: plan.id, owner_id: data.user.id, title: plan.title, plan, updated_at: plan.updatedAt });
  return { cloud: !error };
}

export async function deletePlan(id: string): Promise<void> {
  localPlans.set((plans) => plans.filter((p) => p.id !== id));
  const supabase = await getSupabase();
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (data.user) await supabase.from("celebration_plans").delete().eq("id", id);
}

/** Pull the signed-in user's cloud plans into the local list (newest wins). */
export async function syncPlansFromCloud(): Promise<number> {
  const supabase = await getSupabase();
  if (!supabase) return 0;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;
  const { data, error } = await supabase.from("celebration_plans").select("plan").order("updated_at", { ascending: false }).limit(50);
  if (error || !data) return 0;
  const cloud = data.map((row) => planSchema.safeParse(row.plan)).flatMap((r) => (r.success ? [r.data] : []));
  localPlans.set((local) => {
    const byId = new Map<string, Plan>();
    for (const plan of [...cloud, ...local]) {
      const existing = byId.get(plan.id);
      if (!existing || existing.updatedAt < plan.updatedAt) byId.set(plan.id, plan);
    }
    return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 50);
  });
  return cloud.length;
}
