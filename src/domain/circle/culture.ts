import { festivalBySlug } from "../../data/festivals";

/**
 * Verified cultural context for a circle's festival, taken only from FESTIVA's
 * curated guide (each festival carries its sources). Nothing here is generated.
 * AI-written suggestions are produced elsewhere and are always labelled as such.
 */
export interface VerifiedContext {
  festival: { slug: string; name: string; tagline: string };
  giftCustoms: string[];
  etiquette: string[];
  greetings: { text: string; language: string; meaning?: string }[];
  sources: { title: string; url: string }[];
  verification: string;
}

const GIFT_WORDS = /\b(gift|gifts|sweets|exchange|present|presents|new clothes|give|giving)\b/i;

export function verifiedContext(festivalSlug: string | null): VerifiedContext | null {
  if (!festivalSlug) return null;
  const festival = festivalBySlug.get(festivalSlug);
  if (!festival) return null;
  const giftActivities = festival.activities.filter(([type]) => type === "gift-exchange").map(([, text]) => text);
  return {
    festival: { slug: festival.slug, name: festival.name, tagline: festival.tagline },
    giftCustoms: [...festival.traditions.filter((t) => GIFT_WORDS.test(t)), ...giftActivities],
    etiquette: festival.etiquette,
    greetings: festival.greetings,
    sources: festival.provenance.sources.map((s) => ({ title: s.title, url: s.url })),
    verification: festival.provenance.verification,
  };
}
