"use client";

import { PageSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { useMemo } from "react";
import { festivalBySlug } from "@/data/festivals";
import { BUDGET_LABELS } from "@/domain/budget";
import type { OrganiserView } from "@/domain/circle/engine";
import { fromMinor } from "@/domain/currency";
import { languageByTag } from "@/domain/languages";
import { generatePlan } from "@/domain/matchmaker/engine";
import {
  DEFAULT_INPUT,
  type MatchmakerInput,
} from "@/domain/matchmaker/schema";
import { CircleRing, LangText, Money, Notice, BudgetMeter } from "./ui";
import { useCircle } from "./useCircle";

function planInput(circle: OrganiserView): MatchmakerInput | null {
  const festival = circle.occasion.festivalSlug
    ? festivalBySlug.get(circle.occasion.festivalSlug)
    : null;
  if (!festival) return null;
  return {
    ...DEFAULT_INPUT,
    occasion: festival.slug,
    countryCode: festival.countries[0] ?? "IN",
    budget: fromMinor(circle.totalBudgetMinor, circle.currency),
    currency: circle.currency,
    attendees: Math.max(1, circle.participants.length),
    audience: "family",
    interests: ["gifting", "food"],
    activities: ["gift-exchange", "cooking"],
    giftTier: circle.giftTier,
  };
}

function matchmakerLink(circle: OrganiserView): string {
  const params = new URLSearchParams({
    budget: String(fromMinor(circle.totalBudgetMinor, circle.currency)),
    currency: circle.currency,
    giftTier: circle.giftTier,
    audience: "family",
  });
  if (circle.occasion.festivalSlug)
    params.set("occasion", circle.occasion.festivalSlug);
  return `/matchmaker?${params}`;
}

export function CircleSummary({ circleId }: { circleId: string }) {
  const { mounted, key, data, error } = useCircle(circleId, "organiser");
  const circle = data?.role === "organiser" ? data.circle : null;
  const inline = data?.capabilities.matchmakerInline ?? false;
  const plan = useMemo(() => {
    if (!circle || !inline) return null;
    const input = planInput(circle);
    return input
      ? generatePlan(input, { id: `circle-${circle.id}`, now: new Date() })
      : null;
  }, [circle, inline]);

  if (!mounted) return <PageSkeleton label="Loading…" variant="summary" />;
  if (!key)
    return (
      <Notice tone="warn">
        Only the organiser&rsquo;s browser can open the summary.
      </Notice>
    );
  if (error && !data) return <Notice tone="warn">{error.message}</Notice>;
  if (!data || data.role !== "organiser" || !circle)
    return <PageSkeleton label="Loading the summary…" variant="summary" />;

  const names = Object.fromEntries(
    circle.participants.map((p) => [p.id, p.name]),
  );
  const languages = [
    ...new Set(circle.preferences.map((p) => p.original.language)),
  ].map((t) => languageByTag.get(t)?.name ?? t);
  const insights = data.insights;
  const schedule =
    plan?.sections.find((s) => s.key === "schedule")?.items ?? [];

  return (
    <article data-testid="circle-summary">
      <div className="no-print">
        <Link href={`/circles/${circleId}`} className="link note">
          Back to the circle
        </Link>
      </div>
      <header className="grid items-center gap-8 py-8 lg:grid-cols-[1fr_auto]">
        <div>
          <h1 className="display-1">{circle.name}</h1>
          <p className="lede mt-3">
            {circle.occasion.label},{" "}
            {new Date(`${circle.celebrationDate}T00:00:00`).toLocaleDateString(
              "en-IN",
              {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              },
            )}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            <div>
              <dt className="note">People</dt>
              <dd className="font-[family-name:var(--font-display)] text-3xl">
                {circle.participants.length}
              </dd>
            </div>
            <div>
              <dt className="note">Preferences</dt>
              <dd className="font-[family-name:var(--font-display)] text-3xl">
                {circle.preferences.length}
              </dd>
            </div>
            <div>
              <dt className="note">Wishes</dt>
              <dd className="font-[family-name:var(--font-display)] text-3xl">
                {circle.wishlist.length}
              </dd>
            </div>
            <div>
              <dt className="note">Secret Santa</dt>
              <dd className="font-[family-name:var(--font-display)] text-3xl">
                {circle.assignments ? "Drawn" : "Not yet"}
              </dd>
            </div>
          </dl>
          {languages.length > 0 && (
            <p className="note mt-4">
              Preferences were shared in {languages.join(", ")}.
            </p>
          )}
        </div>
        <CircleRing
          names={circle.participants.map((p) => p.name)}
          total={circle.maxParticipants}
          centre={circle.occasion.label}
        />
      </header>

      <section className="rule border-t py-8" aria-labelledby="sum-people">
        <h2 id="sum-people" className="display-3">
          Everyone, in their own words
        </h2>
        <ul className="mt-5 grid gap-6 md:grid-cols-2">
          {circle.participants.map((p) => {
            const prefs = circle.preferences.filter(
              (x) => x.participantId === p.id,
            );
            const wishes = circle.wishlist.filter(
              (x) => x.participantId === p.id,
            );
            return (
              <li key={p.id} className="rule border-t pt-4">
                <p className="font-semibold">{p.name}</p>
                {prefs.length === 0 && (
                  <p className="note">No preferences shared.</p>
                )}
                {prefs.map((x) => (
                  <div key={x.id} className="mt-2">
                    <LangText
                      text={x.original.text}
                      lang={x.original.language}
                    />
                    {x.translation && (
                      <LangText
                        text={x.translation.text}
                        lang={x.translation.language}
                        className="note mt-1"
                      />
                    )}
                  </div>
                ))}
                {wishes.length > 0 && (
                  <p className="note mt-2">
                    Wishlist: {wishes.map((w) => w.title).join(", ")}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rule border-t py-8" aria-labelledby="sum-budget">
        <h2 id="sum-budget" className="display-3">
          Budget
        </h2>
        {insights ? (
          <>
            <div className="mt-6 max-w-2xl">
              <BudgetMeter
                targetMinor={insights.targetMinor}
                paidOfflineMinor={insights.paidOfflineMinor}
                pledgedMinor={insights.pledgedMinor}
                currency={circle.currency}
              />
            </div>
            <p className="max-w-2xl text-lg">
              <Money
                minor={insights.committedMinor}
                currency={circle.currency}
              />{" "}
              committed of{" "}
              <Money minor={insights.targetMinor} currency={circle.currency} />.{" "}
              {insights.gapMinor > 0 ? (
                <>
                  <Money minor={insights.gapMinor} currency={circle.currency} />{" "}
                  still to raise; an even share is{" "}
                  <Money
                    minor={insights.evenShareMinor}
                    currency={circle.currency}
                  />{" "}
                  each.
                </>
              ) : (
                "The target is covered."
              )}
            </p>
          </>
        ) : (
          <p className="mt-4">
            Target{" "}
            <Money minor={circle.totalBudgetMinor} currency={circle.currency} />
            .
          </p>
        )}
        <ul className="mt-4">
          {circle.participants.map((p) => {
            const c = circle.contributions.find(
              (x) => x.participantId === p.id,
            );
            return (
              <li
                key={p.id}
                className="rule flex justify-between border-t py-2 first:border-t-0"
              >
                <span>{names[p.id]}</span>
                <span>
                  {c ? (
                    <Money minor={c.amountMinor} currency={circle.currency} />
                  ) : (
                    <span className="note">Nothing recorded</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="note mt-3 text-[0.85rem]">
          Commitments recorded by each person. FESTIVA does not process
          payments.
        </p>
      </section>

      <section className="rule border-t py-8" aria-labelledby="sum-plan">
        <h2 id="sum-plan" className="display-3">
          The celebration
        </h2>
        {plan ? (
          <div className="mt-4" data-testid="inline-plan">
            <p className="font-[family-name:var(--font-display)] text-2xl">
              {plan.title}
            </p>
            <p className="mt-2 max-w-2xl">{plan.concept.narrative}</p>
            {schedule.length > 0 && (
              <ol className="mt-4 grid gap-2">
                {schedule.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <span className="w-14 shrink-0 tabular-nums text-ink">
                      {item.time}
                    </span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ol>
            )}
            <ul className="mt-4 grid gap-1 sm:grid-cols-2">
              {plan.budget.lines
                .filter((l) => l.amountMinor > 0)
                .map((l) => (
                  <li
                    key={l.category}
                    className="flex justify-between gap-4 border-b border-cream py-1"
                  >
                    <span>{BUDGET_LABELS[l.category]}</span>
                    <Money
                      minor={l.amountMinor}
                      currency={plan.budget.currency}
                    />
                  </li>
                ))}
            </ul>
            <p className="note mt-3 text-[0.85rem]">
              Drafted by FESTIVA&rsquo;s Matchmaker rules from the
              circle&rsquo;s festival, size and budget. Open it in the
              Matchmaker to edit, save and share.
            </p>
          </div>
        ) : (
          <p className="mt-4 max-w-2xl">
            Plan the day itself with the Matchmaker, starting from this
            circle&rsquo;s occasion and budget.
          </p>
        )}
        <div className="no-print mt-6 flex flex-wrap gap-3">
          <Link href={matchmakerLink(circle)} className="btn btn-saffron">
            Plan the celebration in the Matchmaker
          </Link>
          <button
            type="button"
            className="btn btn-line"
            onClick={() => window.print()}
          >
            Print or save as PDF
          </button>
        </div>
      </section>
    </article>
  );
}
