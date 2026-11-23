import { festivals, REGION_LABELS } from "@/data/festivals";
import { foods } from "@/data/foods";
import { attire } from "@/data/attire";
import { destinations } from "@/data/destinations";
import { countries, countryName } from "@/data/countries";
import { brands } from "@/data/shop";
import { artists, genres } from "@/data/music";
import { normalise } from "./text";
import { scoreDoc } from "./search-score";

export { normalise };

export type SearchType = "festival" | "food" | "attire" | "destination" | "country" | "brand" | "artist" | "genre";

export interface SearchDoc {
  id: string;
  type: SearchType;
  title: string;
  href: string;
  summary: string;
  /** Normalised alternative names (local names, aliases); matched like the title. */
  alt: string;
  /** Normalised text used for matching. */
  haystack: string;
}

export const TYPE_LABELS: Record<SearchType, string> = {
  festival: "Festival",
  food: "Food",
  attire: "Attire",
  destination: "Destination",
  country: "Country",
  brand: "Brand",
  artist: "Artist",
  genre: "Genre",
};

const doc = (type: SearchType, id: string, title: string, href: string, summary: string, extra: string[], alt = ""): SearchDoc => ({
  id: `${type}:${id}`,
  type,
  title,
  href,
  summary,
  alt: normalise(alt),
  haystack: ` ${normalise([title, alt, summary, ...extra].join(" "))} `,
});

let cached: SearchDoc[] | null = null;

export function buildIndex(): SearchDoc[] {
  if (cached) return cached;
  cached = [
    ...festivals.map((f) =>
      doc("festival", f.slug, f.name, `/discover/${f.slug}`, f.summary, [f.tagline, f.observedBy, REGION_LABELS[f.region], ...f.countries.map(countryName), ...f.traditions], f.localName ?? ""),
    ),
    ...foods.map((f) => doc("food", f.slug, f.name, `/taste/${f.slug}`, f.background, [countryName(f.country), ...f.ingredients, ...f.festivals])),
    ...attire.map((a) => doc("attire", a.slug, a.name, `/wear/${a.slug}`, a.summary, [countryName(a.country), ...a.textiles, ...a.festivals])),
    ...destinations.map((d) => doc("destination", d.slug, d.name, `/journeys/${d.slug}`, d.summary, [countryName(d.country), ...d.landmarks, ...d.festivals])),
    ...countries.map((c) => doc("country", c.code, c.name, `/journeys/country/${c.code.toLowerCase()}`, c.blurb, [REGION_LABELS[c.region], ...c.languages])),
    ...brands.map((b) => doc("brand", b.slug, b.name, `/shop/${b.slug}`, b.about, [b.origin, ...b.knownFor])),
    ...artists.map((a) => doc("artist", a.name, a.name, `/sound?q=${encodeURIComponent(a.name)}`, `${a.genre} from ${a.country}`, [...a.languages, ...a.songs])),
    ...genres.map((g) => doc("genre", g.slug, g.name, `/sound?genre=${g.slug}`, g.about, [g.origin])),
  ];
  return cached;
}

export { scoreDoc };

export function search(query: string, options: { types?: SearchType[]; limit?: number } = {}): SearchDoc[] {
  const tokens = normalise(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  return buildIndex()
    .filter((d) => !options.types || options.types.includes(d.type))
    .map((d) => ({ d, score: scoreDoc(d, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title))
    .slice(0, options.limit ?? 20)
    .map((entry) => entry.d);
}
