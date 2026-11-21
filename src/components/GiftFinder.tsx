"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CURRENCIES } from "@/domain/currency";
import { LABELS } from "@/domain/matchmaker/schema";
import { normalise } from "@/domain/text";
import type { GiftCategory, GiftIdea, GiftTier } from "@/domain/types";
import { preferences, useStore } from "@/lib/store";
import { SaveButton } from "./SaveButton";

interface Props {
  ideas: GiftIdea[];
  brandNames: Record<string, string>;
  categoryLabels: Record<GiftCategory, string>;
  tierLabels: Record<GiftTier, string>;
}

const RECIPIENTS = Object.entries(LABELS.audience) as [string, string][];

/** Gift ideas filtered by tier, category and recipient. Ideas are types of gift, not product listings. */
export function GiftFinder({
  ideas,
  brandNames,
  categoryLabels,
  tierLabels,
}: Props) {
  const [tier, setTier] = useState<GiftTier | "">("");
  const [category, setCategory] = useState<GiftCategory | "">("");
  const [recipient, setRecipient] = useState("");
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [prefs, setPrefs] = useStore(preferences);

  const results = useMemo(() => {
    const tokens = normalise(query).split(" ").filter(Boolean);
    return ideas.filter((idea) => {
      if (tier && !idea.tiers.includes(tier)) return false;
      if (category && idea.category !== category) return false;
      if (recipient && !idea.recipients.includes(recipient)) return false;
      const text = ` ${normalise(`${idea.title} ${idea.note} ${idea.brands.map((b) => brandNames[b]).join(" ")}`)} `;
      return tokens.every((t) => text.includes(` ${t}`));
    });
  }, [ideas, tier, category, recipient, query, brandNames]);
  /** Ideas grouped by kind of gift, in the order the guide lists them. */
  const groups = useMemo(() => {
    const byCategory = new Map<GiftCategory, GiftIdea[]>();
    for (const idea of results)
      byCategory.set(idea.category, [
        ...(byCategory.get(idea.category) ?? []),
        idea,
      ]);
    return [...byCategory.entries()];
  }, [results]);

  const budgetNumber = Number(budget);
  const matchmakerHref =
    `/matchmaker?currency=${prefs.currency}` +
    (budget && Number.isFinite(budgetNumber) && budgetNumber > 0
      ? `&budget=${budgetNumber}`
      : "") +
    (tier ? `&giftTier=${tier}` : "") +
    (recipient ? `&audience=${recipient}` : "");

  return (
    <div>
      <form
        className="grid gap-5"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset>
          <legend className="field-label">Tier</legend>
          <div className="flex flex-wrap gap-2">
            {(["", "everyday", "premium", "elite"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className="chip"
                aria-pressed={tier === value}
                onClick={() => setTier(value)}
              >
                {value ? tierLabels[value] : "All tiers"}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <label className="grid">
            <span className="field-label">Search gift ideas</span>
            <input
              type="search"
              className="field min-w-64"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “silver”, “tea” or “handmade”"
            />
          </label>
          <label className="grid">
            <span className="field-label">Category</span>
            <select
              className="field min-w-48"
              value={category}
              onChange={(e) => setCategory(e.target.value as GiftCategory | "")}
            >
              <option value="">All categories</option>
              {(Object.entries(categoryLabels) as [GiftCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="grid">
            <span className="field-label">Who is it for?</span>
            <select
              className="field min-w-44"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="">Anyone</option>
              {RECIPIENTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="rounded-2xl bg-cream p-5">
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
            <label className="grid">
              <span className="field-label">Your gift budget</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                className="field w-40"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Optional"
              />
            </label>
            <label className="grid">
              <span className="field-label">Currency</span>
              <select
                className="field"
                value={prefs.currency}
                onChange={(e) =>
                  setPrefs({ ...prefs, currency: e.target.value })
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </label>
            <Link href={matchmakerHref} className="btn btn-plum">
              Plan gifts in the Matchmaker
            </Link>
          </div>
          <p className="note mt-3 max-w-2xl">
            FESTIVA has no live product feed, so it shows no prices and cannot
            filter by amount. Use the tier as a guide, and carry your budget
            into the Matchmaker, which will set aside a share of it for gifts.
          </p>
        </div>
      </form>

      <p
        className="note mt-8"
        role="status"
        aria-live="polite"
        data-testid="gift-count"
      >
        {results.length} gift {results.length === 1 ? "idea" : "ideas"}
      </p>
      <div className="mt-2" data-testid="gift-list">
        {groups.map(([cat, items]) => (
          <section
            key={cat}
            className="rule grid gap-x-12 gap-y-4 border-t py-8 lg:grid-cols-[0.3fr_1fr]"
            aria-labelledby={`gift-cat-${cat}`}
          >
            <div>
              <h3
                id={`gift-cat-${cat}`}
                className="display-3 lg:sticky lg:top-24"
              >
                {categoryLabels[cat]}
              </h3>
            </div>
            <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
              {items.map((idea) => (
                <li key={idea.slug} className="flex flex-col">
                  <h4 className="font-[family-name:var(--font-display)] text-[1.55rem] leading-tight">
                    {idea.title}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-saffron-deep">
                    {idea.tiers.map((t) => tierLabels[t]).join(" or ")}
                  </p>
                  <p className="mt-2 text-ink">{idea.note}</p>
                  {idea.brands.length > 0 && (
                    <p className="note mt-2">
                      Places to browse:{" "}
                      {idea.brands.map((slug, i) => (
                        <span key={slug}>
                          {i > 0 && ", "}
                          <Link href={`/shop/${slug}`} className="link">
                            {brandNames[slug]}
                          </Link>
                        </span>
                      ))}{" "}
                      (curated examples)
                    </p>
                  )}
                  <div className="mt-auto pt-4">
                    <SaveButton
                      kind="wishlist"
                      id={idea.slug}
                      name={idea.title}
                      small
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {results.length === 0 && (
        <p className="rule border-t py-8 text-ink">
          No gift ideas match. Try another tier or recipient.
        </p>
      )}
    </div>
  );
}
