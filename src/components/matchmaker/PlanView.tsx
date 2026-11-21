"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { allocate, BUDGET_LABELS, BUDGET_MODULE, remaining, setLine, sumLines, weightsFor, type BudgetCategory } from "@/domain/budget";
import { formatMoney, fromMinor, toMinor } from "@/domain/currency";
import { editItem, planToText, regenerateSection, removeItem, replaceItem, SECTION_META } from "@/domain/matchmaker/engine";
import { festivalBySlug } from "@/data/festivals";
import { LABELS, type Plan, type PlanItem, type SectionKey } from "@/domain/matchmaker/schema";
import { track } from "@/lib/analytics";
import { localPlans, localShares, savePlan, type ShareHandle } from "@/lib/plans";
import { preferences, useStore } from "@/lib/store";
import { accessToken } from "@/lib/supabase/client";

interface Props {
  plan: Plan;
  /** Omit to render a read-only plan (shared links). */
  onChange?: (plan: Plan) => void;
  onEditPreferences?: () => void;
  aiEnabled?: boolean;
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ItemRow({
  item,
  sectionKey,
  editable,
  onEdit,
  onReplace,
  onRemove,
}: {
  item: PlanItem;
  sectionKey: SectionKey;
  editable: boolean;
  onEdit: (patch: { title: string; detail: string }) => void;
  onReplace: () => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [detail, setDetail] = useState(item.detail);
  const meta = SECTION_META[sectionKey];

  if (editing) {
    return (
      <form
        className="grid gap-3 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onEdit({ title: title.trim(), detail: detail.trim() });
          setEditing(false);
        }}
      >
        <label className="grid">
          <span className="field-label">Title</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} required autoFocus />
        </label>
        <label className="grid">
          <span className="field-label">Details</span>
          <textarea className="field" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={1200} />
        </label>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-plum btn-sm">
            Save changes
          </button>
          <button
            type="button"
            className="btn btn-line btn-sm"
            onClick={() => {
              setTitle(item.title);
              setDetail(item.detail);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`grid gap-x-5 gap-y-1 py-4 ${item.time ? "sm:grid-cols-[6.5rem_1fr]" : ""}`}>
      {item.time && <p className="tabular-nums text-ink">{item.time}</p>}
      <div>
        <p className="text-[1.08rem] font-semibold">
          {item.href ? (
            <Link href={item.href} className="link">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </p>
        {item.detail && <p className="mt-1 max-w-[48rem] text-ink">{item.detail}</p>}
        <p className="note mt-1.5">
          {item.edited ? "Edited by you. " : item.kind === "fact" ? "From FESTIVA's guide. " : "Suggestion. "}
          <span>Why: {item.reason}</span>
        </p>
        {editable && (
          <div className="no-print mt-2.5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-line btn-sm" onClick={() => setEditing(true)} aria-label={`Edit: ${item.title}`}>
              Edit
            </button>
            {meta.replaceable && (
              <button type="button" className="btn btn-line btn-sm" onClick={onReplace} aria-label={`Replace: ${item.title}`}>
                Replace
              </button>
            )}
            <button type="button" className="btn btn-line btn-sm" onClick={onRemove} aria-label={`Remove: ${item.title}`}>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetTable({ plan, editable, onChange, locale }: { plan: Plan; editable: boolean; onChange?: (plan: Plan) => void; locale: string }) {
  const { totalMinor, currency, lines } = plan.budget;
  const spent = sumLines(lines);
  const left = remaining(totalMinor, lines);
  const money = (minor: number) => formatMoney(minor, currency, locale);
  const update = (budget: Plan["budget"]) => onChange?.({ ...plan, budget, input: { ...plan.input, budget: fromMinor(budget.totalMinor, currency) }, updatedAt: new Date().toISOString() });
  const parse = (value: string): number | null => {
    const n = Number(value);
    if (value.trim() === "" || !Number.isFinite(n) || n < 0 || n > 1_000_000_000) return null;
    return toMinor(n, currency);
  };

  return (
    <section className="rounded-[1.5rem] bg-cream p-6 sm:p-9" aria-labelledby="budget-heading" data-testid="budget">
      <h3 id="budget-heading" className="display-2">
        Budget
      </h3>
      <p className="note mt-2 max-w-2xl">
        A suggested split of your own budget, worked out by fixed arithmetic. These are planning estimates, not prices: FESTIVA has no live price data. Edit any line and the totals update.
      </p>
      <table className="mt-6 w-full border-collapse text-left">
        <caption className="sr-only-focusable">Budget lines by category</caption>
        <thead>
          <tr className="rule border-b text-sm">
            <th scope="col" className="py-2 font-semibold">
              Category
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              Amount ({currency})
            </th>
            <th scope="col" className="hidden py-2 pl-4 text-right font-semibold sm:table-cell">
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.category} className="rule border-b">
              <th scope="row" className="py-2.5 pr-3 font-normal">
                {BUDGET_MODULE[line.category] ? (
                  <Link className="link" href={BUDGET_MODULE[line.category]!}>
                    {BUDGET_LABELS[line.category]}
                  </Link>
                ) : (
                  BUDGET_LABELS[line.category]
                )}
              </th>
              <td className="py-2.5 text-right tabular-nums">
                {editable ? (
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="field !min-h-10 w-32 text-right"
                    aria-label={`${BUDGET_LABELS[line.category]} amount in ${currency}`}
                    data-testid={`budget-${line.category}`}
                    defaultValue={fromMinor(line.amountMinor, currency)}
                    key={`${line.category}-${line.amountMinor}`}
                    onBlur={(e) => {
                      const minor = parse(e.target.value);
                      if (minor === null) e.target.value = String(fromMinor(line.amountMinor, currency));
                      else if (minor !== line.amountMinor) update({ ...plan.budget, lines: setLine(lines, line.category as BudgetCategory, minor) });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                  />
                ) : (
                  money(line.amountMinor)
                )}
              </td>
              <td className="hidden py-2.5 pl-4 text-right tabular-nums text-ink sm:table-cell">{spent > 0 ? `${Math.round((line.amountMinor / spent) * 100)}%` : "0%"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-5 grid gap-2 sm:max-w-md">
        <div className="flex justify-between gap-6">
          <dt>Planned total</dt>
          <dd className="font-semibold tabular-nums" data-testid="budget-planned">
            {money(spent)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt>Your budget</dt>
          <dd className="font-semibold tabular-nums" data-testid="budget-total">
            {editable ? (
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="field !min-h-10 w-36 text-right"
                aria-label={`Your total budget in ${currency}`}
                defaultValue={fromMinor(totalMinor, currency)}
                key={`total-${totalMinor}`}
                onBlur={(e) => {
                  const minor = parse(e.target.value);
                  if (minor === null) e.target.value = String(fromMinor(totalMinor, currency));
                  else if (minor !== totalMinor) update({ ...plan.budget, totalMinor: minor });
                }}
              />
            ) : (
              money(totalMinor)
            )}
          </dd>
        </div>
        <div className="rule flex justify-between gap-6 border-t pt-2">
          <dt>{left >= 0 ? "Left to allocate" : "Over budget by"}</dt>
          <dd className={`font-semibold tabular-nums ${left < 0 ? "text-vermilion" : "text-emerald"}`}>
            <span data-testid="budget-remaining" role="status">
              {money(Math.abs(left))}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt>Per person ({plan.input.attendees})</dt>
          <dd className="tabular-nums">{money(Math.floor(totalMinor / plan.input.attendees))}</dd>
        </div>
      </dl>
      {editable && (
        <button
          type="button"
          className="btn btn-line btn-sm no-print mt-5"
          onClick={() => update({ ...plan.budget, lines: allocate(totalMinor, weightsFor(plan.input).weights) })}
        >
          Reset to the suggested split
        </button>
      )}
    </section>
  );
}

/** Hands the plan's occasion, people and gift budget to a new Gift Circle. */
function GiftCirclePanel({ plan }: { plan: Plan }) {
  const gifts = plan.budget.lines.find((l) => l.category === "gifts")?.amountMinor ?? 0;
  const params = new URLSearchParams({ currency: plan.budget.currency, people: String(plan.input.attendees), tier: plan.input.giftTier });
  if (gifts > 0) params.set("budget", String(fromMinor(gifts, plan.budget.currency)));
  if (festivalBySlug.has(plan.input.occasion)) params.set("festival", plan.input.occasion);
  return (
    <div className="rule rounded-xl border p-5" data-testid="plan-gift-circle">
      <p className="font-semibold">Giving gifts as a group?</p>
      <p className="note mt-1 max-w-2xl">
        Start a Gift Circle with this plan&rsquo;s occasion, {plan.input.attendees} {plan.input.attendees === 1 ? "person" : "people"}
        {gifts > 0 ? <> and its gift budget of {formatMoney(gifts, plan.budget.currency)}</> : null}. You can change everything before you create it.
      </p>
      <Link href={`/circles/new?${params}`} className="btn btn-plum btn-sm mt-3" data-testid="start-gift-circle">
        Start a Gift Circle from this plan
      </Link>
    </div>
  );
}

function SharePanel({ plan }: { plan: Plan }) {
  const [shares, setShares] = useStore(localShares);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const handle = shares.find((s) => s.planId === plan.id);
  const url = handle && typeof window !== "undefined" ? `${window.location.origin}/share/${handle.token}` : "";

  const create = async () => {
    setBusy(true);
    setMessage("");
    try {
      const token = await accessToken();
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { token?: string; revokeKey?: string; mode?: "demo" | "supabase"; error?: string };
      if (response.status === 401) setMessage("Sign in on the Account page to create a share link.");
      else if (!response.ok || !data.token) setMessage(data.error ?? "The link could not be created. Try again.");
      else {
        const next: ShareHandle = { planId: plan.id, token: data.token, revokeKey: data.revokeKey, mode: data.mode ?? "demo", createdAt: new Date().toISOString() };
        setShares((list) => [next, ...list.filter((s) => s.planId !== plan.id)]);
        track("plan_shared");
        setMessage("Share link created. Anyone with the link can view this version of the plan.");
      }
    } catch {
      setMessage("The link could not be created. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!handle) return;
    setBusy(true);
    try {
      const token = await accessToken();
      const response = await fetch(`/api/share/${handle.token}`, {
        method: "DELETE",
        headers: { ...(handle.revokeKey ? { "x-revoke-key": handle.revokeKey } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      });
      if (response.ok || response.status === 404) {
        setShares((list) => list.filter((s) => s.token !== handle.token));
        setMessage("Share link revoked. It no longer opens the plan.");
      } else setMessage("The link could not be revoked. Try again.");
    } catch {
      setMessage("The link could not be revoked. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-charcoal/15 p-5" data-testid="share-panel">
      <h3 className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">Share this plan</h3>
      {handle ? (
        <>
          <p className="note mt-1">This link shows a snapshot of the plan as it was when you shared it. It is private until you send it, and you can revoke it at any time.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input readOnly className="field max-w-md flex-1" value={url} aria-label="Share link" data-testid="share-url" onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn-plum btn-sm" onClick={() => navigator.clipboard?.writeText(url).then(() => setMessage("Link copied."))}>
              Copy link
            </button>
            <button type="button" className="btn btn-line btn-sm" onClick={revoke} disabled={busy}>
              Revoke link
            </button>
          </div>
          {handle.mode === "demo" && <p className="note mt-2">Demo sharing: this deployment has no database, so the link works only while the server keeps running. Connect Supabase for durable links.</p>}
        </>
      ) : (
        <>
          <p className="note mt-1">Nothing is shared until you create a link. The link contains a random token, never your details.</p>
          <button type="button" className="btn btn-plum btn-sm mt-3" onClick={create} disabled={busy}>
            {busy ? "Creating link…" : "Create share link"}
          </button>
        </>
      )}
      <p className="mt-2 text-sm font-medium" role="status" aria-live="polite" data-testid="share-status">
        {message}
      </p>
    </div>
  );
}

export function PlanView({ plan, onChange, onEditPreferences, aiEnabled = false }: Props) {
  const editable = Boolean(onChange);
  const [prefs] = useStore(preferences);
  const [saved] = useStore(localPlans);
  const [status, setStatus] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const reduceMotion = useReducedMotion();
  const isSaved = saved.some((p) => p.id === plan.id && p.updatedAt === plan.updatedAt);
  const now = () => new Date();

  const say = (text: string) => setStatus(text);
  const apply = (next: Plan | null, text: string, fallback = "") => {
    if (!next) return say(fallback);
    onChange?.(next);
    say(text);
  };

  const polish = async () => {
    setAiBusy(true);
    try {
      const response = await fetch("/api/matchmaker/concept", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ plan }) });
      const data = (await response.json()) as { mode: string; headline?: string; narrative?: string; message?: string };
      if (data.mode === "ai" && data.headline && data.narrative) {
        onChange?.({ ...plan, concept: { ...plan.concept, headline: data.headline, narrative: data.narrative, source: "ai" }, updatedAt: now().toISOString() });
        say("Introduction rewritten by AI. Items and budget are unchanged.");
      } else say(data.message ?? "AI writing is unavailable right now. The plan is unchanged.");
    } catch {
      say("AI writing is unavailable right now. The plan is unchanged.");
    } finally {
      setAiBusy(false);
    }
  };

  const text = () => planToText(plan);
  const fileBase = plan.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "festiva-plan";

  return (
    <article data-testid="plan" className="grid gap-12">
      <header>
        <p className="note">{editable ? "Your celebration plan" : "A celebration plan shared with you"}</p>
        <h2 className="display-1 mt-2" data-testid="plan-headline">
          {plan.concept.headline}
        </h2>
        <p className="lede mt-5 max-w-3xl">{plan.concept.narrative}</p>
        <p className="note mt-3">
          {plan.title}. {LABELS.duration[plan.input.duration]}, starting {plan.input.startTime}.{" "}
          {plan.concept.source === "ai" ? "Introduction written by an AI model from this plan; every item and number comes from FESTIVA's rules and guide." : "Generated by FESTIVA's rules from its curated guide; no AI model was used."}
        </p>
        <details className="mt-5 max-w-3xl">
          <summary className="link link-accent w-fit">How this plan was put together</summary>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink">
            {plan.concept.reasoning.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>

        {editable && (
          <div className="no-print mt-8 grid gap-5">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                className={`btn ${isSaved ? "btn-line" : "btn-saffron"}`}
                data-testid="save-plan"
                onClick={async () => {
                  const { cloud } = await savePlan(plan);
                  track("plan_saved");
                  say(cloud ? "Plan saved to your account and this device." : "Plan saved on this device. Find it under My plans.");
                }}
              >
                {isSaved ? "Saved" : "Save plan"}
              </button>
              <button type="button" className="btn btn-line" onClick={() => window.print()}>
                Print or save as PDF
              </button>
              <button type="button" className="btn btn-line" data-testid="export-text" onClick={() => download(`${fileBase}.txt`, text(), "text/plain;charset=utf-8")}>
                Download as text
              </button>
              <button type="button" className="btn btn-line" data-testid="export-json" onClick={() => download(`${fileBase}.json`, JSON.stringify(plan, null, 2), "application/json")}>
                Download data (JSON)
              </button>
              <button type="button" className="btn btn-line" onClick={() => navigator.clipboard?.writeText(text()).then(() => say("Plan copied as text."))}>
                Copy as text
              </button>
              {onEditPreferences && (
                <button type="button" className="btn btn-line" onClick={onEditPreferences}>
                  Change preferences
                </button>
              )}
              {aiEnabled && (
                <button type="button" className="btn btn-line" onClick={polish} disabled={aiBusy}>
                  {aiBusy ? "Writing…" : "Rewrite the introduction with AI"}
                </button>
              )}
            </div>
            <SharePanel plan={plan} />
            <GiftCirclePanel plan={plan} />
          </div>
        )}
        <p className="mt-4 text-sm font-medium text-emerald" role="status" aria-live="polite" data-testid="plan-status">
          {status}
        </p>
      </header>

      {plan.sections
        .filter((section) => section.items.length > 0 || editable)
        .map((section) => {
          const meta = SECTION_META[section.key];
          return (
            <section key={section.key} aria-labelledby={`section-${section.key}`} data-testid={`section-${section.key}`} className="rule grid gap-x-12 gap-y-3 border-t pt-7 lg:grid-cols-[0.36fr_1fr]">
              <div>
                <h3 id={`section-${section.key}`} className="display-3">
                  {meta.title}
                </h3>
                <div className="no-print mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {editable && section.key !== "context" && (
                    <button
                      type="button"
                      className="btn btn-line btn-sm"
                      onClick={() => apply(regenerateSection(plan, section.key, now()), `${meta.title} regenerated.`)}
                      aria-label={`${section.key === "schedule" ? "Rebuild from current items:" : "Regenerate"} ${meta.title}`}
                    >
                      {section.key === "schedule" ? "Rebuild from current items" : "Regenerate"}
                    </button>
                  )}
                  {section.key !== "schedule" && (
                    <Link href={meta.moduleHref} className="link note">
                      Explore in {meta.moduleLabel}
                    </Link>
                  )}
                </div>
              </div>
              {section.items.length === 0 ? (
                <p className="note self-center">Nothing in this section. Regenerate to add suggestions.</p>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {section.items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout={!reduceMotion}
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rule overflow-hidden border-t first:border-t-0"
                      >
                        <ItemRow
                          item={item}
                          sectionKey={section.key}
                          editable={editable}
                          onEdit={(patch) => apply(editItem(plan, section.key, item.id, patch, now()), `Saved your changes to “${patch.title}”.`)}
                          onReplace={() => {
                            const next = replaceItem(plan, section.key, item.id, now());
                            const added = next?.sections.find((s) => s.key === section.key)?.items.find((i) => !section.items.some((old) => old.id === i.id));
                            apply(next, `Replaced “${item.title}” with “${added?.title ?? "a new suggestion"}”.`, `There is no other suggestion for ${meta.title.toLowerCase()} in the guide yet.`);
                          }}
                          onRemove={() => apply(removeItem(plan, section.key, item.id, now()), `Removed “${item.title}”.`)}
                        />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </section>
          );
        })}

      <BudgetTable plan={plan} editable={editable} onChange={onChange} locale={prefs.locale} />
    </article>
  );
}
