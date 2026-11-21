import type { DateRule, Occurrence } from "./types";

/**
 * Festival date engine.
 * All arithmetic is done on UTC calendar dates so results never depend on the
 * server or device time zone. Fixed and rule-based festivals are computed;
 * lunar and regionally observed festivals come from a sourced table and are
 * never extrapolated beyond what has been checked.
 */

const DAY = 86_400_000;

export const utc = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day));

export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY);

export const toISO = (date: Date): string => date.toISOString().slice(0, 10);

export function parseISO(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Invalid ISO date: ${iso}`);
  return utc(Number(match[1]), Number(match[2]), Number(match[3]));
}

/** The viewer's calendar day, expressed as a UTC date for comparison. */
export function localToday(now: Date = new Date()): Date {
  return utc(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export const daysBetween = (from: Date, to: Date): number =>
  Math.round((to.getTime() - from.getTime()) / DAY);

/** Gregorian Easter Sunday (Anonymous Gregorian algorithm). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
}

/** nth (1-based) weekday of a month; nth = -1 means the last one. weekday: 0 = Sunday. */
export function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  if (nth > 0) {
    const first = utc(year, month, 1);
    const offset = (weekday - first.getUTCDay() + 7) % 7;
    return addDays(first, offset + (nth - 1) * 7);
  }
  const last = utc(year, month + 1, 0);
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return addDays(last, -offset);
}

function oktoberfest(year: number): { start: Date; end: Date } {
  // Opens on the first Saturday after 15 September; closes on the first Sunday
  // of October, extended to 3 October when that Sunday falls on the 1st or 2nd.
  let start = utc(year, 9, 16);
  while (start.getUTCDay() !== 6) start = addDays(start, 1);
  let end = nthWeekday(year, 10, 0, 1);
  if (end.getUTCDate() < 3) end = utc(year, 10, 3);
  return { start, end };
}

function midsummerSweden(year: number): { start: Date; end: Date } {
  // Midsummer Eve is the Friday between 19 and 25 June; Midsummer Day follows.
  let eve = utc(year, 6, 19);
  while (eve.getUTCDay() !== 5) eve = addDays(eve, 1);
  return { start: eve, end: addDays(eve, 1) };
}

/** The occurrence that starts in the given Gregorian year, if it can be known. */
export function occurrenceInYear(rule: DateRule, year: number): Occurrence | null {
  switch (rule.kind) {
    case "fixed": {
      const start = utc(year, rule.month, rule.day);
      return { start, end: addDays(start, rule.durationDays - 1), certainty: "fixed" };
    }
    case "nth-weekday": {
      const start = nthWeekday(year, rule.month, rule.weekday, rule.nth);
      return { start, end: addDays(start, rule.durationDays - 1), certainty: "rule" };
    }
    case "easter-offset": {
      const start = addDays(easterSunday(year), rule.offsetDays);
      return { start, end: addDays(start, rule.durationDays - 1), certainty: "rule" };
    }
    case "custom": {
      const range = rule.id === "oktoberfest" ? oktoberfest(year) : midsummerSweden(year);
      return { ...range, certainty: "rule" };
    }
    case "table": {
      const hit = rule.occurrences.find((o) => parseISO(o.start).getUTCFullYear() === year);
      if (!hit) return null;
      return {
        start: parseISO(hit.start),
        end: parseISO(hit.end),
        certainty: hit.status,
        note: hit.note,
        sources: hit.sources,
        lastChecked: hit.lastChecked,
      };
    }
    case "seasonal": {
      const first = Math.min(...rule.months);
      const last = Math.max(...rule.months);
      return { start: utc(year, first, 1), end: utc(year, last + 1, 0), certainty: "seasonal" };
    }
  }
}

/** The current or next occurrence on or after `today`, or null when FESTIVA has no checked date. */
export function nextOccurrence(rule: DateRule, today: Date): Occurrence | null {
  const year = today.getUTCFullYear();
  for (const candidate of [year - 1, year, year + 1, year + 2]) {
    const occurrence = occurrenceInYear(rule, candidate);
    if (occurrence && occurrence.end.getTime() >= today.getTime()) return occurrence;
  }
  return null;
}

/** Months (1–12) in which the festival usually falls, for calendar browsing. */
export function typicalMonths(rule: DateRule, referenceYear: number): number[] {
  if (rule.kind === "table") return rule.typicalMonths;
  if (rule.kind === "seasonal") return rule.months;
  const months = new Set<number>();
  // Sample a few years so movable feasts list every month they can touch.
  for (let y = referenceYear - 1; y <= referenceYear + 3; y += 1) {
    const o = occurrenceInYear(rule, y);
    if (!o) continue;
    months.add(o.start.getUTCMonth() + 1);
    months.add(o.end.getUTCMonth() + 1);
  }
  return [...months].sort((a, b) => a - b);
}

export function formatRange(start: Date, end: Date, locale = "en-GB"): string {
  const full = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  if (start.getTime() === end.getTime()) return full.format(start);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const startFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: sameMonth ? undefined : "long",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  });
  return `${startFmt.format(start)} – ${full.format(end)}`;
}

export const CERTAINTY_LABEL: Record<Occurrence["certainty"], string> = {
  fixed: "Fixed date",
  rule: "Calculated from the festival's calendar rule",
  verified: "Checked against published calendars",
  projected: "Projected; confirmed locally nearer the time",
  unchecked: "Not yet checked by FESTIVA; confirm locally",
  seasonal: "Seasonal; timing varies by place and year",
};

export function monthName(month: number, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(utc(2024, month, 1));
}
