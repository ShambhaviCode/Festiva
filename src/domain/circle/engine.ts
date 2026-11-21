import { currencyDigits, toMinor } from "../currency";
import type { Rng } from "../random";
import { seeded } from "../random";
import {
  type Assignment,
  type Circle,
  type Contribution,
  type CreateCircleInput,
  type Participant,
  type Preference,
  type PreferenceInput,
  type WishlistItem,
} from "./schema";

/**
 * Pure Gift Circle operations. Every function returns a new circle (or throws a
 * CircleError); nothing here touches storage, the network or the clock beyond
 * the `now` it is given, so it can be unit-tested exactly and shared with a
 * future native app.
 */

export type CircleErrorCode =
  | "circle_full"
  | "not_found"
  | "forbidden"
  | "too_few_participants"
  | "assignments_locked"
  | "duplicate_name"
  | "invalid";

export class CircleError extends Error {
  constructor(
    public code: CircleErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CircleError";
  }
}

export interface Ids {
  next(): string;
}

export function createCircle(
  input: CreateCircleInput,
  ids: Ids,
  now: Date,
  maxParticipantsCap: number,
  assignedBy: Circle["onboardingAssignedBy"] = "none",
): { circle: Circle; organiser: Participant } {
  const at = now.toISOString();
  const organiser: Participant = { id: ids.next(), name: input.organiserName, language: input.organiserLanguage, role: "organiser", joinedAt: at };
  const circle: Circle = {
    id: ids.next(),
    name: input.name,
    occasion: { festivalSlug: input.festivalSlug, label: input.occasionLabel },
    celebrationDate: input.celebrationDate,
    contributionDeadline: input.contributionDeadline,
    currency: input.currency,
    totalBudgetMinor: toMinor(input.totalBudget, input.currency),
    perPersonBudgetMinor: input.perPersonBudget === null ? null : toMinor(input.perPersonBudget, input.currency),
    giftTier: input.giftTier,
    maxParticipants: Math.min(input.maxParticipants, maxParticipantsCap),
    organiserLanguage: input.organiserLanguage,
    onboardingVariant: input.onboardingVariant,
    onboardingAssignedBy: assignedBy,
    participants: [organiser],
    preferences: [],
    wishlist: [],
    contributions: [],
    assignments: null,
    createdAt: at,
    updatedAt: at,
  };
  return { circle, organiser };
}

const touch = (circle: Circle, now: Date): Circle => ({ ...circle, updatedAt: now.toISOString() });

export function addParticipant(circle: Circle, name: string, language: string, ids: Ids, now: Date): { circle: Circle; participant: Participant } {
  if (circle.participants.length >= circle.maxParticipants) throw new CircleError("circle_full", "This circle has reached its participant limit.");
  if (circle.participants.some((p) => p.name.localeCompare(name, undefined, { sensitivity: "base" }) === 0)) {
    throw new CircleError("duplicate_name", "Someone in this circle already uses that name. Add an initial to tell you apart.");
  }
  const participant: Participant = { id: ids.next(), name, language, role: "participant", joinedAt: now.toISOString() };
  return { circle: touch({ ...circle, participants: [...circle.participants, participant] }, now), participant };
}

export function removeParticipant(circle: Circle, participantId: string, now: Date): Circle {
  const target = circle.participants.find((p) => p.id === participantId);
  if (!target) throw new CircleError("not_found", "That participant is not in this circle.");
  if (target.role === "organiser") throw new CircleError("forbidden", "The organiser cannot be removed.");
  return touch(
    {
      ...circle,
      participants: circle.participants.filter((p) => p.id !== participantId),
      preferences: circle.preferences.filter((p) => p.participantId !== participantId),
      wishlist: circle.wishlist.filter((w) => w.participantId !== participantId),
      contributions: circle.contributions.filter((c) => c.participantId !== participantId),
      // Assignments that involved this person are no longer valid.
      assignments: circle.assignments?.pairs.some((pair) => pair.giverId === participantId || pair.receiverId === participantId) ? null : circle.assignments,
    },
    now,
  );
}

function requireParticipant(circle: Circle, participantId: string): Participant {
  const participant = circle.participants.find((p) => p.id === participantId);
  if (!participant) throw new CircleError("not_found", "That participant is not in this circle.");
  return participant;
}

export function addPreference(circle: Circle, participantId: string, input: PreferenceInput, ids: Ids, now: Date): { circle: Circle; preference: Preference } {
  requireParticipant(circle, participantId);
  if (circle.preferences.filter((p) => p.participantId === participantId).length >= 10) {
    throw new CircleError("invalid", "Each person can keep up to ten preferences. Delete one to add another.");
  }
  const preference: Preference = {
    id: ids.next(),
    participantId,
    source: input.source,
    original: { text: input.originalText, language: input.originalLanguage },
    translation: input.translation ? { ...input.translation, provider: "sarvam" } : null,
    transcript: input.source === "voice" && input.transcript ? { ...input.transcript, provider: "sarvam" } : null,
    structured: input.structured,
    structuredBy: input.structuredBy,
    createdAt: now.toISOString(),
  };
  return { circle: touch({ ...circle, preferences: [...circle.preferences, preference] }, now), preference };
}

/** Participants may delete their own preferences; the organiser may delete any. */
export function removePreference(circle: Circle, preferenceId: string, actor: Participant, now: Date): Circle {
  const preference = circle.preferences.find((p) => p.id === preferenceId);
  if (!preference) throw new CircleError("not_found", "That preference no longer exists.");
  if (actor.role !== "organiser" && preference.participantId !== actor.id) throw new CircleError("forbidden", "You can only delete your own preferences.");
  return touch({ ...circle, preferences: circle.preferences.filter((p) => p.id !== preferenceId) }, now);
}

export function addWishlistItem(
  circle: Circle,
  participantId: string,
  item: Omit<WishlistItem, "id" | "participantId" | "createdAt" | "estimateMinor"> & { estimate: number | null },
  ids: Ids,
  now: Date,
): { circle: Circle; item: WishlistItem } {
  requireParticipant(circle, participantId);
  if (circle.wishlist.filter((w) => w.participantId === participantId).length >= 20) throw new CircleError("invalid", "A wishlist can hold up to twenty items.");
  const created: WishlistItem = {
    id: ids.next(),
    participantId,
    title: item.title,
    category: item.category,
    note: item.note,
    link: item.link,
    estimateMinor: item.estimate === null ? null : toMinor(item.estimate, circle.currency),
    origin: item.origin,
    createdAt: now.toISOString(),
  };
  return { circle: touch({ ...circle, wishlist: [...circle.wishlist, created] }, now), item: created };
}

export function removeWishlistItem(circle: Circle, itemId: string, actor: Participant, now: Date): Circle {
  const item = circle.wishlist.find((w) => w.id === itemId);
  if (!item) throw new CircleError("not_found", "That wishlist item no longer exists.");
  if (actor.role !== "organiser" && item.participantId !== actor.id) throw new CircleError("forbidden", "You can only remove your own wishlist items.");
  return touch({ ...circle, wishlist: circle.wishlist.filter((w) => w.id !== itemId) }, now);
}

export function setContribution(circle: Circle, participantId: string, amount: number, status: Contribution["status"], now: Date): Circle {
  requireParticipant(circle, participantId);
  const entry: Contribution = { participantId, amountMinor: toMinor(amount, circle.currency), status, updatedAt: now.toISOString() };
  const others = circle.contributions.filter((c) => c.participantId !== participantId);
  return touch({ ...circle, contributions: entry.amountMinor === 0 ? others : [...others, entry] }, now);
}

/**
 * Secret Santa as a single cycle (Sattolo's algorithm): everyone gives exactly
 * once, receives exactly once, and nobody draws themselves. Needs at least
 * three people, because with two each would know who drew them.
 */
export function drawAssignments(participantIds: readonly string[], rng: Rng): Assignment[] {
  const n = participantIds.length;
  if (n < 3) throw new CircleError("too_few_participants", "Secret Santa needs at least three people.");
  const order = [...participantIds];
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * i); // 0 ≤ j < i: Sattolo, not Fisher–Yates
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.map((giverId, index) => ({ giverId, receiverId: order[(index + 1) % n] }));
}

export function generateAssignments(circle: Circle, seed: string, now: Date): Circle {
  const ids = circle.participants.map((p) => p.id);
  const pairs = drawAssignments(ids, seeded(`${circle.id}:${seed}`));
  return touch({ ...circle, assignments: { generatedAt: now.toISOString(), pairs } }, now);
}

export function clearAssignments(circle: Circle, now: Date): Circle {
  return touch({ ...circle, assignments: null }, now);
}

export function isValidDerangement(pairs: readonly Assignment[], participantIds: readonly string[]): boolean {
  const givers = new Set(pairs.map((p) => p.giverId));
  const receivers = new Set(pairs.map((p) => p.receiverId));
  return (
    pairs.length === participantIds.length &&
    givers.size === participantIds.length &&
    receivers.size === participantIds.length &&
    participantIds.every((id) => givers.has(id) && receivers.has(id)) &&
    pairs.every((p) => p.giverId !== p.receiverId)
  );
}

/* ------------------------------------------------------------------ */
/* Budget insights: deterministic integer arithmetic, never a model.   */
/* ------------------------------------------------------------------ */

export interface BudgetInsights {
  currency: string;
  targetMinor: number;
  pledgedMinor: number;
  paidOfflineMinor: number;
  committedMinor: number;
  /** Positive: still to raise. Negative: commitments exceed the target. */
  gapMinor: number;
  participants: number;
  contributors: number;
  notYetPledged: number;
  /** Target divided evenly, in minor units; the remainder goes to the first shares so they add up exactly. */
  evenShareMinor: number;
  evenShares: number[];
  perPersonBudgetMinor: number | null;
  wishlistOverPerPerson: { itemId: string; participantId: string; estimateMinor: number }[];
  daysToDeadline: number;
  deadlinePassed: boolean;
}

function dayNumber(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function evenSplit(totalMinor: number, people: number): number[] {
  if (!Number.isInteger(totalMinor) || totalMinor < 0 || !Number.isInteger(people) || people <= 0) return [];
  const base = Math.floor(totalMinor / people);
  const remainder = totalMinor - base * people;
  return Array.from({ length: people }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function budgetInsights(circle: Circle, today: string): BudgetInsights {
  const pledgedMinor = circle.contributions.filter((c) => c.status === "pledged").reduce((sum, c) => sum + c.amountMinor, 0);
  const paidOfflineMinor = circle.contributions.filter((c) => c.status === "paid-offline").reduce((sum, c) => sum + c.amountMinor, 0);
  const committedMinor = pledgedMinor + paidOfflineMinor;
  const contributors = new Set(circle.contributions.map((c) => c.participantId)).size;
  const shares = evenSplit(circle.totalBudgetMinor, circle.participants.length);
  const days = dayNumber(circle.contributionDeadline) - dayNumber(today);
  return {
    currency: circle.currency,
    targetMinor: circle.totalBudgetMinor,
    pledgedMinor,
    paidOfflineMinor,
    committedMinor,
    gapMinor: circle.totalBudgetMinor - committedMinor,
    participants: circle.participants.length,
    contributors,
    notYetPledged: circle.participants.length - contributors,
    evenShareMinor: shares[0] ?? 0,
    evenShares: shares,
    perPersonBudgetMinor: circle.perPersonBudgetMinor,
    wishlistOverPerPerson:
      circle.perPersonBudgetMinor === null
        ? []
        : circle.wishlist
            .filter((w) => w.estimateMinor !== null && w.estimateMinor > circle.perPersonBudgetMinor!)
            .map((w) => ({ itemId: w.id, participantId: w.participantId, estimateMinor: w.estimateMinor! })),
    daysToDeadline: days,
    deadlinePassed: days < 0,
  };
}

/* ------------------------------------------------------------------ */
/* Views: what each role is allowed to see.                            */
/* ------------------------------------------------------------------ */

export interface OrganiserView extends Omit<Circle, "assignments"> {
  assignments: { generatedAt: string; count: number } | null;
}

/** The organiser sees everything except who drew whom. */
export function organiserView(circle: Circle): OrganiserView {
  const { assignments, ...rest } = circle;
  return { ...rest, assignments: assignments ? { generatedAt: assignments.generatedAt, count: assignments.pairs.length } : null };
}

export interface ParticipantView {
  id: string;
  name: string;
  occasion: Circle["occasion"];
  celebrationDate: string;
  contributionDeadline: string;
  currency: string;
  totalBudgetMinor: number;
  perPersonBudgetMinor: number | null;
  giftTier: Circle["giftTier"];
  organiserLanguage: string;
  me: Participant;
  participants: { id: string; name: string; role: Participant["role"] }[];
  myPreferences: Preference[];
  myWishlist: WishlistItem[];
  myContribution: Contribution | null;
  /** Only the person this participant gives to, with what that person chose to share. */
  myAssignment: { receiver: { id: string; name: string; language: string }; preferences: Preference[]; wishlist: WishlistItem[] } | null;
  assignmentsGenerated: boolean;
}

export function participantView(circle: Circle, participantId: string): ParticipantView {
  const me = requireParticipant(circle, participantId);
  const pair = circle.assignments?.pairs.find((p) => p.giverId === participantId) ?? null;
  const receiver = pair ? circle.participants.find((p) => p.id === pair.receiverId) ?? null : null;
  return {
    id: circle.id,
    name: circle.name,
    occasion: circle.occasion,
    celebrationDate: circle.celebrationDate,
    contributionDeadline: circle.contributionDeadline,
    currency: circle.currency,
    totalBudgetMinor: circle.totalBudgetMinor,
    perPersonBudgetMinor: circle.perPersonBudgetMinor,
    giftTier: circle.giftTier,
    organiserLanguage: circle.organiserLanguage,
    me,
    participants: circle.participants.map((p) => ({ id: p.id, name: p.name, role: p.role })),
    myPreferences: circle.preferences.filter((p) => p.participantId === participantId),
    myWishlist: circle.wishlist.filter((w) => w.participantId === participantId),
    myContribution: circle.contributions.find((c) => c.participantId === participantId) ?? null,
    myAssignment: receiver
      ? {
          receiver: { id: receiver.id, name: receiver.name, language: receiver.language },
          preferences: circle.preferences.filter((p) => p.participantId === receiver.id),
          wishlist: circle.wishlist.filter((w) => w.participantId === receiver.id),
        }
      : null,
    assignmentsGenerated: circle.assignments !== null,
  };
}

/** Parse a major-unit amount typed by a person, respecting the currency's decimal places. */
export function parseAmount(raw: string, currency: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  const digits = currencyDigits(currency);
  const decimals = cleaned.split(".")[1]?.length ?? 0;
  if (!Number.isFinite(value) || decimals > digits) return null;
  return value;
}
