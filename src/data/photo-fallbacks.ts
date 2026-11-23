import { PLACE_PHOTOS, photoFor, type Photo } from "./photos";

/**
 * Festivals with no free photograph of the event itself show a photograph of the place in the guide
 * where they are held (the destination already linked to the festival), and the credit says which place.
 * Never a photograph of a different place or a different event.
 */
export const FESTIVAL_PLACE: Record<string, { place: string; name: string }> = {
  garma: { place: "gulkula", name: "north-east Arnhem Land" },
  "hibiscus-festival": { place: "suva", name: "Suva" },
  "mimosa-festival": { place: "herceg-novi", name: "Herceg Novi" },
  "nyege-nyege": { place: "jinja", name: "Jinja" },
  "crop-over": { place: "bridgetown", name: "Bridgetown" },
  "antigua-carnival": { place: "st-johns-antigua", name: "St John's" },
  "kuru-dance-festival": { place: "ghanzi", name: "Ghanzi" },
  "world-creole-music-festival": { place: "roseau", name: "Roseau" },
  spicemas: { place: "st-georges-grenada", name: "St George's" },
  "sugar-mas": { place: "basseterre", name: "Basseterre" },
  "jounen-kweyol": { place: "castries", name: "Castries" },
  "feast-of-saint-marinus": { place: "city-of-san-marino", name: "the City of San Marino" },
  "festival-kreol": { place: "victoria-seychelles", name: "Victoria" },
  "solomon-islands-independence-day": { place: "honiara", name: "Honiara" },
};

export interface ShownPhoto extends Photo {
  /** Set when this is a photograph of the host place rather than of the festival itself. */
  placeName?: string;
}

/** The photograph to show for a piece of content: its own, or for a festival without one, its host place's. */
export function imageFor(kind: string, slug: string): ShownPhoto | undefined {
  const own = photoFor(kind, slug);
  if (own) return own;
  const fallback = kind === "rosette" ? FESTIVAL_PLACE[slug] : undefined;
  const place = fallback ? PLACE_PHOTOS[fallback.place] : undefined;
  return place ? { ...place, placeName: fallback!.name } : undefined;
}
