/**
 * Expert content reviews.
 *
 * A festival page says "reviewed" only when a record here names a real
 * reviewer who agreed to be named, their relevant standing, the date, and
 * what they checked. FESTIVA never marks content as reviewed on its own, and
 * AI-written text never counts as reviewed. The process is in
 * docs/CONTENT_REVIEW.md.
 *
 * There are no reviews yet: every festival is shown as "not yet reviewed by
 * a cultural expert".
 */
export interface ExpertReview {
  festival: string;
  /** The reviewer's name, as they agreed to be credited. */
  reviewer: string;
  /** Why their judgement is relevant, e.g. "Priest, St Mary's Ethiopian Orthodox Church". */
  credentials: string;
  /** ISO date of the review. */
  reviewedOn: string;
  /** What was checked, e.g. "History, significance and etiquette". */
  scope: string;
  notes?: string;
}

export const EXPERT_REVIEWS: ExpertReview[] = [];

export function reviewOf(festival: string): ExpertReview | undefined {
  return EXPERT_REVIEWS.find((r) => r.festival === festival);
}

/** What kind of statement each part of a festival page makes. */
export const CLAIM_KINDS = [
  { section: "History and origins", kind: "Documented history", note: "Summarised from the reference sources; where origins are traditional rather than documented, the text says so." },
  { section: "Why it matters", kind: "Belief and interpretation", note: "What the festival means to the people who keep it, as they describe it. Not a statement of fact about the divine." },
  { section: "Traditions and how it varies", kind: "Community practice", note: "Customs differ between families, places and generations." },
  { section: "Celebrating respectfully", kind: "Guidance", note: "General advice for guests; local custom comes first." },
] as const;
