import { countries } from "@/data/countries";
import { CATEGORY_LABELS, festivalBySlug, festivals, REGION_LABELS } from "@/data/festivals";
import { indiaDivisions, linksForDivision } from "@/data/geo-india";
import type { MapCountry, MapFestival, MapRegion } from "@/components/WorldMap";
import { toMap } from "@/lib/geo";

/** Everything the world map needs, computed on the server from FESTIVA's data. */
export function mapFestivals(): MapFestival[] {
  return festivals.map((f) => {
    const p = toMap(f.lat, f.lon);
    return { slug: f.slug, name: f.name, category: CATEGORY_LABELS[f.category], countries: f.countries, x: p?.[0] ?? null, y: p?.[1] ?? null };
  });
}

export function mapCountries(): MapCountry[] {
  return countries.map((c) => ({ code: c.code, name: c.name, region: REGION_LABELS[c.region], blurb: c.blurb }));
}

/** India's states and UTs with their festival links; variation links carry the guide's own text. */
export function mapIndia(): MapRegion[] {
  return indiaDivisions.map((d) => ({
    id: d.id,
    name: d.name,
    kind: d.kind,
    links: linksForDivision(d.id).flatMap((l) => {
      const f = festivalBySlug.get(l.festival);
      if (!f) return [];
      const text = l.basis === "variation" ? f.regionalVariations.find((v) => v.place === l.place)?.text : undefined;
      return [{ slug: f.slug, name: f.name, basis: l.basis, place: l.place, text }];
    }),
  }));
}
