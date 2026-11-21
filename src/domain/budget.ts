/**
 * Budget arithmetic for the Matchmaker.
 * Everything here is deterministic integer maths on minor currency units
 * (paise, cents, yen…). No AI output is ever used for totals.
 */

export const BUDGET_CATEGORIES = ["food", "gifts", "decor", "attire", "activities", "music", "contingency"] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const BUDGET_LABELS: Record<BudgetCategory, string> = {
  food: "Food and drink",
  gifts: "Gifts",
  decor: "Decorations",
  attire: "Attire",
  activities: "Activities",
  music: "Music",
  contingency: "Set aside for surprises",
};

export const BUDGET_MODULE: Record<BudgetCategory, string | null> = {
  food: "/taste",
  gifts: "/shop",
  decor: null,
  attire: "/wear",
  activities: "/play",
  music: "/sound",
  contingency: null,
};

export interface BudgetLine {
  category: BudgetCategory;
  amountMinor: number;
}

export type Weights = Record<BudgetCategory, number>;

export const BASE_WEIGHTS: Weights = {
  food: 40,
  gifts: 15,
  decor: 12,
  attire: 8,
  activities: 10,
  music: 5,
  contingency: 10,
};

function assertMinor(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer of minor units`);
  }
}

/**
 * Split `totalMinor` across categories in proportion to `weights` using the
 * largest-remainder method, so the lines always add up to exactly the total.
 */
export function allocate(totalMinor: number, weights: Weights): BudgetLine[] {
  assertMinor(totalMinor, "totalMinor");
  const entries = BUDGET_CATEGORIES.map((category) => {
    const w = weights[category];
    if (!Number.isFinite(w) || w < 0) throw new RangeError(`Weight for ${category} must be >= 0`);
    return { category, weight: w };
  });
  const weightSum = entries.reduce((sum, e) => sum + e.weight, 0);
  if (weightSum === 0) {
    return entries.map((e) => ({ category: e.category, amountMinor: e.category === "contingency" ? totalMinor : 0 }));
  }
  const shares = entries.map((e) => {
    const exact = (totalMinor * e.weight) / weightSum;
    const floor = Math.floor(exact);
    return { category: e.category, floor, remainder: exact - floor };
  });
  let leftover = totalMinor - shares.reduce((sum, s) => sum + s.floor, 0);
  const order = [...shares].sort(
    (a, b) => b.remainder - a.remainder || BUDGET_CATEGORIES.indexOf(a.category) - BUDGET_CATEGORIES.indexOf(b.category),
  );
  const bonus = new Map<BudgetCategory, number>();
  for (const s of order) {
    if (leftover <= 0) break;
    bonus.set(s.category, 1);
    leftover -= 1;
  }
  return shares.map((s) => ({ category: s.category, amountMinor: s.floor + (bonus.get(s.category) ?? 0) }));
}

export function sumLines(lines: BudgetLine[]): number {
  return lines.reduce((sum, line) => {
    assertMinor(line.amountMinor, `amount for ${line.category}`);
    return sum + line.amountMinor;
  }, 0);
}

/** Positive when under budget, negative when the edited lines exceed it. */
export function remaining(totalMinor: number, lines: BudgetLine[]): number {
  assertMinor(totalMinor, "totalMinor");
  return totalMinor - sumLines(lines);
}

export function perHead(totalMinor: number, attendees: number): number {
  assertMinor(totalMinor, "totalMinor");
  if (!Number.isInteger(attendees) || attendees < 1) throw new RangeError("attendees must be a positive integer");
  return Math.floor(totalMinor / attendees);
}

export function setLine(lines: BudgetLine[], category: BudgetCategory, amountMinor: number): BudgetLine[] {
  assertMinor(amountMinor, "amountMinor");
  return lines.map((line) => (line.category === category ? { ...line, amountMinor } : line));
}

export interface WeightSignals {
  interests: readonly string[];
  style: string;
  attendees: number;
  audience: string;
}

/** Adjust the base split from what the person told the Matchmaker. Returned with the reasons used. */
export function weightsFor(signals: WeightSignals): { weights: Weights; reasons: string[] } {
  const w: Weights = { ...BASE_WEIGHTS };
  const reasons: string[] = [];
  const bump = (category: BudgetCategory, by: number, why: string) => {
    w[category] = Math.max(0, w[category] + by);
    reasons.push(why);
  };
  if (signals.interests.includes("food")) bump("food", 8, "More for food because you chose food as an interest.");
  if (signals.interests.includes("gifting")) bump("gifts", 8, "More for gifts because gifting matters to you.");
  if (signals.interests.includes("fashion")) bump("attire", 6, "More for attire because you chose fashion.");
  if (signals.interests.includes("music")) bump("music", 5, "More for music because you chose music.");
  if (signals.interests.includes("crafts") || signals.interests.includes("games")) {
    bump("activities", 5, "More for activities because you chose crafts or games.");
  }
  if (signals.style === "grand") bump("decor", 8, "A grand style puts more into decorations.");
  if (signals.style === "intimate") {
    bump("decor", -4, "An intimate style needs fewer decorations");
    w.food += 4;
  }
  if (signals.style === "eco") bump("decor", -4, "An eco-conscious style reuses and borrows, so decorations take less.");
  if (signals.attendees > 30) bump("food", 10, "Feeding more than 30 people takes a larger share for food.");
  if (signals.audience === "solo") bump("gifts", -10, "Celebrating solo, so the gift share is reduced.");
  return { weights: w, reasons };
}
