"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Motif } from "@/components/Motif";
import { countries } from "@/data/countries";
import { festivalBySlug, festivals } from "@/data/festivals";
import { GENERIC_OCCASIONS } from "@/data/matchmaker";
import { perHead } from "@/domain/budget";
import { CURRENCIES, formatMoney, toMinor } from "@/domain/currency";
import { generatePlan } from "@/domain/matchmaker/engine";
import {
  ACTIVITY_TYPES,
  AGE_BANDS,
  AUDIENCES,
  DIETARY,
  DURATIONS,
  FOOD_STYLES,
  GIFT_TIERS,
  INTERESTS,
  LABELS,
  matchmakerInputSchema,
  OBSERVANCES,
  STYLES,
  type MatchmakerInput,
} from "@/domain/matchmaker/schema";

type Draft = Omit<MatchmakerInput, "budget" | "attendees"> & { budget: string; attendees: string };

const STEPS = ["Occasion", "Place and people", "Budget", "Food", "Style and time", "Interests"] as const;

const sortedFestivals = [...festivals].sort((a, b) => a.name.localeCompare(b.name));
const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

export function toDraft(input: MatchmakerInput): Draft {
  return { ...input, budget: String(input.budget), attendees: String(input.attendees) };
}

function toInput(draft: Draft) {
  return matchmakerInputSchema.safeParse({ ...draft, budget: draft.budget.trim() === "" ? 0 : Number(draft.budget), attendees: Number(draft.attendees) });
}

function ChoiceGroup<T extends string>({
  legend,
  hint,
  options,
  labels,
  value,
  onChange,
  multiple,
}: {
  legend: string;
  hint?: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T | T[];
  onChange: (value: T | T[]) => void;
  multiple?: boolean;
}) {
  const selected = (option: T) => (Array.isArray(value) ? value.includes(option) : value === option);
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      {hint && <p className="note -mt-1 mb-2">{hint}</p>}
      <div className="flex flex-wrap gap-2" role={multiple ? "group" : "radiogroup"} aria-label={legend}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="chip"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={selected(option)}
            onClick={() => {
              if (Array.isArray(value)) onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);
              else onChange(option);
            }}
          >
            {labels[option]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Wizard({ initial, onComplete }: { initial: MatchmakerInput; onComplete: (input: MatchmakerInput) => void }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const parsed = useMemo(() => toInput(draft), [draft]);
  const festival = festivalBySlug.get(draft.occasion);
  const occasionLabel = festival?.name ?? GENERIC_OCCASIONS.find((o) => o.id === draft.occasion)?.label ?? "Your celebration";
  const preview = useMemo(() => (parsed.success ? generatePlan(parsed.data, { id: "preview", now: new Date(0) }) : null), [parsed]);
  const perPerson = parsed.success && parsed.data.budget > 0 ? formatMoney(perHead(toMinor(parsed.data.budget, parsed.data.currency), parsed.data.attendees), parsed.data.currency) : null;

  const stepError = (): string => {
    if (step === 1) {
      const n = Number(draft.attendees);
      if (!Number.isInteger(n) || n < 1 || n > 5000) return "Enter how many people are coming, from 1 to 5,000.";
    }
    if (step === 2) {
      const n = Number(draft.budget || 0);
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) return "Enter your budget as a number, or leave it empty.";
    }
    return "";
  };

  const next = () => {
    const problem = stepError();
    setError(problem);
    if (problem) return;
    if (step < STEPS.length - 1) return setStep(step + 1);
    if (!parsed.success) return setError("Some answers need another look. Check the people and budget steps.");
    onComplete(parsed.data);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
        aria-labelledby="wizard-step-title"
      >
        <ol className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Progress">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => index < step && setStep(index)}
                disabled={index > step}
                aria-current={index === step ? "step" : undefined}
                className={`border-b-2 pb-1 ${index === step ? "border-saffron-deep font-semibold" : index < step ? "border-transparent text-ink underline decoration-gold underline-offset-4" : "border-transparent text-ink/70"}`}
              >
                {index + 1}. {label}
              </button>
            </li>
          ))}
        </ol>
        <progress className="mt-4 h-1 w-full [&::-moz-progress-bar]:bg-saffron-deep [&::-webkit-progress-bar]:bg-charcoal/10 [&::-webkit-progress-value]:bg-saffron-deep" value={step + 1} max={STEPS.length} aria-label={`Step ${step + 1} of ${STEPS.length}`} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="mt-9 grid min-h-[19rem] content-start gap-7"
          >
            <h2 id="wizard-step-title" className="display-2" tabIndex={-1}>
              {
                [
                  "What are you celebrating?",
                  "Where, and who is coming?",
                  "What would you like to spend?",
                  "What should be on the table?",
                  "What should it feel like?",
                  "What do your guests enjoy?",
                ][step]
              }
            </h2>

            {step === 0 && (
              <>
                <label className="grid">
                  <span className="field-label">Festival or occasion</span>
                  <select className="field max-w-md" value={draft.occasion} onChange={(e) => set("occasion", e.target.value)} data-testid="occasion">
                    <optgroup label="Festivals">
                      {sortedFestivals.map((f) => (
                        <option key={f.slug} value={f.slug}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Other occasions">
                      {GENERIC_OCCASIONS.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <p className="max-w-xl text-ink">
                  {festival
                    ? `${festival.name}: ${festival.summary}`
                    : "For occasions without a set tradition, the plan draws on your country and what you tell the Matchmaker next."}
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <div className="flex flex-wrap gap-5">
                  <label className="grid">
                    <span className="field-label">Country</span>
                    <select className="field min-w-56" value={draft.countryCode} onChange={(e) => set("countryCode", e.target.value)} data-testid="country">
                      {sortedCountries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid">
                    <span className="field-label">City or town (optional)</span>
                    <input className="field" value={draft.city} maxLength={80} onChange={(e) => set("city", e.target.value)} autoComplete="address-level2" />
                  </label>
                  <label className="grid">
                    <span className="field-label">Number of people</span>
                    <input className="field w-32" type="number" inputMode="numeric" min={1} max={5000} value={draft.attendees} onChange={(e) => set("attendees", e.target.value)} data-testid="attendees" />
                  </label>
                </div>
                <ChoiceGroup legend="Who is it for?" options={AUDIENCES} labels={LABELS.audience} value={draft.audience} onChange={(v) => set("audience", v as Draft["audience"])} />
                <ChoiceGroup
                  legend="Ages coming (optional)"
                  hint="With anyone under 18, the plan leaves out alcohol and adds safety notes. Over-65s get access and seating notes."
                  options={AGE_BANDS}
                  labels={LABELS.ageBands}
                  value={draft.ageBands}
                  onChange={(v) => set("ageBands", v as Draft["ageBands"])}
                  multiple
                />
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex flex-wrap gap-5">
                  <label className="grid">
                    <span className="field-label">Total budget (optional)</span>
                    <input className="field w-48" type="number" inputMode="decimal" min={0} step="any" value={draft.budget} onChange={(e) => set("budget", e.target.value)} data-testid="budget-input" />
                  </label>
                  <label className="grid">
                    <span className="field-label">Currency</span>
                    <select className="field min-w-56" value={draft.currency} onChange={(e) => set("currency", e.target.value as Draft["currency"])} data-testid="currency">
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}, {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="note max-w-xl">
                  {perPerson ? `That is about ${perPerson} per person. ` : ""}
                  The Matchmaker splits your own figure across food, gifts, decorations and more. It does not look up prices, and nothing is converted between currencies.
                </p>
                <ChoiceGroup legend="Gift tier" hint="A guide to the kind of gift ideas to suggest." options={GIFT_TIERS} labels={LABELS.giftTier} value={draft.giftTier} onChange={(v) => set("giftTier", v as Draft["giftTier"])} />
              </>
            )}

            {step === 3 && (
              <>
                <ChoiceGroup legend="Food preference" options={FOOD_STYLES} labels={LABELS.foodStyle} value={draft.foodStyle} onChange={(v) => set("foodStyle", v as Draft["foodStyle"])} />
                <ChoiceGroup
                  legend="Dietary requirements"
                  hint="Choose all that apply across your guests. Dishes that do not fit are left out."
                  options={DIETARY}
                  labels={LABELS.dietary}
                  value={draft.dietary}
                  onChange={(v) => set("dietary", v as Draft["dietary"])}
                  multiple
                />
              </>
            )}

            {step === 4 && (
              <>
                <ChoiceGroup legend="Celebration style" options={STYLES} labels={LABELS.style} value={draft.style} onChange={(v) => set("style", v as Draft["style"])} />
                <ChoiceGroup
                  legend="How will you keep it?"
                  hint="Religious puts the rites first; secular leaves them out. FESTIVA never prescribes religious practice."
                  options={OBSERVANCES}
                  labels={LABELS.observance}
                  value={draft.observance}
                  onChange={(v) => set("observance", v as Draft["observance"])}
                />
                <ChoiceGroup legend="Time available" options={DURATIONS} labels={LABELS.duration} value={draft.duration} onChange={(v) => set("duration", v as Draft["duration"])} />
                <label className="grid">
                  <span className="field-label">Start time</span>
                  <input className="field w-40" type="time" value={draft.startTime} onChange={(e) => set("startTime", e.target.value || "17:00")} />
                </label>
              </>
            )}

            {step === 5 && (
              <>
                <ChoiceGroup legend="Interests" hint="These shape gifts, music and how the budget is split." options={INTERESTS} labels={LABELS.interests} value={draft.interests} onChange={(v) => set("interests", v as Draft["interests"])} multiple />
                <ChoiceGroup legend="Preferred activities" options={ACTIVITY_TYPES} labels={LABELS.activities} value={draft.activities} onChange={(v) => set("activities", v as Draft["activities"])} multiple />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 min-h-6 text-sm font-medium text-vermilion" role="alert">
          {error}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {step > 0 && (
            <button type="button" className="btn btn-line" onClick={() => (setError(""), setStep(step - 1))}>
              Back
            </button>
          )}
          <button type="submit" className="btn btn-saffron" data-testid="wizard-next">
            {step === STEPS.length - 1 ? "Create my plan" : "Continue"}
          </button>
        </div>
      </form>

      <aside aria-label="Live preview of your plan" className="on-dark self-start rounded-[1.75rem] bg-plum p-6 text-ivory sm:p-8 lg:sticky lg:top-24" data-testid="wizard-preview">
        <div className="flex items-start gap-5">
          <div className="arch h-24 w-20 shrink-0">
            <Motif seed={draft.occasion} palette={festival?.palette ?? ["#1e0a23", "#f0a030", "#dcc898"]} className="h-full w-full" />
          </div>
          <div>
            <p className="note">Your celebration so far</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight" aria-live="polite">
              {preview?.concept.headline ?? occasionLabel}
            </p>
          </div>
        </div>
        {preview ? (
          <dl className="mt-6 grid gap-4 text-[0.95rem]">
            <div>
              <dt className="note">First moments</dt>
              <dd className="mt-1 grid gap-0.5">
                {(preview.sections.find((s) => s.key === "schedule")?.items ?? []).slice(0, 3).map((item) => (
                  <span key={item.id} className="grid grid-cols-[5.5rem_1fr] gap-2">
                    <span className="tabular-nums text-gold-soft">{item.time}</span>
                    <span>{item.title}</span>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="note">On the table</dt>
              <dd className="mt-1">
                {(preview.sections.find((s) => s.key === "food")?.items ?? [])
                  .map((i) => i.title)
                  .slice(0, 3)
                  .join(", ")}
              </dd>
            </div>
            <div>
              <dt className="note">Budget</dt>
              <dd className="mt-1">
                {preview.budget.totalMinor > 0 ? `${formatMoney(preview.budget.totalMinor, preview.budget.currency)}${perPerson ? `, about ${perPerson} each` : ""}` : "Not set yet"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="note mt-6">The preview appears once the people and budget answers are valid.</p>
        )}
        <p className="note mt-6">This preview updates as you answer. Nothing is saved or sent anywhere until you choose to save or share.</p>
      </aside>
    </div>
  );
}
