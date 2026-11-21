"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMoney } from "@/domain/currency";
import type { Plan } from "@/domain/matchmaker/schema";
import { deletePlan, localPlans, localShares, savePlan, syncPlansFromCloud } from "@/lib/plans";
import { preferences, useStore } from "@/lib/store";
import { PlanView } from "./PlanView";

export function PlanList() {
  const [plans] = useStore(localPlans);
  const [shares] = useStore(localShares);
  const [prefs] = useStore(preferences);
  const [note, setNote] = useState("");

  useEffect(() => {
    void syncPlansFromCloud().then((count) => {
      if (count > 0) setNote(`Synced ${count} ${count === 1 ? "plan" : "plans"} from your account.`);
    });
  }, []);

  if (plans.length === 0) {
    return (
      <div className="rule border-t py-12">
        <p className="display-3 font-[family-name:var(--font-display)]">No saved plans yet.</p>
        <p className="mt-2 max-w-xl text-ink">Create a plan in the Matchmaker and press Save plan. Plans are kept on this device, and in your account when you are signed in.</p>
        <Link href="/matchmaker" className="btn btn-saffron mt-6">
          Start the Matchmaker
        </Link>
      </div>
    );
  }
  return (
    <>
      <p className="note" role="status">
        {note}
      </p>
      <ul data-testid="plan-list">
        {plans.map((plan) => (
          <li key={plan.id} className="rule grid gap-x-8 gap-y-2 border-t py-5 md:grid-cols-[1fr_auto]">
            <div>
              <Link href={`/plans/view?id=${plan.id}`} className="font-[family-name:var(--font-display)] text-2xl hover:underline hover:decoration-gold hover:underline-offset-4">
                {plan.concept.headline}
              </Link>
              <p className="note mt-1">
                {plan.title}. Budget {formatMoney(plan.budget.totalMinor, plan.budget.currency, prefs.locale)}. Updated{" "}
                {new Intl.DateTimeFormat(prefs.locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(plan.updatedAt))}.
                {shares.some((s) => s.planId === plan.id) ? " Shared by link." : ""}
              </p>
            </div>
            <div className="flex gap-2 md:self-center">
              <Link href={`/plans/view?id=${plan.id}`} className="btn btn-plum btn-sm">
                Open
              </Link>
              <button type="button" className="btn btn-line btn-sm" onClick={() => void deletePlan(plan.id)} aria-label={`Delete plan: ${plan.concept.headline}`}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function SavedPlan({ aiEnabled }: { aiEnabled: boolean }) {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const [plans] = useStore(localPlans);
  const plan = plans.find((p) => p.id === id);
  if (!plan) {
    return (
      <div className="py-10">
        <p className="display-3 font-[family-name:var(--font-display)]">This plan is not on this device.</p>
        <p className="mt-2 text-ink">Saved plans live in the browser where they were created, or in your account if you were signed in.</p>
        <Link href="/plans" className="btn btn-plum mt-6">
          See my plans
        </Link>
      </div>
    );
  }
  // Edits to a saved plan are written straight back to storage.
  const persist = (next: Plan) => void savePlan(next);
  return (
    <PlanView
      plan={plan}
      aiEnabled={aiEnabled}
      onChange={persist}
      onEditPreferences={() => {
        try {
          window.sessionStorage.setItem("festiva.matchmaker.current", JSON.stringify(plan));
        } catch {
          /* ignore */
        }
        router.push("/matchmaker");
      }}
    />
  );
}
