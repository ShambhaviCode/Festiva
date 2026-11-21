import { z } from "zod";
import { CURRENCY_CODES } from "../currency";
import { LANGUAGE_TAGS } from "../languages";

/**
 * FESTIVA Gift Circle: the data model.
 *
 * A circle is one group gift exchange for one occasion. Everything a person
 * types is kept exactly as typed: a translation is stored *next to* the
 * original, never in its place.
 *
 * Money is held in integer minor units of one currency, as elsewhere in
 * FESTIVA. Contributions are commitments people record themselves; FESTIVA
 * does not process, hold or verify payments.
 */

export const GIFT_CATEGORIES = ["fashion", "jewellery", "sweets-gourmet", "home-lifestyle", "personalised", "cultural"] as const;
export const GIFT_TIERS = ["everyday", "premium", "elite"] as const;
export const ONBOARDING_VARIANTS = ["guided", "single_page"] as const;
export type OnboardingVariant = (typeof ONBOARDING_VARIANTS)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");
const isoTime = z.string().datetime({ offset: true });
const id = z.string().uuid();
const language = z.enum(LANGUAGE_TAGS);
const shortText = (max: number) => z.string().trim().min(1).max(max);
const minor = z.number().int().min(0).max(1_000_000_000_00);

export const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .url()
  .refine((value) => value.startsWith("https://"), "Links must start with https://");

export const structuredPreferenceSchema = z.object({
  categories: z.array(z.enum(GIFT_CATEGORIES)).max(6),
  likes: z.array(shortText(60)).max(8),
  avoid: z.array(shortText(60)).max(8),
  dietary: z.array(shortText(40)).max(6),
  materials: z.array(shortText(40)).max(6),
  notes: z.string().trim().max(280),
});
export type StructuredPreference = z.infer<typeof structuredPreferenceSchema>;

export const EMPTY_STRUCTURE: StructuredPreference = { categories: [], likes: [], avoid: [], dietary: [], materials: [], notes: "" };

export const participantSchema = z.object({
  id,
  name: shortText(60),
  language,
  role: z.enum(["organiser", "participant"]),
  joinedAt: isoTime,
});
export type Participant = z.infer<typeof participantSchema>;

export const preferenceSchema = z.object({
  id,
  participantId: id,
  source: z.enum(["text", "voice"]),
  /** Exactly what the person approved, in their language. */
  original: z.object({ text: shortText(1200), language }),
  /** Optional translation, stored separately. Never replaces `original`. */
  translation: z
    .object({ text: shortText(2400), language, provider: z.literal("sarvam"), model: z.string().max(60), edited: z.boolean() })
    .nullable(),
  /** Speech-recognition metadata for voice preferences. The audio itself is never stored. */
  transcript: z
    .object({
      provider: z.literal("sarvam"),
      model: z.string().max(60),
      requestId: z.string().max(120).nullable(),
      detectedLanguage: language.nullable(),
      languageProbability: z.number().min(0).max(1).nullable(),
      edited: z.boolean(),
    })
    .nullable(),
  structured: structuredPreferenceSchema,
  structuredBy: z.enum(["rules", "sarvam", "person"]),
  createdAt: isoTime,
});
export type Preference = z.infer<typeof preferenceSchema>;

export const wishlistItemSchema = z.object({
  id,
  participantId: id,
  title: shortText(100),
  category: z.enum(GIFT_CATEGORIES).nullable(),
  note: z.string().trim().max(280),
  link: httpsUrl.nullable(),
  /** A figure the person entered themselves. FESTIVA never supplies prices. */
  estimateMinor: minor.nullable(),
  origin: z.enum(["manual", "suggestion", "preference"]),
  createdAt: isoTime,
});
export type WishlistItem = z.infer<typeof wishlistItemSchema>;

export const contributionSchema = z.object({
  participantId: id,
  amountMinor: minor,
  status: z.enum(["pledged", "paid-offline"]),
  updatedAt: isoTime,
});
export type Contribution = z.infer<typeof contributionSchema>;

export const assignmentSchema = z.object({ giverId: id, receiverId: id });
export type Assignment = z.infer<typeof assignmentSchema>;

export const circleSchema = z.object({
  id,
  name: shortText(80),
  occasion: z.object({ festivalSlug: z.string().max(60).nullable(), label: shortText(80) }),
  celebrationDate: isoDate,
  contributionDeadline: isoDate,
  currency: z.enum(CURRENCY_CODES),
  totalBudgetMinor: minor,
  perPersonBudgetMinor: minor.nullable(),
  giftTier: z.enum(GIFT_TIERS),
  maxParticipants: z.number().int().min(2).max(200),
  organiserLanguage: language,
  onboardingVariant: z.enum(ONBOARDING_VARIANTS),
  /** Whether the organiser was enrolled in the onboarding experiment, and by what. */
  onboardingAssignedBy: z.enum(["flagsmith", "local-hash", "none"]),
  participants: z.array(participantSchema),
  preferences: z.array(preferenceSchema),
  wishlist: z.array(wishlistItemSchema),
  contributions: z.array(contributionSchema),
  /** Who gives to whom. Never sent to the organiser; each participant sees only their own pair. */
  assignments: z.object({ generatedAt: isoTime, pairs: z.array(assignmentSchema) }).nullable(),
  createdAt: isoTime,
  updatedAt: isoTime,
});
export type Circle = z.infer<typeof circleSchema>;

/** Input for creating a circle (both onboarding variants post the same shape). */
export const createCircleSchema = z
  .object({
    name: shortText(80),
    organiserName: shortText(60),
    festivalSlug: z.string().max(60).nullable(),
    occasionLabel: shortText(80),
    celebrationDate: isoDate,
    contributionDeadline: isoDate,
    currency: z.enum(CURRENCY_CODES),
    totalBudget: z.number().min(0).max(100_000_000),
    perPersonBudget: z.number().min(0).max(100_000_000).nullable(),
    giftTier: z.enum(GIFT_TIERS),
    maxParticipants: z.number().int().min(2).max(200),
    organiserLanguage: language,
    onboardingVariant: z.enum(ONBOARDING_VARIANTS),
  })
  .refine((v) => v.contributionDeadline <= v.celebrationDate, {
    message: "The contribution deadline must be on or before the celebration date",
    path: ["contributionDeadline"],
  });
export type CreateCircleInput = z.infer<typeof createCircleSchema>;

export const joinSchema = z.object({ name: shortText(60), language });

export const preferenceInputSchema = z.object({
  source: z.enum(["text", "voice"]),
  originalText: shortText(1200),
  originalLanguage: language,
  translation: z.object({ text: shortText(2400), language, model: z.string().max(60), edited: z.boolean() }).nullable(),
  transcript: z
    .object({
      model: z.string().max(60),
      requestId: z.string().max(120).nullable(),
      detectedLanguage: language.nullable(),
      languageProbability: z.number().min(0).max(1).nullable(),
      edited: z.boolean(),
    })
    .nullable(),
  structured: structuredPreferenceSchema,
  structuredBy: z.enum(["rules", "sarvam", "person"]),
});
export type PreferenceInput = z.infer<typeof preferenceInputSchema>;

export const wishlistInputSchema = z.object({
  title: shortText(100),
  category: z.enum(GIFT_CATEGORIES).nullable(),
  note: z.string().trim().max(280).default(""),
  link: httpsUrl.nullable(),
  estimate: z.number().min(0).max(100_000_000).nullable(),
  origin: z.enum(["manual", "suggestion", "preference"]).default("manual"),
});

export const contributionInputSchema = z.object({
  amount: z.number().min(0).max(100_000_000),
  status: z.enum(["pledged", "paid-offline"]),
});

export const GIFT_CATEGORY_LABELS: Record<(typeof GIFT_CATEGORIES)[number], string> = {
  fashion: "Fashion and textiles",
  jewellery: "Jewellery",
  "sweets-gourmet": "Sweets and gourmet",
  "home-lifestyle": "Home and lifestyle",
  personalised: "Personalised",
  cultural: "Craft and culture",
};

export const TIER_LABELS: Record<(typeof GIFT_TIERS)[number], string> = {
  everyday: "Everyday",
  premium: "Premium",
  elite: "Elite luxury",
};
