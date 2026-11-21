"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CERTAINTY_LABEL, daysBetween, formatRange, localToday, nextOccurrence, toISO } from "@/domain/dates";
import type { DateRule, Occurrence } from "@/domain/types";
import { preferences, useStore } from "@/lib/store";

export interface DatedFestival {
  slug: string;
  name: string;
  place: string;
  date: DateRule;
}

const subscribe = () => () => {};
/** Today's date as an ISO string on the client, and null during server rendering (dates are never baked into HTML). */
export function useToday(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => toISO(localToday()),
    () => null,
  );
}

function relative(days: number): string {
  if (days <= 0) return "Happening now";
  if (days === 1) return "Tomorrow";
  if (days < 60) return `In ${days} days`;
  return `In about ${Math.round(days / 30)} months`;
}

export function upcoming(items: DatedFestival[], todayISO: string, limit: number): { item: DatedFestival; occurrence: Occurrence; days: number }[] {
  const today = new Date(`${todayISO}T00:00:00Z`);
  return items
    .flatMap((item) => {
      const occurrence = nextOccurrence(item.date, today);
      if (!occurrence || occurrence.certainty === "seasonal") return [];
      return [{ item, occurrence, days: daysBetween(today, occurrence.start) }];
    })
    .sort((a, b) => a.occurrence.start.getTime() - b.occurrence.start.getTime())
    .slice(0, limit);
}

export function UpcomingList({ items, limit = 4, tone = "light" }: { items: DatedFestival[]; limit?: number; tone?: "light" | "dark" }) {
  const today = useToday();
  const [prefs] = useStore(preferences);
  // Reserve the list's height before today's date is known, so nothing below it shifts.
  const reserve = { minHeight: `${limit * 5.05}rem` };
  if (!today) {
    return (
      <p className="note" aria-live="polite" style={reserve}>
        Working out what is next on the calendar…
      </p>
    );
  }
  const list = upcoming(items, today, limit);
  return (
    <ol className={`grid content-start gap-0 ${tone === "dark" ? "on-dark" : ""}`} data-testid="upcoming-list" style={reserve}>
      {list.map(({ item, occurrence, days }) => (
        <li key={item.slug} className="rule border-t first:border-t-0">
          <Link href={`/discover/${item.slug}`} className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-0.5 py-3.5">
            <span className="font-[family-name:var(--font-display)] text-xl group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">{item.name}</span>
            <span className={`text-sm font-medium ${tone === "dark" ? "text-saffron" : "text-saffron-deep"}`}>{relative(days)}</span>
            <span className="note">{item.place}</span>
            <span className="note text-right" title={CERTAINTY_LABEL[occurrence.certainty]}>
              {formatRange(occurrence.start, occurrence.end, prefs.locale)}
              {occurrence.certainty === "projected" ? " (projected)" : ""}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Next-occurrence block for a festival page, with its certainty stated plainly. */
export function NextDate({ date, dateNote }: { date: DateRule; dateNote: string }) {
  const today = useToday();
  const [prefs] = useStore(preferences);
  const occurrence = today ? nextOccurrence(date, new Date(`${today}T00:00:00Z`)) : null;
  return (
    <div data-testid="next-date" className="min-h-[11rem]">
      {!today ? (
        <p className="display-3 font-[family-name:var(--font-display)]">…</p>
      ) : occurrence ? (
        <>
          <p className="display-3 font-[family-name:var(--font-display)]">
            {occurrence.certainty === "seasonal" ? "Seasonal" : formatRange(occurrence.start, occurrence.end, prefs.locale)}
          </p>
          <p className="mt-1 text-sm font-medium text-saffron-deep">{CERTAINTY_LABEL[occurrence.certainty]}</p>
          {occurrence.note && <p className="note mt-2">{occurrence.note}</p>}
          {occurrence.sources && occurrence.sources.length > 0 && (
            <p className="note mt-2">
              Date source{occurrence.sources.length > 1 ? "s" : ""}:{" "}
              {occurrence.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && "; "}
                  <a className="link link-accent" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.title}
                  </a>
                </span>
              ))}
              {occurrence.lastChecked ? `. Checked ${occurrence.lastChecked}.` : "."}
            </p>
          )}
        </>
      ) : (
        <>
          <p className="display-3 font-[family-name:var(--font-display)]">Date to be confirmed</p>
          <p className="note mt-1">FESTIVA has not yet checked a date for the next occurrence. Please confirm locally.</p>
        </>
      )}
      <p className="note mt-3">{dateNote}</p>
    </div>
  );
}
