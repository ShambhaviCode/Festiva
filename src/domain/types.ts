/**
 * FESTIVA domain types.
 * This folder is framework-free TypeScript (no React, Next.js or DOM imports)
 * so the same logic can be reused by a future Expo / React Native client.
 */

export interface SourceRef {
  title: string;
  url: string;
}

/**
 * verified  – checked against the cited source on `lastChecked`.
 * projected – an official or astronomical projection that can still move
 *             (for example moon-sighting dependent dates).
 * reference – written from general reference knowledge with a source linked
 *             for readers; not individually audited during the build.
 */
export type Verification = "verified" | "projected" | "reference";

export interface Provenance {
  sources: SourceRef[];
  verification: Verification;
  lastChecked: string | null;
  note?: string;
}

export type RegionId =
  | "south-asia"
  | "east-asia"
  | "southeast-asia"
  | "central-asia"
  | "middle-east"
  | "africa"
  | "europe"
  | "north-america"
  | "latin-america"
  | "oceania";

export type FestivalCategory =
  | "light"
  | "harvest"
  | "new-year"
  | "faith"
  | "spring"
  | "remembrance"
  | "arts"
  | "community";

export interface TableOccurrence {
  /** ISO dates (YYYY-MM-DD), inclusive. */
  start: string;
  end: string;
  status: "verified" | "projected" | "unchecked";
  note?: string;
  sources: SourceRef[];
  lastChecked: string | null;
}

export type DateRule =
  | { kind: "fixed"; month: number; day: number; durationDays: number }
  | { kind: "nth-weekday"; month: number; weekday: number; nth: number; durationDays: number }
  | { kind: "easter-offset"; offsetDays: number; durationDays: number }
  | { kind: "custom"; id: "oktoberfest" | "midsummer-sweden" }
  | { kind: "table"; calendar: string; typicalMonths: number[]; occurrences: TableOccurrence[] }
  | { kind: "seasonal"; months: number[] };

export type Certainty = "fixed" | "rule" | "verified" | "projected" | "unchecked" | "seasonal";

export interface Occurrence {
  start: Date;
  end: Date;
  certainty: Certainty;
  note?: string;
  sources?: SourceRef[];
  lastChecked?: string | null;
}

export type ActivityType =
  | "cooking"
  | "music-dance"
  | "games"
  | "crafts"
  | "storytelling"
  | "gift-exchange"
  | "ritual"
  | "outdoors"
  | "giving-back";

export interface Greeting {
  text: string;
  language: string;
  meaning?: string;
}

export interface Festival {
  slug: string;
  name: string;
  localName?: string;
  tagline: string;
  summary: string;
  /** ISO 3166-1 alpha-2 codes of the places most closely associated. */
  countries: string[];
  region: RegionId;
  observedBy: string;
  category: FestivalCategory;
  date: DateRule;
  dateNote: string;
  history: string;
  significance: string;
  traditions: string[];
  regionalVariations: { place: string; text: string }[];
  etiquette: string[];
  decor: string[];
  activities: [ActivityType, string][];
  greetings: Greeting[];
  genres: string[];
  palette: [string, string, string];
  lat: number;
  lon: number;
  provenance: Provenance;
}

export type Allergen = "dairy" | "nuts" | "gluten" | "egg" | "pork" | "alcohol" | "meat" | "fish";

export interface Food {
  slug: string;
  name: string;
  country: string;
  festivals: string[];
  type: "sweet" | "main" | "snack" | "drink";
  /** No meat or fish in the typical preparation. */
  vegetarian: boolean;
  /** No animal products in the typical preparation. */
  vegan: boolean;
  contains: Allergen[];
  ingredients: string[];
  background: string;
  source: SourceRef;
}

export interface Attire {
  slug: string;
  name: string;
  country: string;
  festivals: string[];
  summary: string;
  textiles: string[];
  craftsmanship: string;
  wearing: string;
  contemporary: string;
  brands: string[];
  source: SourceRef;
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  kind: "city" | "heritage" | "region";
  summary: string;
  landmarks: string[];
  experiences: string[];
  itinerary: string[];
  festivals: string[];
  lat: number;
  lon: number;
  source: SourceRef;
}

export interface Country {
  code: string;
  name: string;
  region: RegionId;
  blurb: string;
  languages: string[];
  currency: string;
}

export type GiftTier = "everyday" | "premium" | "elite";
export type GiftCategory = "fashion" | "jewellery" | "sweets-gourmet" | "home-lifestyle" | "personalised" | "cultural";

export interface Brand {
  slug: string;
  name: string;
  origin: string;
  tier: GiftTier;
  categories: GiftCategory[];
  about: string;
  knownFor: string[];
  officialUrl: string;
  source: SourceRef;
}

export interface GiftIdea {
  slug: string;
  title: string;
  category: GiftCategory;
  tiers: GiftTier[];
  recipients: string[];
  festivals: string[];
  interests: string[];
  note: string;
  brands: string[];
}

export interface Genre {
  slug: string;
  name: string;
  origin: string;
  about: string;
}

export interface Artist {
  name: string;
  genre: string;
  country: string;
  languages: string[];
  songs: string[];
}

export interface Playlist {
  slug: string;
  title: string;
  mood: string;
  tracks: { artist: string; song: string }[];
}
