import { z } from "zod";
import { CURRENCY_CODES } from "../currency";
import { BUDGET_CATEGORIES } from "../budget";

export const AUDIENCES = ["family", "friends", "partner", "colleagues", "children", "community", "solo"] as const;
export const INTERESTS = ["food", "music", "crafts", "games", "storytelling", "fashion", "gifting", "reflection", "outdoors", "travel"] as const;
export const DIETARY = ["vegetarian", "vegan", "gluten-free", "nut-free", "dairy-free", "egg-free", "no-pork", "no-alcohol"] as const;
export const FOOD_STYLES = ["traditional", "sweets", "light", "feast"] as const;
export const STYLES = ["traditional", "modern", "intimate", "grand", "eco", "playful"] as const;
export const DURATIONS = ["two-hours", "half-day", "full-day", "weekend"] as const;
export const ACTIVITY_TYPES = ["cooking", "music-dance", "games", "crafts", "storytelling", "gift-exchange", "ritual", "outdoors", "giving-back"] as const;
export const GIFT_TIERS = ["everyday", "premium", "elite"] as const;
/** How the festival is being kept: with its religious rites, as a cultural occasion, or as a secular gathering. */
export const OBSERVANCES = ["religious", "cultural", "secular"] as const;
/** Ages of the people coming. Empty means "not specified" and changes nothing. */
export const AGE_BANDS = ["under-5", "5-12", "13-17", "adults", "over-65"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];
export const MINOR_BANDS: readonly AgeBand[] = ["under-5", "5-12", "13-17"];

export const LABELS = {
  audience: {
    family: "Family",
    friends: "Friends",
    partner: "My partner",
    colleagues: "Colleagues",
    children: "Children",
    community: "A community group",
    solo: "Just me",
  },
  interests: {
    food: "Food",
    music: "Music",
    crafts: "Crafts",
    games: "Games",
    storytelling: "Stories",
    fashion: "Fashion",
    gifting: "Gifting",
    reflection: "Reflection",
    outdoors: "Outdoors",
    travel: "Travel",
  },
  dietary: {
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    "gluten-free": "Gluten-free",
    "nut-free": "Nut-free",
    "dairy-free": "Dairy-free",
    "egg-free": "Egg-free",
    "no-pork": "No pork",
    "no-alcohol": "No alcohol",
  },
  foodStyle: {
    traditional: "Traditional dishes",
    sweets: "Sweets first",
    light: "Light bites",
    feast: "A full feast",
  },
  style: {
    traditional: "Traditional",
    modern: "Modern",
    intimate: "Intimate",
    grand: "Grand",
    eco: "Eco-conscious",
    playful: "Playful",
  },
  duration: {
    "two-hours": "About two hours",
    "half-day": "Half a day",
    "full-day": "A full day",
    weekend: "A weekend",
  },
  activities: {
    cooking: "Cooking together",
    "music-dance": "Music and dance",
    games: "Games",
    crafts: "Crafts",
    storytelling: "Storytelling",
    "gift-exchange": "Gift exchange",
    ritual: "Ritual or quiet moment",
    outdoors: "Outdoors",
    "giving-back": "Giving back",
  },
  observance: {
    religious: "With its religious rites",
    cultural: "As a cultural occasion",
    secular: "As a secular gathering",
  },
  ageBands: {
    "under-5": "Under 5",
    "5-12": "5 to 12",
    "13-17": "13 to 17",
    adults: "Adults",
    "over-65": "Over 65",
  },
  giftTier: {
    everyday: "Everyday",
    premium: "Premium",
    elite: "Elite luxury",
  },
} as const;

export const matchmakerInputSchema = z.object({
  occasion: z.string().trim().min(1).max(60),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().max(80).default(""),
  budget: z.number().finite().min(0).max(1_000_000_000),
  currency: z.enum(CURRENCY_CODES),
  attendees: z.number().int().min(1).max(5000),
  audience: z.enum(AUDIENCES),
  interests: z.array(z.enum(INTERESTS)).max(INTERESTS.length),
  foodStyle: z.enum(FOOD_STYLES),
  dietary: z.array(z.enum(DIETARY)).max(DIETARY.length),
  style: z.enum(STYLES),
  duration: z.enum(DURATIONS),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  activities: z.array(z.enum(ACTIVITY_TYPES)).max(ACTIVITY_TYPES.length),
  giftTier: z.enum(GIFT_TIERS),
  // Added in 1.2. Defaults keep plans saved or shared by earlier versions valid.
  observance: z.enum(OBSERVANCES).default("cultural"),
  ageBands: z.array(z.enum(AGE_BANDS)).max(AGE_BANDS.length).default([]),
});

export type MatchmakerInput = z.infer<typeof matchmakerInputSchema>;

export const DEFAULT_INPUT: MatchmakerInput = {
  occasion: "diwali",
  countryCode: "IN",
  city: "",
  budget: 15000,
  currency: "INR",
  attendees: 8,
  audience: "family",
  interests: ["food", "crafts"],
  foodStyle: "traditional",
  dietary: [],
  style: "traditional",
  duration: "half-day",
  startTime: "17:00",
  activities: ["cooking", "crafts"],
  giftTier: "everyday",
  observance: "cultural",
  ageBands: [],
};

export const SECTION_KEYS = ["schedule", "food", "gifts", "attire", "decor", "activities", "music", "greetings", "destinations", "context"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

const text = (max: number) => z.string().max(max);

export const planItemSchema = z.object({
  id: text(160),
  title: text(300),
  detail: text(1200),
  reason: text(600),
  kind: z.enum(["fact", "suggestion"]),
  href: text(200).optional(),
  time: text(40).optional(),
  edited: z.boolean().optional(),
});

export const planSchema = z.object({
  id: text(80),
  schemaVersion: z.literal(1),
  createdAt: text(40),
  updatedAt: text(40),
  input: matchmakerInputSchema,
  title: text(200),
  concept: z.object({
    headline: text(300),
    narrative: text(1500),
    reasoning: z.array(text(500)).max(20),
    source: z.enum(["rules", "ai"]),
  }),
  sections: z
    .array(
      z.object({
        key: z.enum(SECTION_KEYS),
        nonce: z.number().int().min(0).max(100000),
        items: z.array(planItemSchema).max(40),
      }),
    )
    .max(SECTION_KEYS.length),
  budget: z.object({
    totalMinor: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
    currency: z.enum(CURRENCY_CODES),
    lines: z.array(z.object({ category: z.enum(BUDGET_CATEGORIES), amountMinor: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER) })).length(BUDGET_CATEGORIES.length),
  }),
});

export type PlanItem = z.infer<typeof planItemSchema>;
export type Plan = z.infer<typeof planSchema>;
export type PlanSection = Plan["sections"][number];
