import { EMPTY_STRUCTURE, type StructuredPreference } from "./schema";

/**
 * Rules-based structuring of a gift preference.
 *
 * Works on English text: the participant's own words when they wrote in
 * English, otherwise the Sarvam translation they approved. It is deliberately
 * simple and explainable; each extracted field can be edited by the person
 * before it is saved. When Sarvam is configured, a model can propose the same
 * fields instead, and its output is validated against the same schema.
 */

type Category = StructuredPreference["categories"][number];

const CATEGORY_WORDS: [Category, RegExp][] = [
  ["cultural", /\b(hand ?made|hand-?crafted|handloom|hand-?woven|artisan|craft(s|ed)?|block[- ]print(ed)?|terracotta|pottery|folk art)\b/i],
  ["jewellery", /\b(jewell?e?ry|earrings?|necklaces?|pendants?|bangles?|rings?|bracelets?|anklets?)\b/i],
  ["sweets-gourmet", /\b(sweets?|mithai|chocolates?|dry ?fruits?|dried fruits?|nuts|snacks?|cookies|cake|tea|coffee|gourmet|ladd(oo|u)s?)\b/i],
  ["fashion", /\b(clothes|clothing|sarees?|saris?|kurtas?|stoles?|scarf|scarves|shawls?|dupattas?|dress(es)?|outfits?|shirts?|ethnic wear)\b/i],
  ["home-lifestyle", /\b(home|candles?|diyas?|lamps?|decor|décor|plants?|tableware|mugs?|cushions?|books?|kitchen)\b/i],
  ["personalised", /\b(personali[sz]ed|engraved|monogram(med)?|custom|with (my|their|her|his) name|photo (frame|book|album))\b/i],
];

const LIKE_PHRASES: [string, RegExp][] = [
  ["handmade", /\b(hand ?made|hand-?crafted|artisan)\b/i],
  ["handloom", /\b(handloom|hand-?woven)\b/i],
  ["eco-friendly", /\b(eco[- ]?friendly|sustainable|plastic[- ]free|recycled|upcycled)\b/i],
  ["books", /\bbooks?\b/i],
  ["plants", /\bplants?\b/i],
  ["music", /\bmusic\b/i],
  ["art", /\b(art|paintings?)\b/i],
  ["tea", /\btea\b/i],
  ["coffee", /\bcoffee\b/i],
  ["candles", /\bcandles?\b/i],
  ["traditional", /\btraditional\b/i],
  ["minimal", /\b(minimal(ist)?|simple)\b/i],
  ["experiences", /\b(experiences?|workshops?|classes)\b/i],
];

const DIETARY_WORDS: [string, RegExp][] = [
  ["vegetarian", /\bvegetarian\b/i],
  ["vegan", /\bvegan\b/i],
  ["Jain", /\bjain\b/i],
  ["nut-free", /\b(nut[- ]free|no nuts|nut allergy|allergic to (nuts|peanuts|cashews|almonds))\b/i],
  ["gluten-free", /\b(gluten[- ]free|no gluten|coeliac|celiac)\b/i],
  ["no added sugar", /\b(sugar[- ]free|no sugar|diabetic|less sugar)\b/i],
  ["eggless", /\b(eggless|egg[- ]free|no eggs?)\b/i],
  ["halal", /\bhalal\b/i],
];

const MATERIALS = ["silk", "cotton", "linen", "wool", "khadi", "leather", "wood", "brass", "copper", "silver", "gold", "clay", "terracotta", "bamboo", "glass", "jute", "ceramic"];

const AVOID_PATTERN = /\b(?:no|not|avoid|without|don'?t (?:want|like|need)|do not (?:want|like|need)|nothing|allergic to|dislike|hate)\s+(?:any\s+|more\s+)?([a-z][a-z\s-]{1,40}?)(?=[,.;!?]|\s+(?:and|but|or|please)\b|$)/gi;

const uniq = (items: string[]) => [...new Set(items.map((i) => i.trim()).filter(Boolean))];

export function structureByRules(englishText: string): StructuredPreference {
  const text = englishText.normalize("NFKC");
  if (!text.trim()) return { ...EMPTY_STRUCTURE };

  const avoid: string[] = [];
  for (const match of text.matchAll(AVOID_PATTERN)) {
    const phrase = match[1].trim().replace(/\s+/g, " ");
    if (phrase.split(" ").length <= 4) avoid.push(phrase.toLowerCase());
  }
  // Something mentioned only as a thing to avoid is not a liked category, interest or material.
  const positive = avoid.length ? text.replace(new RegExp(avoid.map(escape).join("|"), "gi"), " ") : text;
  const categories = CATEGORY_WORDS.filter(([, pattern]) => pattern.test(positive)).map(([category]) => category);
  const likes = LIKE_PHRASES.filter(([, pattern]) => pattern.test(positive)).map(([label]) => label);
  const dietary = DIETARY_WORDS.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
  const materials = MATERIALS.filter((m) => new RegExp(`\\b${m}\\b`, "i").test(positive));

  return {
    categories: uniq(categories).slice(0, 6) as Category[],
    likes: uniq(likes).slice(0, 8),
    avoid: uniq(avoid).slice(0, 8),
    dietary: uniq(dietary).slice(0, 6),
    materials: uniq(materials).slice(0, 6),
    notes: text.trim().slice(0, 280),
  };
}

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Combine every preference one person approved into a single profile for suggestions. */
export function mergeStructures(items: StructuredPreference[]): StructuredPreference {
  return {
    categories: uniq(items.flatMap((i) => i.categories)).slice(0, 6) as Category[],
    likes: uniq(items.flatMap((i) => i.likes)).slice(0, 8),
    avoid: uniq(items.flatMap((i) => i.avoid)).slice(0, 8),
    dietary: uniq(items.flatMap((i) => i.dietary)).slice(0, 6),
    materials: uniq(items.flatMap((i) => i.materials)).slice(0, 6),
    notes: "",
  };
}
