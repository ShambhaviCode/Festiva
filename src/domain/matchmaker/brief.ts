import { normalise } from "../text";
import { CURRENCY_CODES } from "../currency";
import { AUDIENCES, DIETARY, DURATIONS, INTERESTS, STYLES, ACTIVITY_TYPES, matchmakerInputSchema, type MatchmakerInput } from "./schema";

/**
 * Turns a celebration described in plain words ("Diwali with six friends in Bengaluru, budget ₹5,000,
 * two days") into Matchmaker answers. This is the deterministic parser: it reads only what is written
 * and never guesses a value. Sarvam AI can read the same brief in Indian languages; whatever it returns
 * is validated against the same schema and merged by mergeBrief below.
 */
export interface BriefCatalog {
  occasions: { id: string; names: string[] }[];
  countries: { code: string; name: string }[];
  /** City name (lower case) → ISO country code, for cities FESTIVA knows. */
  cities: Record<string, string>;
}

export type BriefPatch = Partial<Pick<MatchmakerInput, "occasion" | "countryCode" | "city" | "budget" | "currency" | "attendees" | "audience" | "dietary" | "style" | "duration" | "interests" | "activities" | "foodStyle">>;

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, dozen: 12, a: 1, couple: 2,
};
const num = (w: string) => (/^\d+$/.test(w) ? Number(w) : NUMBER_WORDS[w]);
const NUM = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|dozen)";

const AUDIENCE_WORDS: [MatchmakerInput["audience"], RegExp][] = [
  ["friends", /\b(friends?|mates|buddies|pals)\b/],
  ["family", /\b(family|parents|relatives|cousins|grandparents?|in laws)\b/],
  ["colleagues", /\b(colleagues?|team|office|coworkers?|co workers?)\b/],
  ["partner", /\b(partner|wife|husband|girlfriend|boyfriend|spouse)\b/],
  ["children", /\b(kids|children|students)\b/],
  ["community", /\b(community|neighbou?rs|society|club)\b/],
];
const CURRENCY_WORDS: [string, RegExp][] = [
  ["INR", /(₹|\brs\.?|\binr\b|\brupees?\b)/],
  ["USD", /(\$|\busd\b|\bdollars?\b)/],
  ["EUR", /(€|\beur\b|\beuros?\b)/],
  ["GBP", /(£|\bgbp\b|\bpounds?\b)/],
  ["AED", /\b(aed|dirhams?)\b/],
  ["SGD", /\bsgd\b/],
  ["JPY", /(¥|\bjpy\b|\byen\b)/],
];
const DIET_WORDS: [MatchmakerInput["dietary"][number], RegExp][] = [
  ["vegetarian", /\b(vegetarian|veg only|pure veg|veg food)\b/],
  ["vegan", /\bvegan\b/],
  ["gluten-free", /\bgluten free\b/],
  ["nut-free", /\b(nut free|nut allerg\w*|no nuts)\b/],
  ["dairy-free", /\b(dairy free|no dairy|lactose)\b/],
  ["egg-free", /\b(egg free|no eggs?|eggless)\b/],
  ["no-alcohol", /\b(no alcohol|alcohol free|dry|teetotal)\b/],
  ["no-pork", /\bno pork\b/],
];
const STYLE_WORDS: [MatchmakerInput["style"], RegExp][] = [
  ["grand", /\b(grand|big|memorable|lavish|spectacular)\b/],
  ["intimate", /\b(intimate|cosy|cozy|small|quiet)\b/],
  ["eco", /\b(eco|sustainable|green|zero waste)\b/],
  ["playful", /\b(fun|playful|games night)\b/],
  ["modern", /\b(modern|contemporary|stylish)\b/],
  ["traditional", /\b(traditional|authentic|classic)\b/],
];
const INTEREST_WORDS: [MatchmakerInput["interests"][number], MatchmakerInput["activities"][number] | null, RegExp][] = [
  ["music", "music-dance", /\b(music|dance|dancing|garba|songs?|dj)\b/],
  ["games", "games", /\b(games?|quiz|cards)\b/],
  ["crafts", "crafts", /\b(crafts?|rangoli|diyas? painting|decorat\w*)\b/],
  ["food", "cooking", /\b(cook\w*|food|feast|sweets|dinner|lunch)\b/],
  ["gifting", "gift-exchange", /\b(gifts?|secret santa|exchange)\b/],
  ["outdoors", "outdoors", /\b(outdoors?|garden|terrace|park|picnic)\b/],
  ["storytelling", "storytelling", /\b(stor(y|ies)|storytelling)\b/],
];

/** Read a brief with rules only. Returns the answers found and a plain-English list of what was understood. */
export function parseBrief(text: string, catalog: BriefCatalog): { patch: BriefPatch; understood: string[] } {
  const raw = text.slice(0, 600);
  const t = ` ${normalise(raw)} `;
  const patch: BriefPatch = {};
  const understood: string[] = [];

  // Occasion: the longest festival or occasion name found in the text.
  let best: { id: string; name: string } | null = null;
  for (const o of catalog.occasions) {
    for (const n of o.names) {
      const k = normalise(n);
      if (k.length >= 3 && t.includes(` ${k} `) && (!best || k.length > normalise(best.name).length)) best = { id: o.id, name: n };
    }
  }
  if (best) { patch.occasion = best.id; understood.push(`Occasion: ${best.name}`); }

  // City and country.
  for (const [city, cc] of Object.entries(catalog.cities)) {
    if (t.includes(` ${normalise(city)} `)) { patch.city = city.replace(/\b\w/g, (c) => c.toUpperCase()); patch.countryCode = cc; understood.push(`Place: ${patch.city}`); break; }
  }
  if (!patch.countryCode) {
    for (const c of catalog.countries) {
      if (c.name.length >= 4 && t.includes(` in ${normalise(c.name)} `)) { patch.countryCode = c.code; understood.push(`Country: ${c.name}`); break; }
    }
  }

  // People: "six friends", "family of 8", "12 people", "with 5 colleagues".
  const people = t.match(new RegExp(`\\b${NUM} (friends?|people|guests|persons|of us|colleagues|kids|children|family members|relatives)\\b`));
  const familyOf = t.match(new RegExp(`\\bfamily of ${NUM}\\b`));
  if (familyOf) { patch.attendees = num(familyOf[1]); understood.push(`${patch.attendees} people`); }
  else if (people) {
    const n = num(people[1]);
    const withMe = /\bwith\b/.test(t.slice(Math.max(0, (people.index ?? 0) - 8), people.index ?? 0)) && /friends?|colleagues|family members|relatives/.test(people[2]);
    patch.attendees = withMe ? n + 1 : n;
    understood.push(withMe ? `${patch.attendees} people (you and ${n} ${people[2]})` : `${patch.attendees} people`);
  }

  for (const [aud, re] of AUDIENCE_WORDS) if (re.test(t)) { patch.audience = aud; understood.push(`With: ${aud}`); break; }

  // Budget: a number next to a currency sign or word, with "k" or "lakh" multipliers.
  const lower = raw.toLowerCase().replace(/,/g, "");
  const money = lower.match(/(₹|rs\.?|inr|\$|usd|€|eur|£|gbp|aed|sgd|¥|jpy)\s?(\d+(?:\.\d+)?)\s?(k|lakh|lakhs)?\b/) ?? lower.match(/(\d+(?:\.\d+)?)\s?(k|lakh|lakhs)?\s?(rupees|rs|inr|dollars|usd|euros|eur|pounds|gbp|aed|dirhams|yen)\b/);
  if (money) {
    const amountStr = /\d/.test(money[1]) ? money[1] : money[2];
    const mult = (/\d/.test(money[1]) ? money[2] : money[3]) ?? "";
    let amount = Number(amountStr) * (mult === "k" ? 1000 : mult.startsWith("lakh") ? 100000 : 1);
    if (Number.isFinite(amount) && amount > 0) {
      amount = Math.round(amount);
      patch.budget = amount;
      for (const [code, re] of CURRENCY_WORDS) if (re.test(money[0])) { patch.currency = code as MatchmakerInput["currency"]; break; }
      understood.push(`Budget: ${patch.currency ?? ""} ${amount.toLocaleString("en-IN")}`.replace("  ", " "));
    }
  }

  if (/\b(two days|2 days|weekend|couple of days|three days|3 days)\b/.test(t)) patch.duration = "weekend";
  else if (/\b(full day|all day|whole day)\b/.test(t)) patch.duration = "full-day";
  else if (/\b(half day|afternoon|morning)\b/.test(t)) patch.duration = "half-day";
  else if (/\b(evening|few hours|2 hours|two hours|dinner party)\b/.test(t)) patch.duration = "two-hours";
  if (patch.duration) understood.push(`Time: ${patch.duration.replace("-", " ")}`);

  const diet = DIET_WORDS.filter(([, re]) => re.test(t)).map(([d]) => d);
  if (diet.length) { patch.dietary = diet; understood.push(`Food: ${diet.join(", ")}`); }

  for (const [s, re] of STYLE_WORDS) if (re.test(t)) { patch.style = s; understood.push(`Style: ${s}`); break; }

  const found = INTEREST_WORDS.filter(([, , re]) => re.test(t));
  if (found.length) {
    patch.interests = [...new Set(found.map(([i]) => i))];
    patch.activities = [...new Set(found.map(([, a]) => a).filter((a): a is NonNullable<typeof a> => a !== null))];
    understood.push(`Likes: ${patch.interests.join(", ")}`);
  }
  return { patch, understood };
}

/** Keep only values that are valid Matchmaker answers (used for AI output, which is never trusted as-is). */
export function cleanPatch(raw: Record<string, unknown>, validOccasions: Set<string>): BriefPatch {
  const out: BriefPatch = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const oneOf = <T extends string>(v: unknown, list: readonly T[]) => (list as readonly string[]).includes(str(v)) ? (str(v) as T) : undefined;
  const occ = str(raw.occasion);
  if (validOccasions.has(occ)) out.occasion = occ;
  const cc = str(raw.countryCode).toUpperCase();
  if (/^[A-Z]{2}$/.test(cc)) out.countryCode = cc;
  if (str(raw.city)) out.city = str(raw.city).slice(0, 80);
  const budget = Number(raw.budget);
  if (Number.isFinite(budget) && budget > 0 && budget <= 1_000_000_000) out.budget = Math.round(budget);
  const cur = oneOf(raw.currency, CURRENCY_CODES); if (cur) out.currency = cur;
  const n = Number(raw.attendees);
  if (Number.isInteger(n) && n >= 1 && n <= 5000) out.attendees = n;
  const aud = oneOf(raw.audience, AUDIENCES); if (aud) out.audience = aud;
  const sty = oneOf(raw.style, STYLES); if (sty) out.style = sty;
  const dur = oneOf(raw.duration, DURATIONS); if (dur) out.duration = dur;
  const arr = <T extends string>(v: unknown, list: readonly T[]) => (Array.isArray(v) ? [...new Set(v.map(str).filter((x) => (list as readonly string[]).includes(x)))] as T[] : []);
  const diet = arr(raw.dietary, DIETARY); if (diet.length) out.dietary = diet;
  const ints = arr(raw.interests, INTERESTS); if (ints.length) out.interests = ints;
  const acts = arr(raw.activities, ACTIVITY_TYPES); if (acts.length) out.activities = acts;
  return out;
}

/** Apply a patch on top of base answers and validate the result. Never throws: invalid values are dropped. */
export function mergeBrief(base: MatchmakerInput, ...patches: BriefPatch[]): MatchmakerInput {
  const merged = Object.assign({}, base, ...patches) as MatchmakerInput;
  const parsed = matchmakerInputSchema.safeParse(merged);
  return parsed.success ? parsed.data : base;
}

/** A short, human summary of the answers a brief set, whichever reader found them. */
export function describePatch(patch: BriefPatch, occasionName: (id: string) => string | undefined): string[] {
  const out: string[] = [];
  if (patch.occasion) out.push(`Occasion: ${occasionName(patch.occasion) ?? patch.occasion}`);
  if (patch.city) out.push(`Place: ${patch.city}`);
  else if (patch.countryCode) out.push(`Country: ${patch.countryCode}`);
  if (patch.attendees) out.push(`${patch.attendees} ${patch.attendees === 1 ? "person" : "people"}`);
  if (patch.audience) out.push(`With: ${patch.audience}`);
  if (patch.budget !== undefined) out.push(`Budget: ${patch.currency ? `${patch.currency} ` : ""}${patch.budget.toLocaleString("en-IN")}`);
  if (patch.duration) out.push(`Time: ${patch.duration.replace("-", " ")}`);
  if (patch.dietary?.length) out.push(`Food: ${patch.dietary.join(", ")}`);
  if (patch.style) out.push(`Style: ${patch.style}`);
  if (patch.interests?.length) out.push(`Likes: ${patch.interests.join(", ")}`);
  return out;
}
