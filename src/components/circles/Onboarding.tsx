"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { festivalBySlug, festivals } from "@/data/festivals";
import { nextOccurrence, toISO } from "@/domain/dates";
import { CURRENCIES } from "@/domain/currency";
import { DEFAULT_LANGUAGE, LANGUAGES } from "@/domain/languages";
import {
  GIFT_TIERS,
  TIER_LABELS,
  type CreateCircleInput,
} from "@/domain/circle/schema";
import {
  api,
  ApiError,
  rememberCircle,
  type ClientFlags,
} from "@/lib/client/circles";
import type { OrganiserView } from "@/domain/circle/engine";
import { Notice } from "./ui";

const FESTIVAL_OPTIONS = [...festivals]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((f) => ({ slug: f.slug, name: f.name }));

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
};

/**
 * Values passed from a Matchmaker plan (or any link): festival, currency,
 * gift budget, number of people and gift tier. Each is checked; anything
 * invalid is ignored and the usual default stays.
 */
function fromLink(params: URLSearchParams, cap: number): Partial<Draft> {
  const out: Partial<Draft> = {};
  const festival = params.get("festival");
  if (festival && festivalBySlug.has(festival)) {
    out.festivalSlug = festival;
    // Use the festival's next checked date when it is at least a week away, with contributions due a week before.
    const today = new Date(`${new Date().toLocaleDateString("en-CA")}T00:00:00Z`);
    const next = nextOccurrence(festivalBySlug.get(festival)!.date, today);
    if (next && next.certainty !== "seasonal" && next.start.getTime() - today.getTime() >= 7 * 86_400_000) {
      out.celebrationDate = toISO(next.start);
      out.contributionDeadline = toISO(new Date(next.start.getTime() - 7 * 86_400_000));
    }
  }
  const currency = params.get("currency");
  if (currency && CURRENCIES.some((c) => c.code === currency)) out.currency = currency;
  const budget = Number(params.get("budget"));
  if (params.get("budget") && Number.isFinite(budget) && budget >= 0 && budget <= 100_000_000) out.totalBudget = String(Math.round(budget));
  const people = Number(params.get("people"));
  if (Number.isInteger(people) && people >= 2) {
    out.maxParticipants = String(Math.min(people, cap));
    if (out.totalBudget) out.perPersonBudget = String(Math.max(0, Math.floor(Number(out.totalBudget) / people)));
  }
  const tier = params.get("tier");
  if (tier && (GIFT_TIERS as readonly string[]).includes(tier)) out.giftTier = tier as Draft["giftTier"];
  return out;
}

interface Draft {
  festivalSlug: string;
  customOccasion: string;
  name: string;
  celebrationDate: string;
  contributionDeadline: string;
  currency: string;
  totalBudget: string;
  perPersonBudget: string;
  giftTier: (typeof GIFT_TIERS)[number];
  organiserName: string;
  organiserLanguage: string;
  maxParticipants: string;
}

function toInput(
  draft: Draft,
  variant: "guided" | "single_page",
  multilingual: boolean,
): { input?: CreateCircleInput; error?: string } {
  const festival = FESTIVAL_OPTIONS.find((f) => f.slug === draft.festivalSlug);
  const occasionLabel =
    draft.festivalSlug === "custom"
      ? draft.customOccasion.trim()
      : (festival?.name ?? "");
  if (!occasionLabel)
    return { error: "Choose a festival or describe your occasion." };
  if (!draft.organiserName.trim())
    return { error: "Add your name so others know who invited them." };
  if (!draft.celebrationDate || !draft.contributionDeadline)
    return { error: "Add both dates." };
  if (draft.contributionDeadline > draft.celebrationDate)
    return {
      error:
        "The contribution deadline must be on or before the celebration date.",
    };
  const total = Number(draft.totalBudget.replace(/,/g, ""));
  if (!Number.isFinite(total) || total < 0)
    return { error: "Enter the total budget as a number." };
  const perPerson = draft.perPersonBudget.trim()
    ? Number(draft.perPersonBudget.replace(/,/g, ""))
    : null;
  if (perPerson !== null && (!Number.isFinite(perPerson) || perPerson < 0))
    return {
      error: "Enter the per-person budget as a number, or leave it empty.",
    };
  const max = Number(draft.maxParticipants);
  if (!Number.isInteger(max) || max < 3)
    return { error: "A circle needs room for at least three people." };
  return {
    input: {
      name: draft.name.trim() || `${occasionLabel} gift circle`,
      organiserName: draft.organiserName.trim(),
      festivalSlug: draft.festivalSlug === "custom" ? null : draft.festivalSlug,
      occasionLabel,
      celebrationDate: draft.celebrationDate,
      contributionDeadline: draft.contributionDeadline,
      currency: draft.currency as CreateCircleInput["currency"],
      totalBudget: total,
      perPersonBudget: perPerson,
      giftTier: draft.giftTier,
      maxParticipants: max,
      organiserLanguage: multilingual
        ? draft.organiserLanguage
        : DEFAULT_LANGUAGE,
      onboardingVariant: variant,
    },
  };
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
      {hint && <p className="note mt-1 text-[0.85rem]">{hint}</p>}
    </div>
  );
}

export function Onboarding({ flags }: { flags: ClientFlags }) {
  const router = useRouter();
  const search = useSearchParams();
  // The variant is fixed for this visit, even if flags refresh while the form is open.
  const [variant] = useState(flags.onboarding.variant);
  const multilingual = flags.flags.multilingual_onboarding_enabled;
  const cap = flags.config.max_participants;
  const [startedAt] = useState(() => Date.now());
  const reported = useRef(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    festivalSlug: "diwali",
    customOccasion: "",
    name: "",
    celebrationDate: addDays(21),
    contributionDeadline: addDays(14),
    currency: "INR",
    totalBudget: "10000",
    perPersonBudget: "1500",
    giftTier: "everyday",
    organiserName: "",
    organiserLanguage: DEFAULT_LANGUAGE,
    maxParticipants: String(Math.min(10, cap)),
    ...fromLink(new URLSearchParams(search.toString()), cap),
  }));
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  useEffect(() => {
    if (reported.current || !flags.onboarding.inExperiment) return;
    reported.current = true;
    void api("/api/experiment", {
      method: "POST",
      body: JSON.stringify({ name: "onboarding_started", variant }),
    }).catch(() => undefined);
  }, [flags.onboarding.inExperiment, variant]);

  const languages = useMemo(() => LANGUAGES, []);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const { input, error: problem } = toInput(draft, variant, multilingual);
    if (!input) {
      setError(problem ?? "Check the details.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await api<{
        circle: OrganiserView;
        organiserKey: string;
        participantId: string;
      }>("/api/circles", {
        method: "POST",
        body: JSON.stringify({
          circle: input,
          elapsedMs: Math.min(Date.now() - startedAt, 4 * 60 * 60 * 1000),
        }),
      });
      rememberCircle({
        circleId: result.circle.id,
        role: "organiser",
        key: result.organiserKey,
        participantId: result.participantId,
        name: result.circle.name,
        savedAt: new Date().toISOString(),
      });
      router.push(`/circles/${result.circle.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "The circle could not be created. Try again.",
      );
      setBusy(false);
    }
  }

  const occasion = (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Festival or occasion" htmlFor="c-festival">
        <select
          id="c-festival"
          className="field"
          value={draft.festivalSlug}
          onChange={(e) => set("festivalSlug", e.target.value)}
        >
          {FESTIVAL_OPTIONS.map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.name}
            </option>
          ))}
          <option value="custom">Something else</option>
        </select>
      </Field>
      {draft.festivalSlug === "custom" ? (
        <Field label="Describe the occasion" htmlFor="c-custom">
          <input
            id="c-custom"
            className="field"
            maxLength={80}
            value={draft.customOccasion}
            onChange={(e) => set("customOccasion", e.target.value)}
            placeholder="Ammamma's 80th birthday"
          />
        </Field>
      ) : (
        <div />
      )}
      <Field
        label="Circle name (optional)"
        htmlFor="c-name"
        hint="Shown to everyone you invite."
      >
        <input
          id="c-name"
          className="field"
          maxLength={80}
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="The Rao family Diwali exchange"
        />
      </Field>
    </div>
  );
  const dates = (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Celebration date" htmlFor="c-date">
        <input
          id="c-date"
          type="date"
          className="field"
          value={draft.celebrationDate}
          onChange={(e) => set("celebrationDate", e.target.value)}
        />
      </Field>
      <Field
        label="Contribution deadline"
        htmlFor="c-deadline"
        hint="When everyone should have committed their share."
      >
        <input
          id="c-deadline"
          type="date"
          className="field"
          value={draft.contributionDeadline}
          onChange={(e) => set("contributionDeadline", e.target.value)}
        />
      </Field>
    </div>
  );
  const budget = (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Currency" htmlFor="c-currency">
        <select
          id="c-currency"
          className="field"
          value={draft.currency}
          onChange={(e) => set("currency", e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}, {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Total budget for the circle" htmlFor="c-total">
        <input
          id="c-total"
          inputMode="decimal"
          className="field"
          value={draft.totalBudget}
          onChange={(e) => set("totalBudget", e.target.value)}
        />
      </Field>
      <Field
        label="Spend per gift (optional)"
        htmlFor="c-per"
        hint="FESTIVA flags wishlist items above this."
      >
        <input
          id="c-per"
          inputMode="decimal"
          className="field"
          value={draft.perPersonBudget}
          onChange={(e) => set("perPersonBudget", e.target.value)}
        />
      </Field>
      <fieldset>
        <legend className="field-label">Gift style</legend>
        <div className="flex flex-wrap gap-2">
          {GIFT_TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className="chip"
              aria-pressed={draft.giftTier === tier}
              onClick={() => set("giftTier", tier)}
            >
              {TIER_LABELS[tier]}
            </button>
          ))}
        </div>
        <p className="note mt-1 text-[0.85rem]">
          Steers gift ideas. FESTIVA shows no prices; it has no live product
          data.
        </p>
      </fieldset>
    </div>
  );
  const you = (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Your name" htmlFor="c-you">
        <input
          id="c-you"
          className="field"
          maxLength={60}
          autoComplete="given-name"
          value={draft.organiserName}
          onChange={(e) => set("organiserName", e.target.value)}
        />
      </Field>
      {multilingual && (
        <Field
          label="Your language"
          htmlFor="c-lang"
          hint="Preferences can be translated into this language for you."
        >
          <select
            id="c-lang"
            className="field"
            value={draft.organiserLanguage}
            onChange={(e) => set("organiserLanguage", e.target.value)}
          >
            {languages.map((l) => (
              <option key={l.tag} value={l.tag} lang={l.tag}>
                {l.nativeName === l.name
                  ? l.name
                  : `${l.nativeName} (${l.name})`}
                {l.availability === "text-only" ? ", typing only" : ""}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field
        label="Most people who can join"
        htmlFor="c-max"
        hint={`Up to ${cap}, including you.`}
      >
        <input
          id="c-max"
          type="number"
          min={3}
          max={cap}
          className="field"
          value={draft.maxParticipants}
          onChange={(e) => set("maxParticipants", e.target.value)}
        />
      </Field>
    </div>
  );

  const errorBox = error && (
    <div className="mt-6">
      <Notice tone="warn" testId="onboarding-error">
        {error}
      </Notice>
    </div>
  );

  if (variant === "single_page") {
    return (
      <form
        onSubmit={submit}
        data-testid="onboarding"
        data-variant="single_page"
        noValidate
      >
        <div className="grid gap-10">
          <fieldset>
            <legend className="display-3 mb-4">Occasion</legend>
            {occasion}
          </fieldset>
          <fieldset>
            <legend className="display-3 mb-4">Dates</legend>
            {dates}
          </fieldset>
          <fieldset>
            <legend className="display-3 mb-4">Budget</legend>
            {budget}
          </fieldset>
          <fieldset>
            <legend className="display-3 mb-4">You</legend>
            {you}
          </fieldset>
        </div>
        {errorBox}
        <button type="submit" className="btn btn-saffron mt-8" disabled={busy}>
          {busy ? "Creating…" : "Create the circle"}
        </button>
      </form>
    );
  }

  const steps = [
    { title: "The occasion", body: occasion },
    { title: "The dates", body: dates },
    { title: "The budget", body: budget },
    { title: "About you", body: you },
  ];
  const last = step === steps.length - 1;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (last) void submit();
        else {
          setError(null);
          setStep((s) => s + 1);
        }
      }}
      data-testid="onboarding"
      data-variant="guided"
      noValidate
    >
      <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li
            key={s.title}
            aria-current={i === step ? "step" : undefined}
            className={
              i === step
                ? "font-semibold text-charcoal"
                : i < step
                  ? "text-emerald"
                  : "note"
            }
          >
            {i + 1}. {s.title}
          </li>
        ))}
      </ol>
      <div className="mt-8" key={step}>
        <h2 className="display-3 mb-5">{steps[step].title}</h2>
        {steps[step].body}
      </div>
      {errorBox}
      <div className="mt-8 flex flex-wrap gap-3">
        {step > 0 && (
          <button
            type="button"
            className="btn btn-line"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        )}
        <button type="submit" className="btn btn-saffron" disabled={busy}>
          {last ? (busy ? "Creating…" : "Create the circle") : "Continue"}
        </button>
      </div>
    </form>
  );
}
