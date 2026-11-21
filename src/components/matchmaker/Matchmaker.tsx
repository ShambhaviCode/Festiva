"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { countryByCode } from "@/data/countries";
import { festivalBySlug } from "@/data/festivals";
import { GENERIC_OCCASIONS } from "@/data/matchmaker";
import { CURRENCY_CODES, type CurrencyCode } from "@/domain/currency";
import { generatePlan } from "@/domain/matchmaker/engine";
import { AGE_BANDS, AUDIENCES, DEFAULT_INPUT, GIFT_TIERS, OBSERVANCES, planSchema, type MatchmakerInput, type Plan } from "@/domain/matchmaker/schema";
import { track } from "@/lib/analytics";
import { preferences } from "@/lib/store";
import { PlanView } from "./PlanView";
import { Wizard } from "./Wizard";

const DRAFT_KEY = "festiva.matchmaker.current";

function prefill(params: URLSearchParams): MatchmakerInput {
  const input: MatchmakerInput = { ...DEFAULT_INPUT };
  const prefCurrency = preferences.get().currency;
  if ((CURRENCY_CODES as readonly string[]).includes(prefCurrency)) input.currency = prefCurrency as CurrencyCode;
  const occasion = params.get("occasion");
  if (occasion && (festivalBySlug.has(occasion) || GENERIC_OCCASIONS.some((o) => o.id === occasion))) input.occasion = occasion;
  const country = params.get("country")?.toUpperCase();
  if (country && countryByCode.has(country)) input.countryCode = country;
  const currency = params.get("currency");
  if (currency && (CURRENCY_CODES as readonly string[]).includes(currency)) input.currency = currency as CurrencyCode;
  const budget = Number(params.get("budget"));
  if (params.get("budget") && Number.isFinite(budget) && budget >= 0 && budget <= 1_000_000_000) input.budget = budget;
  const tier = params.get("giftTier");
  if (tier && (GIFT_TIERS as readonly string[]).includes(tier)) input.giftTier = tier as MatchmakerInput["giftTier"];
  const audience = params.get("audience");
  if (audience && (AUDIENCES as readonly string[]).includes(audience)) input.audience = audience as MatchmakerInput["audience"];
  const people = Number(params.get("people"));
  if (Number.isInteger(people) && people >= 1 && people <= 5000) input.attendees = people;
  const city = params.get("city");
  if (city) input.city = city.trim().slice(0, 80);
  const observance = params.get("observance");
  if (observance && (OBSERVANCES as readonly string[]).includes(observance)) input.observance = observance as MatchmakerInput["observance"];
  const ages = (params.get("ages") ?? "").split(",").filter((a): a is MatchmakerInput["ageBands"][number] => (AGE_BANDS as readonly string[]).includes(a));
  if (ages.length > 0) input.ageBands = [...new Set(ages)];
  return input;
}

function loadDraft(): Plan | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    const parsed = raw ? planSchema.safeParse(JSON.parse(raw)) : null;
    return parsed?.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function Matchmaker({ aiEnabled }: { aiEnabled: boolean }) {
  const params = useSearchParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [initial, setInitial] = useState<MatchmakerInput | null>(null);
  const started = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  // Restore an unsaved plan after a refresh, unless the link asks for a specific new plan.
  useEffect(() => {
    const fresh = params.has("occasion") || params.has("country") || params.has("budget");
    const draft = fresh ? null : loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage and the URL
    if (draft) setPlan(draft);
    setInitial(draft?.input ?? prefill(new URLSearchParams(params.toString())));
    if (!started.current) {
      started.current = true;
      track("matchmaker_start");
    }
  }, [params]);

  const update = (next: Plan | null) => {
    setPlan(next);
    try {
      if (next) window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      else window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      // sessionStorage unavailable: the plan still lives in memory for this visit
    }
  };

  if (!initial) return <p className="note min-h-[80vh] py-10">Loading the Matchmaker…</p>;

  return (
    <div ref={top} className="scroll-mt-24">
      {plan ? (
        <PlanView
          plan={plan}
          aiEnabled={aiEnabled}
          onChange={update}
          onEditPreferences={() => {
            setInitial(plan.input);
            update(null);
            top.current?.scrollIntoView();
          }}
        />
      ) : (
        <Wizard
          key={JSON.stringify(initial)}
          initial={initial}
          onComplete={(input) => {
            update(generatePlan(input, { id: crypto.randomUUID(), now: new Date() }));
            track("matchmaker_complete", input.occasion);
            top.current?.scrollIntoView();
          }}
        />
      )}
    </div>
  );
}
