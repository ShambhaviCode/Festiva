import { festivalBySlug, festivals } from "@/data/festivals";
import { hashString } from "@/domain/random";
import { countryName } from "@/data/countries";
import type { Festival } from "@/domain/types";
import type { DatedFestival } from "@/components/Upcoming";

/** Short place line for a festival, e.g. "India, Nepal and beyond". */
export function placeLine(festival: Festival): string {
  const names = festival.countries.slice(0, 2).map(countryName);
  return festival.countries.length > 2 ? `${names.join(", ")} and beyond` : names.join(" and ");
}

export const datedFestivals: DatedFestival[] = festivals.map((f) => ({ slug: f.slug, name: f.name, place: placeLine(f), date: f.date }));

/** Fixed reference date for server-rendered samples, so prerendered pages never depend on the build clock. */
export const SAMPLE_NOW = new Date("2026-11-16T00:00:00Z");

const HOUSE_PALETTES: [string, string, string][] = [
  ["#33143a", "#f0a030", "#dcc898"],
  ["#0e5a48", "#dcc898", "#fbf6ea"],
  ["#f2e7cf", "#b93626", "#0e5a48"],
  ["#1e0a23", "#dcc898", "#b93626"],
  ["#fbf6ea", "#33143a", "#f0a030"],
  ["#b93626", "#fbf6ea", "#dca92b"],
];

/** Artwork palette for a non-festival entry: borrowed from its first related festival, else a stable house palette. */
export function paletteFor(seed: string, festivalSlugs: string[] = []): [string, string, string] {
  const related = festivalSlugs.map((slug) => festivalBySlug.get(slug)).find(Boolean);
  return related ? related.palette : HOUSE_PALETTES[hashString(seed) % HOUSE_PALETTES.length];
}

export type SlugProps = { params: Promise<{ slug: string }> };
