import { brandBySlug, giftIdeas } from "../../data/shop";
import type { GiftIdea } from "../types";
import type { Circle, StructuredPreference } from "./schema";

/**
 * Transparent gift suggestions for one recipient.
 *
 * Candidates come only from FESTIVA's curated gift ideas, which carry no
 * prices. "Within budget" therefore means: within the gift tier the organiser
 * chose for the circle, with any figures coming from what people entered
 * themselves. Every suggestion lists the reasons it was chosen.
 */

export interface Suggestion {
  slug: string;
  title: string;
  category: GiftIdea["category"];
  tiers: GiftIdea["tiers"];
  note: string;
  reasons: string[];
  brands: { name: string; url: string }[];
  score: number;
}

export interface SuggestionOptions {
  count: number;
  /** When false, Elite-tier ideas are left out even if the circle's tier allows them. */
  premiumExperience: boolean;
}

const TIER_RANK = { everyday: 0, premium: 1, elite: 2 } as const;

const DIETARY_CONFLICTS: { dietary: RegExp; idea: RegExp; reason: string }[] = [
  { dietary: /nut/i, idea: /\bnut/i, reason: "contains nuts" },
  { dietary: /vegan/i, idea: /\b(chocolate|sweets)\b/i, reason: "may contain dairy" },
];

export function suggestGifts(circle: Pick<Circle, "giftTier" | "occasion">, profile: StructuredPreference, options: SuggestionOptions): Suggestion[] {
  const maxRank = Math.min(TIER_RANK[circle.giftTier], options.premiumExperience ? 2 : 1);
  const festival = circle.occasion.festivalSlug;
  const words = [...profile.likes, ...profile.materials].map((w) => w.toLowerCase());
  const avoid = profile.avoid.map((w) => w.toLowerCase());

  const scored: Suggestion[] = [];
  for (const idea of giftIdeas) {
    const allowedTiers = idea.tiers.filter((t) => TIER_RANK[t] <= maxRank);
    if (allowedTiers.length === 0) continue;

    const haystack = `${idea.title} ${idea.note} ${idea.category}`.toLowerCase();
    if (avoid.some((a) => a.length > 2 && haystack.includes(a))) continue;
    const conflict = DIETARY_CONFLICTS.find((c) => idea.category === "sweets-gourmet" && profile.dietary.some((d) => c.dietary.test(d)) && c.idea.test(`${idea.title} ${idea.note}`));
    if (conflict) continue;

    let score = 0;
    const reasons: string[] = [];
    if (profile.categories.includes(idea.category)) {
      score += 3;
      reasons.push("Matches a kind of gift they asked for");
    }
    const matchedWords = words.filter((w) => haystack.includes(w) || idea.interests.some((i) => i.includes(w)));
    if (matchedWords.length) {
      score += 2 * matchedWords.length;
      reasons.push(`Mentions what they like: ${matchedWords.join(", ")}`);
    }
    if (festival && idea.festivals.includes(festival)) {
      score += 2;
      reasons.push("A customary gift for this festival in FESTIVA's guide");
    } else if (idea.festivals.includes("any")) {
      score += 0.5;
    }
    if (profile.categories.length === 0 && words.length === 0) {
      reasons.push("No preferences yet, so this is a general suggestion");
    }
    reasons.push(`Fits the circle's ${allowedTiers.map((t) => t).join(" or ")} tier`);

    scored.push({
      slug: idea.slug,
      title: idea.title,
      category: idea.category,
      tiers: allowedTiers,
      note: idea.note,
      reasons,
      brands: idea.brands.map((slug) => brandBySlug.get(slug)).filter((b) => b !== undefined).map((b) => ({ name: b.name, url: b.officialUrl })),
      score,
    });
  }
  return scored.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug)).slice(0, Math.max(1, Math.min(12, options.count)));
}
