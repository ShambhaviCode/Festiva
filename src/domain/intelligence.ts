import { festivalBySlug, festivals } from "@/data/festivals";
import { foods } from "@/data/foods";
import { attire } from "@/data/attire";
import { destinations } from "@/data/destinations";
import { giftIdeas } from "@/data/shop";
import { artists, genreBySlug } from "@/data/music";
import { countryName } from "@/data/countries";
import type { Festival, SourceRef } from "./types";
import { CERTAINTY_LABEL, formatRange, nextOccurrence } from "./dates";
import { buildIndex, normalise, scoreDoc, search, type SearchDoc } from "./search";

/**
 * FESTIVA Intelligence: grounded retrieval over the curated dataset.
 *
 * `groundedAnswer` works with no AI provider at all. When a provider is
 * configured, the server passes `retrieveContext` output to the model as
 * reference data and still returns only sources from this dataset, so the
 * assistant can never cite something FESTIVA does not hold.
 */

export interface AnswerFact {
  text: string;
  href?: string;
}

export interface GroundedAnswer {
  answer: string;
  facts: AnswerFact[];
  suggestions: { label: string; href: string }[];
  sources: SourceRef[];
  matched: string[];
}

type Topic = "date" | "food" | "attire" | "gift" | "music" | "travel" | "plan" | "tradition" | "general";

const TOPIC_WORDS: Record<Exclude<Topic, "general">, string[]> = {
  date: ["when", "date", "dates", "day", "month", "calendar", "next"],
  food: ["eat", "food", "dish", "dishes", "sweet", "sweets", "cook", "recipe", "cuisine", "menu", "vegetarian", "vegan"],
  attire: ["wear", "dress", "attire", "clothes", "clothing", "outfit", "fashion"],
  gift: ["gift", "gifts", "present", "presents", "buy", "give"],
  music: ["music", "song", "songs", "playlist", "artist", "listen", "dance"],
  travel: ["where", "visit", "travel", "trip", "destination", "city", "go"],
  plan: ["plan", "organise", "organize", "host", "party", "celebrate", "celebration", "budget"],
  tradition: ["tradition", "traditions", "custom", "customs", "ritual", "history", "origin", "why", "meaning", "significance", "story"],
};

export function detectTopic(query: string): Topic {
  const words = new Set(normalise(query).split(" "));
  let best: Topic = "general";
  let bestHits = 0;
  for (const [topic, list] of Object.entries(TOPIC_WORDS) as [Exclude<Topic, "general">, string[]][]) {
    const hits = list.filter((w) => words.has(w)).length;
    if (hits > bestHits) {
      best = topic;
      bestHits = hits;
    }
  }
  return best;
}

const STOP = new Set(
  "the a an is are was were be of for in on at to do does did what which how who whom why when where there here this that these those it its they them their our your my me i you we he she and or but if so not no yes can could should would will shall may might must have has had get give need want like about tell show some any all more most much many also just than then too very with from into during over under by as up out people please thing things".split(" "),
);

/**
 * Words that appear in many festival titles ("Kupala Night", "King's Day",
 * "Goroka Show") but say nothing about which one is meant. On their own they
 * must not pull in an entry; full names still match through `search`.
 */
const GENERIC_TITLE_WORDS = new Set("night nights day days eve week festival festivals fest show last first great".split(" "));

/** Find the festival the question is about, tolerating extra words. */
export function findFestival(query: string): Festival | undefined {
  const q = ` ${normalise(query)} `;
  let best: Festival | undefined;
  let bestLength = 0;
  for (const festival of festivals) {
    const names = [festival.name, ...(festival.localName ? festival.localName.split(",") : []), festival.slug.replace(/-/g, " ")];
    for (const name of names) {
      const n = normalise(name);
      if (n.length > 2 && q.includes(` ${n} `) && n.length > bestLength) {
        best = festival;
        bestLength = n.length;
      }
    }
  }
  return best;
}

export function retrieveDocs(query: string, limit = 5): SearchDoc[] {
  const tokens = normalise(query)
    .split(" ")
    .filter((t) => t.length > 2 && !STOP.has(t));
  if (tokens.length === 0) return [];
  const seen = new Map<string, SearchDoc>();
  for (const hit of search(tokens.join(" "), { limit })) seen.set(hit.id, hit);
  // Fall back to single words only when they name an entry (a title or alias match),
  // so unrelated questions are not answered with loosely related text.
  const index = buildIndex();
  for (const token of tokens.filter((t) => t.length >= 4 && !GENERIC_TITLE_WORDS.has(t))) {
    for (const d of index) {
      if (!seen.has(d.id) && scoreDoc(d, [token]) >= 4) seen.set(d.id, d);
    }
  }
  return [...seen.values()].slice(0, limit);
}

function festivalFacts(festival: Festival, topic: Topic, today: Date): { facts: AnswerFact[]; suggestions: GroundedAnswer["suggestions"] } {
  const href = `/discover/${festival.slug}`;
  const facts: AnswerFact[] = [];
  const suggestions: GroundedAnswer["suggestions"] = [];
  const add = (text: string, link: string = href) => facts.push({ text, href: link });

  if (topic === "date") {
    const next = nextOccurrence(festival.date, today);
    add(
      next
        ? `Next ${festival.name}: ${formatRange(next.start, next.end)}. ${CERTAINTY_LABEL[next.certainty]}.${next.note ? ` ${next.note}` : ""}`
        : `FESTIVA has no checked date for the next ${festival.name} yet.`,
    );
    add(festival.dateNote);
  } else if (topic === "food") {
    const dishes = foods.filter((f) => f.festivals.includes(festival.slug));
    if (dishes.length === 0) add(`FESTIVA's food guide has no dishes listed for ${festival.name} yet.`, "/taste");
    for (const dish of dishes.slice(0, 4)) add(`${dish.name}: ${dish.background}`, `/taste/${dish.slug}`);
    suggestions.push({ label: "Browse Taste", href: "/taste" });
  } else if (topic === "attire") {
    const items = attire.filter((a) => a.festivals.includes(festival.slug));
    if (items.length === 0) add(`FESTIVA's attire guide has nothing specific to ${festival.name} yet.`, "/wear");
    for (const item of items.slice(0, 3)) add(`${item.name}: ${item.summary} ${item.wearing}`, `/wear/${item.slug}`);
  } else if (topic === "gift") {
    const ideas = giftIdeas.filter((g) => g.festivals.includes(festival.slug));
    for (const idea of ideas.slice(0, 4)) add(`${idea.title}. ${idea.note}`, "/shop");
    if (ideas.length === 0) add(`FESTIVA has no gift ideas tagged for ${festival.name} yet.`, "/shop");
    suggestions.push({ label: "Get gift ideas for your budget in the Matchmaker", href: `/matchmaker?occasion=${festival.slug}` });
  } else if (topic === "music") {
    const names = festival.genres.map((g) => genreBySlug.get(g)?.name).filter(Boolean);
    add(`FESTIVA's guide pairs ${festival.name} with ${names.join(", ")}.`, "/sound");
    for (const artist of artists.filter((a) => festival.genres.includes(a.genre)).slice(0, 3)) {
      add(`${artist.name} (${artist.country})${artist.songs[0] ? `, for example “${artist.songs[0]}”` : ""}.`, `/sound?q=${encodeURIComponent(artist.name)}`);
    }
  } else if (topic === "travel") {
    const places = destinations.filter((d) => d.festivals.includes(festival.slug));
    for (const place of places.slice(0, 3)) add(`${place.name}, ${countryName(place.country)}: ${place.summary}`, `/journeys/${place.slug}`);
    if (places.length === 0) add(`${festival.name} is most closely associated with ${festival.countries.map(countryName).join(", ")}.`);
  } else if (topic === "plan") {
    add(festival.summary);
    for (const [, title] of festival.activities.slice(0, 3)) add(`Activity: ${title}.`);
    suggestions.push({ label: `Plan ${festival.name} in the Matchmaker`, href: `/matchmaker?occasion=${festival.slug}` });
  } else {
    add(festival.summary);
    add(festival.significance);
    if (topic === "tradition") {
      add(festival.history);
      for (const t of festival.traditions.slice(0, 4)) add(`Tradition: ${t}.`);
    }
  }
  suggestions.push({ label: `Read the ${festival.name} guide`, href });
  return { facts, suggestions };
}

export function groundedAnswer(query: string, now: Date = new Date()): GroundedAnswer {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const topic = detectTopic(query);
  const festival = findFestival(query);
  if (festival) {
    const { facts, suggestions } = festivalFacts(festival, topic, today);
    return {
      answer: `Here is what FESTIVA's guide holds on ${festival.name}.`,
      facts,
      suggestions,
      sources: festival.provenance.sources,
      matched: [festival.name],
    };
  }
  const docs = retrieveDocs(query);
  if (docs.length === 0) {
    return {
      answer:
        "I could not find that in FESTIVA's guide. I can answer from the festivals, food, attire, destinations, gifts and music that FESTIVA has curated, and I would rather say so than guess.",
      facts: [],
      suggestions: [
        { label: "Browse all festivals", href: "/discover" },
        { label: "Plan a celebration", href: "/matchmaker" },
      ],
      sources: [],
      matched: [],
    };
  }
  const sources: SourceRef[] = [];
  for (const d of docs) {
    const slug = d.id.split(":")[1];
    if (d.type === "festival") sources.push(...(festivalBySlug.get(slug)?.provenance.sources ?? []));
  }
  return {
    answer: "These entries in FESTIVA's guide match your question.",
    facts: docs.map((d) => ({ text: `${d.title}: ${d.summary}`, href: d.href })),
    suggestions: topic === "plan" ? [{ label: "Plan a celebration in the Matchmaker", href: "/matchmaker" }] : [],
    sources,
    matched: docs.map((d) => d.title),
  };
}

/** Compact reference block handed to an AI provider as data (never as instructions). */
export function retrieveContext(query: string, now: Date = new Date()): string {
  const grounded = groundedAnswer(query, now);
  return grounded.facts.map((f, i) => `[${i + 1}] ${f.text}`).join("\n");
}
