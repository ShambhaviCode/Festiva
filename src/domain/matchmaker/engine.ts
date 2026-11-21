import { festivalBySlug } from "@/data/festivals";
import { foods } from "@/data/foods";
import { attire } from "@/data/attire";
import { destinations } from "@/data/destinations";
import { brandBySlug, giftIdeas } from "@/data/shop";
import { artists, genreBySlug, playlists } from "@/data/music";
import { countryName } from "@/data/countries";
import { ACTIVITY_LIBRARY, DECOR_LIBRARY, DRESS_LIBRARY, GENERIC_GREETINGS, GENERIC_OCCASIONS } from "@/data/matchmaker";
import type { Allergen, Festival, Food } from "../types";
import { allocate, perHead, weightsFor } from "../budget";
import { formatMoney, toMinor } from "../currency";
import { CERTAINTY_LABEL, formatRange, nextOccurrence } from "../dates";
import { seeded, shuffle, slugify } from "../random";
import { LABELS, MINOR_BANDS, type MatchmakerInput, type Plan, type PlanItem, type PlanSection, type SectionKey } from "./schema";

/**
 * FESTIVA Matchmaker engine.
 *
 * A deterministic, rules-based planner: every recommendation is selected from
 * FESTIVA's curated dataset by explicit scoring rules, and each item records
 * the reason it was chosen. It needs no AI credentials. When an AI provider is
 * configured, only the concept narrative may be rewritten (see lib/ai); the
 * items, schedule and budget always come from this module.
 */

export const SECTION_META: Record<SectionKey, { title: string; moduleHref: string; moduleLabel: string; replaceable: boolean }> = {
  schedule: { title: "Schedule", moduleHref: "/matchmaker", moduleLabel: "Matchmaker", replaceable: false },
  food: { title: "Food", moduleHref: "/taste", moduleLabel: "Taste", replaceable: true },
  gifts: { title: "Gift ideas", moduleHref: "/shop", moduleLabel: "Shop", replaceable: true },
  attire: { title: "Attire", moduleHref: "/wear", moduleLabel: "Wear", replaceable: true },
  decor: { title: "Decorations", moduleHref: "/discover", moduleLabel: "Discover", replaceable: true },
  activities: { title: "Activities", moduleHref: "/play", moduleLabel: "Play", replaceable: true },
  music: { title: "Music", moduleHref: "/sound", moduleLabel: "Sound", replaceable: true },
  greetings: { title: "Greetings", moduleHref: "/wishes", moduleLabel: "Wishes", replaceable: true },
  destinations: { title: "Places connected to this celebration", moduleHref: "/journeys", moduleLabel: "Journeys", replaceable: true },
  context: { title: "Cultural context", moduleHref: "/discover", moduleLabel: "Discover", replaceable: false },
};

interface Candidate extends Omit<PlanItem, "id"> {
  score: number;
}

const COUNTS: Record<MatchmakerInput["duration"], { food: number; activities: number }> = {
  "two-hours": { food: 2, activities: 2 },
  "half-day": { food: 3, activities: 3 },
  "full-day": { food: 4, activities: 4 },
  weekend: { food: 5, activities: 5 },
};

const DIET_EXCLUDES: Partial<Record<MatchmakerInput["dietary"][number], Allergen>> = {
  "gluten-free": "gluten",
  "nut-free": "nuts",
  "dairy-free": "dairy",
  "egg-free": "egg",
  "no-pork": "pork",
  "no-alcohol": "alcohol",
};

/** Anyone under 18 is coming. */
export const minorsPresent = (input: MatchmakerInput): boolean => input.ageBands.some((band) => MINOR_BANDS.includes(band));

/** Dietary filters actually applied: the guests' own, plus no alcohol whenever children or teenagers are coming. */
export function effectiveDietary(input: MatchmakerInput): MatchmakerInput["dietary"] {
  return minorsPresent(input) && !input.dietary.includes("no-alcohol") ? [...input.dietary, "no-alcohol"] : input.dietary;
}

export function occasionOf(input: MatchmakerInput): { festival?: Festival; label: string } {
  const festival = festivalBySlug.get(input.occasion);
  if (festival) return { festival, label: festival.name };
  const generic = GENERIC_OCCASIONS.find((o) => o.id === input.occasion);
  return { label: generic?.label ?? input.occasion };
}

export function foodAllowed(food: Food, dietary: readonly MatchmakerInput["dietary"][number][]): boolean {
  if (dietary.includes("vegan") && !food.vegan) return false;
  if (dietary.includes("vegetarian") && !food.vegetarian) return false;
  return dietary.every((need) => {
    const allergen = DIET_EXCLUDES[need];
    return !allergen || !food.contains.includes(allergen);
  });
}

function foodCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const out: Candidate[] = [];
  const dietary = effectiveDietary(input);
  for (const food of foods) {
    if (!foodAllowed(food, dietary)) continue;
    const forFestival = festival ? food.festivals.includes(festival.slug) : false;
    const fromCountry = food.country === input.countryCode;
    if (!forFestival && !fromCountry) continue;
    let score = (forFestival ? 5 : 0) + (fromCountry ? 2 : 0);
    if (input.foodStyle === "sweets" && food.type === "sweet") score += 2;
    if (input.foodStyle === "light" && food.type !== "main") score += 2;
    if (input.foodStyle === "feast" && food.type === "main") score += 2;
    if (input.foodStyle === "traditional" && forFestival) score += 1;
    const why = [forFestival && festival ? `On the table for ${festival.name}` : `From ${countryName(food.country)}`];
    if (dietary.length > 0) {
      why.push(`fits ${dietary.map((d) => LABELS.dietary[d].toLowerCase()).join(", ")} in its typical recipe (confirm ingredients)`);
    }
    out.push({
      title: food.name,
      detail: food.background,
      reason: `${why.join("; ")}.`,
      kind: "suggestion",
      href: `/taste/${food.slug}`,
      score,
    });
  }
  return out;
}

function giftCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  return giftIdeas
    .filter((idea) => idea.tiers.includes(input.giftTier) && idea.recipients.includes(input.audience))
    .map((idea) => {
      const forFestival = festival ? idea.festivals.includes(festival.slug) : false;
      const anyFestival = idea.festivals.includes("any");
      const interestHit = idea.interests.some((i) => (input.interests as string[]).includes(i));
      const brandNames = idea.brands.map((slug) => brandBySlug.get(slug)?.name).filter(Boolean);
      const why = [`Suits ${LABELS.audience[input.audience].toLowerCase()} at the ${LABELS.giftTier[input.giftTier].toLowerCase()} tier`];
      if (forFestival && festival) why.push(`a customary kind of gift for ${festival.name}`);
      if (interestHit) why.push("matches an interest you chose");
      return {
        title: idea.title,
        detail:
          idea.note +
          (brandNames.length > 0
            ? ` Places to browse: ${brandNames.join(", ")} (catalogue examples, not partnerships; FESTIVA shows no prices).`
            : ""),
        reason: `${why.join("; ")}.`,
        kind: "suggestion" as const,
        href: "/shop",
        score: (forFestival ? 3 : anyFestival ? 1 : 0) + (interestHit ? 1 : 0),
      };
    });
}

function attireCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const out: Candidate[] = [];
  for (const item of attire) {
    const forFestival = festival ? item.festivals.includes(festival.slug) : false;
    const fromCountry = item.country === input.countryCode;
    if (!forFestival && !fromCountry) continue;
    out.push({
      title: item.name,
      detail: `${item.summary} ${item.wearing}`,
      reason: forFestival && festival ? `Worn for ${festival.name}.` : `Traditional dress from ${countryName(item.country)}.`,
      kind: "suggestion",
      href: `/wear/${item.slug}`,
      score: (forFestival ? 4 : 0) + (fromCountry ? 2 : 0) + (input.interests.includes("fashion") ? 1 : 0),
    });
  }
  for (const idea of DRESS_LIBRARY) {
    const fits = idea.styles.includes(input.style);
    out.push({
      title: idea.title,
      detail: idea.detail,
      reason: fits ? `Fits the ${LABELS.style[input.style].toLowerCase()} style you chose.` : "A simple dress note that works for any gathering.",
      kind: "suggestion",
      href: "/wear",
      score: fits ? 2 : 0,
    });
  }
  return out;
}

function decorCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const out: Candidate[] = [];
  if (festival) {
    for (const title of festival.decor) {
      out.push({
        title,
        detail: `A decoration associated with ${festival.name}.`,
        reason: `Drawn from the traditions of ${festival.name}.`,
        kind: "suggestion",
        href: `/discover/${festival.slug}`,
        score: 3 + (input.style === "traditional" ? 1 : 0),
      });
    }
  }
  for (const idea of DECOR_LIBRARY) {
    const fits = idea.styles.includes(input.style);
    out.push({
      title: idea.title,
      detail: idea.detail,
      reason: fits ? `Fits the ${LABELS.style[input.style].toLowerCase()} style you chose.` : "A simple idea that works for any gathering.",
      kind: "suggestion",
      score: fits ? (input.style === "eco" || input.style === "modern" || input.style === "playful" ? 4 : 2) : 0,
    });
  }
  return out;
}

function activityCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const out: Candidate[] = [];
  if (festival) {
    for (const [type, title] of festival.activities) {
      // A secular gathering leaves out religious rites; a religious one puts them first.
      if (type === "ritual" && input.observance === "secular") continue;
      const preferred = input.activities.includes(type);
      const rite = type === "ritual" && input.observance === "religious";
      out.push({
        title,
        detail: `${LABELS.activities[type]}, in the spirit of ${festival.name}.`,
        reason: rite
          ? `Part of keeping ${festival.name} with its religious rites, as you chose.`
          : preferred
            ? `Part of ${festival.name}, and a kind of activity you asked for.`
            : `Part of how ${festival.name} is celebrated.`,
        kind: "suggestion",
        href: `/discover/${festival.slug}`,
        score: 4 + (preferred ? 3 : 0) + (rite ? 3 : 0),
      });
    }
  }
  const minors = minorsPresent(input);
  for (const activity of ACTIVITY_LIBRARY) {
    if (!activity.audiences.includes(input.audience)) continue;
    if (activity.type === "ritual" && input.observance === "secular") continue;
    const preferred = input.activities.includes(activity.type);
    const interest = activity.interests.some((i) => (input.interests as string[]).includes(i));
    const forChildren = minors && activity.audiences.includes("children");
    const base = preferred
      ? `You asked for ${LABELS.activities[activity.type].toLowerCase()}; works for ${LABELS.audience[input.audience].toLowerCase()}`
      : `Works well for ${LABELS.audience[input.audience].toLowerCase()}`;
    out.push({
      title: activity.title,
      detail: activity.detail,
      reason: `${base}${forChildren ? ", and suits the children coming" : ""}.`,
      kind: "suggestion",
      href: activity.href,
      score: (preferred ? 3 : 0) + (interest ? 2 : 0) + 1 + (forChildren ? 2 : 0),
    });
  }
  return out;
}

function musicCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const country = countryName(input.countryCode);
  const genreSlugs = festival ? festival.genres : [];
  const out: Candidate[] = [];
  for (const artist of artists) {
    const genreHit = genreSlugs.includes(artist.genre);
    const countryHit = artist.country === country;
    if (!genreHit && !countryHit && genreSlugs.length > 0) continue;
    const genre = genreBySlug.get(artist.genre);
    const song = artist.songs[0];
    out.push({
      title: song ? `${artist.name}: “${song}”` : artist.name,
      detail: `${genre?.name ?? artist.genre} from ${artist.country}. Listen on a licensed service through Sound.`,
      reason:
        genreHit && festival
          ? `${genre?.name} suits ${festival.name} in FESTIVA's guide${countryHit ? `, and the artist is from ${country}` : ""}.`
          : countryHit
            ? `An artist from ${country}.`
            : "A widely loved artist to start a shared playlist.",
      kind: "suggestion",
      href: `/sound?q=${encodeURIComponent(artist.name)}`,
      score: (genreHit ? 2 : 0) + (countryHit ? 3 : 0),
    });
  }
  for (const playlist of playlists) {
    out.push({
      title: `Playlist: ${playlist.title}`,
      detail: playlist.mood,
      reason: "A FESTIVA playlist to run in the background.",
      kind: "suggestion",
      href: `/sound#${playlist.slug}`,
      score: 1,
    });
  }
  return out;
}

function greetingCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const out: Candidate[] = [];
  if (festival) {
    for (const greeting of festival.greetings) {
      out.push({
        title: greeting.text,
        detail: greeting.meaning ? `${greeting.language}: ${greeting.meaning}.` : greeting.language,
        reason: `A traditional greeting for ${festival.name}.`,
        kind: "fact",
        href: `/wishes?festival=${festival.slug}`,
        score: 3,
      });
    }
  }
  out.push({
    title: GENERIC_GREETINGS[input.audience],
    detail: "A message in your own words. Personalise it and turn it into a card in Wishes.",
    reason: `Written for ${LABELS.audience[input.audience].toLowerCase()}.`,
    kind: "suggestion",
    href: festival ? `/wishes?festival=${festival.slug}` : "/wishes",
    score: 2,
  });
  return out;
}

function destinationCandidates(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const out: Candidate[] = [];
  for (const place of destinations) {
    const forFestival = festival ? place.festivals.includes(festival.slug) : false;
    const inCountry = place.country === input.countryCode;
    if (!forFestival && !inCountry) continue;
    out.push({
      title: `${place.name}, ${countryName(place.country)}`,
      detail: place.summary,
      reason: forFestival && festival ? `A place where ${festival.name} is celebrated.` : `A cultural destination in ${countryName(place.country)}.`,
      kind: "fact",
      href: `/journeys/${place.slug}`,
      score: (forFestival ? 3 : 0) + (inCountry ? 2 : 0) + (input.interests.includes("travel") ? 1 : 0),
    });
  }
  return out;
}

/**
 * Practical notes for the guests' ages and for how the occasion is kept.
 * General hosting guidance only: FESTIVA does not prescribe religious practice.
 */
function guestNotes(input: MatchmakerInput, festival?: Festival): Candidate[] {
  const notes: Candidate[] = [];
  const name = festival?.name ?? "the celebration";
  if (input.observance === "religious") {
    notes.push({
      title: "Keeping the religious rites",
      detail: `Follow the rites your family, temple, church, mosque, gurdwara or community keeps for ${name}, and let whoever leads them set the timing. Practice differs between communities, so FESTIVA does not prescribe it.`,
      reason: "You chose to keep it with its religious rites.",
      kind: "suggestion",
      score: 0,
    });
  } else if (input.observance === "secular") {
    notes.push({
      title: "A secular gathering",
      detail: `Religious rites are left out of this plan. Some guests may still observe ${name} religiously; a quiet corner or a moment for them to do so is a kind gesture.`,
      reason: "You chose a secular gathering.",
      kind: "suggestion",
      score: 0,
    });
  }
  if (minorsPresent(input)) {
    notes.push({
      title: "With children and teenagers",
      detail: "No alcohol is suggested. Keep candles, lamps, open flames and any fireworks under adult supervision, and agree in advance who is responsible for the youngest guests.",
      reason: `Ages you chose: ${input.ageBands.map((b) => LABELS.ageBands[b]).join(", ")}.`,
      kind: "suggestion",
      score: 0,
    });
  }
  if (input.ageBands.includes("under-5")) {
    notes.push({
      title: "For the under-fives",
      detail: "Whole nuts, hard sweets and small round foods are choking hazards for young children; cut food small or keep it out of reach. Plan somewhere quiet for naps.",
      reason: "You told the Matchmaker that children under 5 are coming.",
      kind: "suggestion",
      score: 0,
    });
  }
  if (input.ageBands.includes("over-65")) {
    notes.push({
      title: "For older guests",
      detail: "Offer seating near the action, step-free access and good lighting, keep music at a level that allows conversation, and serve the meal at a regular time.",
      reason: "You told the Matchmaker that guests over 65 are coming.",
      kind: "suggestion",
      score: 0,
    });
  }
  return notes;
}

function contextItems(input: MatchmakerInput, now: Date, festival?: Festival): Candidate[] {
  return [...festivalContext(input, now, festival), ...guestNotes(input, festival)];
}

function festivalContext(input: MatchmakerInput, now: Date, festival?: Festival): Candidate[] {
  if (!festival) {
    return [
      {
        title: "Make it yours",
        detail:
          "This occasion has no fixed tradition in FESTIVA's guide, so the plan draws on your country, audience and preferences rather than on a specific festival.",
        reason: "Shown so you know where the suggestions come from.",
        kind: "suggestion",
        score: 0,
      },
    ];
  }
  const items: Candidate[] = [
    {
      title: `What ${festival.name} celebrates`,
      detail: festival.significance,
      reason: "From FESTIVA's festival guide.",
      kind: "fact",
      href: `/discover/${festival.slug}`,
      score: 0,
    },
  ];
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const next = nextOccurrence(festival.date, today);
  items.push({
    title: "When it falls",
    detail: next
      ? `${festival.dateNote} Next: ${formatRange(next.start, next.end)} (${CERTAINTY_LABEL[next.certainty].toLowerCase()}).`
      : `${festival.dateNote} FESTIVA has no checked date for the next occurrence yet; confirm locally.`,
    reason: "Dates can vary by region and community, so check before you send invitations.",
    kind: "fact",
    href: `/discover/${festival.slug}`,
    score: 0,
  });
  for (const note of festival.etiquette.slice(0, 2)) {
    items.push({ title: "Good to know", detail: note, reason: "Guidance for celebrating respectfully.", kind: "fact", score: 0 });
  }
  const country = countryName(input.countryCode);
  const local = festival.regionalVariations.find((v) => v.place.includes(country));
  if (local) {
    items.push({ title: `In ${local.place}`, detail: local.text, reason: `You are celebrating in ${country}.`, kind: "fact", score: 0 });
  }
  if (!festival.countries.includes(input.countryCode)) {
    items.push({
      title: `Celebrating in ${country}`,
      detail: `${festival.name} is most closely associated with ${festival.countries.map(countryName).join(", ")}. Look for local community events, and confirm the date observed where you are.`,
      reason: "Your country is outside the festival's main regions in FESTIVA's guide.",
      kind: "suggestion",
      score: 0,
    });
  }
  return items;
}

function candidatesFor(key: SectionKey, input: MatchmakerInput, now: Date, festival?: Festival): Candidate[] {
  switch (key) {
    case "food":
      return foodCandidates(input, festival);
    case "gifts":
      return giftCandidates(input, festival);
    case "attire":
      return attireCandidates(input, festival);
    case "decor":
      return decorCandidates(input, festival);
    case "activities":
      return activityCandidates(input, festival);
    case "music":
      return musicCandidates(input, festival);
    case "greetings":
      return greetingCandidates(input, festival);
    case "destinations":
      return destinationCandidates(input, festival);
    case "context":
      return contextItems(input, now, festival);
    case "schedule":
      return [];
  }
}

function countFor(key: SectionKey, input: MatchmakerInput): number {
  switch (key) {
    case "food":
      return COUNTS[input.duration].food;
    case "activities":
      return COUNTS[input.duration].activities;
    case "gifts":
      return 3;
    case "attire":
      return 2;
    case "decor":
      return 3;
    case "music":
      return input.interests.includes("music") ? 4 : 3;
    case "greetings":
      return 3;
    case "destinations":
      return 2;
    default:
      return 20;
  }
}

const itemId = (key: SectionKey, title: string): string => `${key}:${slugify(title).slice(0, 80)}`;

const toItem = (key: SectionKey, candidate: Candidate): PlanItem => {
  const { score: _score, ...rest } = candidate;
  void _score;
  return { id: itemId(key, candidate.title), ...rest };
};

function rank(candidates: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  return [...candidates]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .filter((c) => (seen.has(c.title) ? false : (seen.add(c.title), true)));
}

function select(key: SectionKey, input: MatchmakerInput, now: Date, nonce: number, avoid: Set<string> = new Set()): PlanItem[] {
  const { festival } = occasionOf(input);
  const ranked = rank(candidatesFor(key, input, now, festival));
  const count = countFor(key, input);
  if (key === "context") return ranked.map((c) => toItem(key, c));
  if (key === "food" && ranked.length === 0) {
    return [
      {
        id: itemId(key, "no-match"),
        title: "No dish in FESTIVA's guide meets every requirement yet",
        detail:
          "FESTIVA's food guide is small and has nothing that fits this occasion and all of your dietary requirements. Ask your cook or caterer for dishes that do, or relax one filter and regenerate.",
        reason: `Filtered for: ${effectiveDietary(input).map((d) => LABELS.dietary[d].toLowerCase()).join(", ") || "no restrictions"}.`,
        kind: "suggestion",
        href: "/taste",
      },
    ];
  }
  if (nonce === 0) return ranked.slice(0, count).map((c) => toItem(key, c));
  // Regeneration: stay within the best-scoring pool but prefer items not currently shown.
  const pool = ranked.slice(0, count + 4);
  const fresh = pool.filter((c) => !avoid.has(itemId(key, c.title)));
  const rng = seeded(`${JSON.stringify(input)}|${key}|${nonce}`);
  const ordered = [...shuffle(fresh, rng), ...shuffle(pool.filter((c) => avoid.has(itemId(key, c.title))), rng)];
  const picked = ordered.slice(0, count);
  return rank(picked).map((c) => toItem(key, c));
}

const DAY_MINUTES: Record<MatchmakerInput["duration"], number[]> = {
  "two-hours": [120],
  "half-day": [240],
  "full-day": [480],
  weekend: [300, 240],
};

const hhmm = (minutes: number): string => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

interface Block {
  title: string;
  detail: string;
  reason: string;
  share: number;
}

/** Build a timed running order from the plan's current food and activity items. */
export function buildSchedule(input: MatchmakerInput, food: PlanItem[], activities: PlanItem[]): PlanItem[] {
  const { festival, label } = occasionOf(input);
  const firstHalf = activities.slice(0, Math.ceil(activities.length / 2));
  const secondHalf = activities.slice(firstHalf.length);
  const before: Block[] = [
    { title: "Welcome", detail: "Guests arrive. Lights or candles on, music low, something small to eat and drink.", reason: "A gentle start lets people arrive at their own pace.", share: 10 },
  ];
  if (festival) {
    before.push({ title: `The story of ${festival.name}`, detail: festival.summary, reason: "Opening with the meaning of the day gives everything after it a context.", share: 8 });
    if (input.observance === "religious") {
      before.push({
        title: "Prayer or rites",
        detail: `The rites your family or community keeps for ${festival.name}, led by whoever usually leads them.`,
        reason: "You chose to keep the religious rites; they come early, before the meal.",
        share: 10,
      });
    }
  }
  for (const a of firstHalf) before.push({ title: a.title, detail: a.detail, reason: "From your activities list.", share: 14 });
  const realDishes = food.filter((f) => f.href?.startsWith("/taste/"));
  before.push({
    title: "The meal",
    detail: realDishes.length > 0 ? `Serve ${realDishes.map((f) => f.title).join(", ")}.` : "Share the meal you have planned.",
    reason: "The meal sits in the middle so nobody is hungry during activities.",
    share: 26,
  });
  const after: Block[] = secondHalf.map((a) => ({ title: a.title, detail: a.detail, reason: "From your activities list.", share: 14 }));
  if (input.ageBands.includes("under-5") && input.duration !== "two-hours") {
    after.unshift({ title: "Quiet time", detail: "A calm break: a nap for the youngest, a story or a slow walk for everyone else.", reason: "Young children are coming, and a long gathering needs a rest.", share: 10 });
  }
  after.push({ title: "Greetings and gifts", detail: "Exchange greetings, cards and any gifts.", reason: "Kept for late in the gathering, when everyone has arrived.", share: 8 });
  after.push({ title: "Close", detail: `Thank everyone, take a photograph, and send guests home with something from the ${label} table.`, reason: "A clear ending is kinder than letting the gathering fade.", share: 6 });

  const days = DAY_MINUTES[input.duration];
  const [startH, startM] = input.startTime.split(":").map(Number);
  const dayBlocks: Block[][] =
    days.length === 1
      ? [[...before, ...after]]
      : [before, [{ title: "A slow morning together", detail: "Leftovers, tea or coffee, and no programme.", reason: "A weekend plan needs a rest in it.", share: 12 }, ...after]];

  const items: PlanItem[] = [];
  dayBlocks.forEach((blocks, dayIndex) => {
    const total = days[dayIndex];
    const shareSum = blocks.reduce((sum, b) => sum + b.share, 0);
    let clock = dayIndex === 0 ? startH * 60 + startM : 10 * 60;
    blocks.forEach((block, index) => {
      const minutes = Math.max(10, Math.round((total * block.share) / shareSum / 5) * 5);
      const time = days.length > 1 ? `Day ${dayIndex + 1}, ${hhmm(clock)}` : hhmm(clock);
      items.push({
        id: `schedule:${dayIndex}-${index}-${slugify(block.title).slice(0, 60)}`,
        title: block.title,
        detail: `${block.detail} About ${minutes} minutes.`,
        reason: block.reason,
        kind: "suggestion",
        time,
      });
      clock += minutes;
    });
  });
  return items;
}

const STYLE_OPENING: Record<MatchmakerInput["style"], string> = {
  traditional: "A traditional",
  modern: "A modern",
  intimate: "An intimate",
  grand: "A grand",
  eco: "A low-waste",
  playful: "A playful",
};

function audiencePhrase(input: MatchmakerInput): string {
  const n = input.attendees;
  switch (input.audience) {
    case "solo":
      return "one";
    case "partner":
      return n <= 2 ? "two" : `${n}, with your partner`;
    case "family":
      return `a family of ${n}`;
    case "friends":
      return `${n} friends`;
    case "colleagues":
      return `${n} colleagues`;
    case "children":
      return `${n}, with children at the centre`;
    case "community":
      return `a community of ${n}`;
  }
}

function buildConcept(input: MatchmakerInput, sections: PlanSection[], budgetReasons: string[], totalMinor: number): Plan["concept"] {
  const { festival, label } = occasionOf(input);
  const place = [input.city, countryName(input.countryCode)].filter(Boolean).join(", ");
  const headline = `${STYLE_OPENING[input.style]} ${label} for ${audiencePhrase(input)}`;
  const titles = (key: SectionKey) => sections.find((s) => s.key === key)?.items ?? [];
  const dishes = titles("food").filter((i) => i.href?.startsWith("/taste/")).map((i) => i.title);
  const listed = dishes.length > 1 ? `${dishes.slice(0, -1).join(", ")} and ${dishes[dishes.length - 1]}` : dishes[0];
  const activity = titles("activities")[0]?.title;
  const narrative =
    `${LABELS.duration[input.duration]} in ${place}` +
    (festival ? `, shaped around ${festival.name}: ${festival.tagline.toLowerCase()}.` : `, shaped around your ${label.toLowerCase()}.`) +
    (listed ? ` On the table: ${listed}.` : "") +
    (activity ? ` To do together: ${activity}.` : "") +
    " Every item below can be edited, replaced or removed.";
  const reasoning = [
    totalMinor > 0
      ? `Your budget of ${formatMoney(totalMinor, input.currency)} for ${input.attendees} ${input.attendees === 1 ? "person" : "people"} is about ${formatMoney(perHead(totalMinor, input.attendees), input.currency)} each. The split shown is a suggested allocation of your own budget, not a price quote.`
      : "You did not set a budget, so the budget table starts at zero. Add amounts whenever you like.",
    ...budgetReasons,
    effectiveDietary(input).length > 0
      ? `Food is filtered for ${effectiveDietary(input).map((d) => LABELS.dietary[d].toLowerCase()).join(", ")}${minorsPresent(input) && !input.dietary.includes("no-alcohol") ? " (no alcohol added because children or teenagers are coming)" : ""}. Flags describe typical recipes, so confirm ingredients with whoever cooks.`
      : "No dietary filters were applied to food.",
    `Kept ${LABELS.observance[input.observance].toLowerCase()}${input.observance === "secular" ? ", so religious rites are left out" : input.observance === "religious" ? ", so the rites come first in activities and the schedule" : ""}.`,
    input.ageBands.length > 0 ? `Ages coming: ${input.ageBands.map((b) => LABELS.ageBands[b]).join(", ")}. Activities and notes take them into account.` : "No ages were given, so the plan makes no age-specific changes.",
    `${LABELS.duration[input.duration]} gives room for ${COUNTS[input.duration].activities} activities and ${COUNTS[input.duration].food} dishes.`,
    `Gift ideas are limited to the ${LABELS.giftTier[input.giftTier].toLowerCase()} tier and to ideas that suit ${LABELS.audience[input.audience].toLowerCase()}.`,
  ];
  return { headline, narrative, reasoning, source: "rules" };
}

export interface GenerateOptions {
  id: string;
  now: Date;
}

const GENERATED: SectionKey[] = ["food", "gifts", "attire", "decor", "activities", "music", "greetings", "destinations", "context"];

export function generatePlan(input: MatchmakerInput, options: GenerateOptions): Plan {
  const { label } = occasionOf(input);
  const built: PlanSection[] = GENERATED.map((key) => ({ key, nonce: 0, items: select(key, input, options.now, 0) })).filter(
    (section) => section.items.length > 0,
  );
  const food = built.find((s) => s.key === "food")?.items ?? [];
  const activities = built.find((s) => s.key === "activities")?.items ?? [];
  const sections: PlanSection[] = [{ key: "schedule", nonce: 0, items: buildSchedule(input, food, activities) }, ...built];
  const totalMinor = toMinor(input.budget, input.currency);
  const { weights, reasons } = weightsFor(input);
  const stamp = options.now.toISOString();
  return {
    id: options.id,
    schemaVersion: 1,
    createdAt: stamp,
    updatedAt: stamp,
    input,
    title: `${label} in ${[input.city, countryName(input.countryCode)].filter(Boolean).join(", ")}`,
    concept: buildConcept(input, sections, reasons, totalMinor),
    sections,
    budget: { totalMinor, currency: input.currency, lines: allocate(totalMinor, weights) },
  };
}

const touch = (plan: Plan, now: Date, sections: PlanSection[]): Plan => ({ ...plan, sections, updatedAt: now.toISOString() });

export function regenerateSection(plan: Plan, key: SectionKey, now: Date): Plan {
  const sections = plan.sections.map((section) => {
    if (section.key !== key) return section;
    if (key === "schedule") {
      const food = plan.sections.find((s) => s.key === "food")?.items ?? [];
      const activities = plan.sections.find((s) => s.key === "activities")?.items ?? [];
      return { ...section, nonce: section.nonce + 1, items: buildSchedule(plan.input, food, activities) };
    }
    const nonce = section.nonce + 1;
    const avoid = new Set(section.items.map((i) => i.id));
    return { ...section, nonce, items: select(key, plan.input, now, nonce, avoid) };
  });
  return touch(plan, now, sections);
}

/** Swap one item for the best-scoring candidate not already in the section. Returns null when there is no alternative. */
export function replaceItem(plan: Plan, key: SectionKey, itemId_: string, now: Date): Plan | null {
  if (!SECTION_META[key].replaceable) return null;
  const section = plan.sections.find((s) => s.key === key);
  if (!section) return null;
  const { festival } = occasionOf(plan.input);
  const present = new Set(section.items.map((i) => i.id));
  const replacement = rank(candidatesFor(key, plan.input, now, festival))
    .map((c) => toItem(key, c))
    .find((item) => !present.has(item.id));
  if (!replacement) return null;
  const sections = plan.sections.map((s) =>
    s.key === key ? { ...s, items: s.items.map((item) => (item.id === itemId_ ? replacement : item)) } : s,
  );
  return touch(plan, now, sections);
}

export function editItem(plan: Plan, key: SectionKey, itemId_: string, patch: { title: string; detail: string }, now: Date): Plan {
  const sections = plan.sections.map((s) =>
    s.key === key
      ? { ...s, items: s.items.map((item) => (item.id === itemId_ ? { ...item, title: patch.title.slice(0, 300), detail: patch.detail.slice(0, 1200), edited: true } : item)) }
      : s,
  );
  return touch(plan, now, sections);
}

export function removeItem(plan: Plan, key: SectionKey, itemId_: string, now: Date): Plan {
  const sections = plan.sections.map((s) => (s.key === key ? { ...s, items: s.items.filter((item) => item.id !== itemId_) } : s));
  return touch(plan, now, sections);
}

/** Plain-text export used for copy, share sheets and downloads. */
export function planToText(plan: Plan): string {
  const lines: string[] = [plan.title, plan.concept.headline, "", plan.concept.narrative, ""];
  for (const section of plan.sections) {
    if (section.items.length === 0) continue;
    lines.push(SECTION_META[section.key].title.toUpperCase());
    for (const item of section.items) {
      lines.push(`- ${item.time ? `${item.time}  ` : ""}${item.title}`);
      if (item.detail) lines.push(`  ${item.detail}`);
    }
    lines.push("");
  }
  lines.push("BUDGET (suggested split of your own budget; estimates, not prices)");
  for (const line of plan.budget.lines) {
    lines.push(`- ${line.category}: ${formatMoney(line.amountMinor, plan.budget.currency)}`);
  }
  lines.push(`Total budget: ${formatMoney(plan.budget.totalMinor, plan.budget.currency)}`);
  lines.push("", "Made with FESTIVA. Discover the world. Celebrate every culture.");
  return lines.join("\n");
}
