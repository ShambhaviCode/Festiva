import {
  addParticipant,
  addPreference,
  addWishlistItem,
  budgetInsights,
  CircleError,
  createCircle,
  drawAssignments,
  evenSplit,
  generateAssignments,
  isValidDerangement,
  organiserView,
  participantView,
  removeParticipant,
  removePreference,
  setContribution,
  type Ids,
} from "@/domain/circle/engine";
import { createCircleSchema, preferenceInputSchema, type CreateCircleInput, type PreferenceInput } from "@/domain/circle/schema";
import { mergeStructures, structureByRules } from "@/domain/circle/structure";
import { suggestGifts } from "@/domain/circle/suggestions";
import { verifiedContext } from "@/domain/circle/culture";
import { fromSarvamCode, LANGUAGES, languageByTag, supportsSpeech, supportsTranslation, toSarvamCode } from "@/domain/languages";
import { mulberry32 } from "@/domain/random";

let n = 0;
const ids: Ids = { next: () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}` };
const NOW = new Date("2026-11-17T10:00:00Z");

const INPUT: CreateCircleInput = {
  name: "Rao family Diwali",
  organiserName: "Shambhavi",
  festivalSlug: "diwali",
  occasionLabel: "Diwali",
  celebrationDate: "2027-10-29",
  contributionDeadline: "2027-10-20",
  currency: "INR",
  totalBudget: 10000,
  perPersonBudget: 1500,
  giftTier: "premium",
  maxParticipants: 8,
  organiserLanguage: "kn-IN",
  onboardingVariant: "guided",
};

const TEXT_PREF: PreferenceInput = {
  source: "text",
  originalText: "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ",
  originalLanguage: "kn-IN",
  translation: { text: "I like handmade gifts.", language: "en-IN", model: "sarvam-translate:v1", edited: false },
  transcript: null,
  structured: { categories: ["cultural"], likes: ["handmade"], avoid: [], dietary: [], materials: [], notes: "" },
  structuredBy: "rules",
};

function circleOf(people = 3) {
  let { circle } = createCircle(INPUT, ids, NOW, 30);
  for (let i = 1; i < people; i += 1) circle = addParticipant(circle, `Person ${i}`, "hi-IN", ids, NOW).circle;
  return circle;
}

describe("language registry", () => {
  test("covers Sarvam's 22 Indian languages plus Indian English for speech and translation", () => {
    const sarvam = LANGUAGES.filter((l) => l.availability === "available");
    expect(sarvam).toHaveLength(23);
    for (const language of sarvam) {
      expect(supportsSpeech(language.tag)).toBe(true);
      expect(language.providers[0].speechToText?.models).toContain("saaras:v4");
      expect(language.providers[0].translation?.models).toEqual(["sarvam-translate:v1"]);
    }
  });
  test("does not advertise Sarvam capabilities for languages it does not support", () => {
    for (const tag of ["es-ES", "fr-FR", "ar", "ja-JP"]) {
      expect(supportsSpeech(tag)).toBe(false);
      expect(supportsTranslation(tag, "en-IN")).toBe(false);
      expect(languageByTag.get(tag)?.inputMethods).toEqual(["text"]);
    }
  });
  test("maps BCP 47 Odia (or-IN) to Sarvam's od-IN and back", () => {
    expect(toSarvamCode("or-IN")).toBe("od-IN");
    expect(fromSarvamCode("od-IN")).toBe("or-IN");
    expect(toSarvamCode("es-ES")).toBeNull();
  });
  test("marks right-to-left scripts", () => {
    expect(languageByTag.get("ur-IN")?.direction).toBe("rtl");
    expect(languageByTag.get("ar")?.direction).toBe("rtl");
    expect(languageByTag.get("sd-IN")?.direction).toBe("auto");
  });
  test("translation needs two different supported languages", () => {
    expect(supportsTranslation("kn-IN", "hi-IN")).toBe(true);
    expect(supportsTranslation("kn-IN", "kn-IN")).toBe(false);
  });
});

describe("creating and joining a circle", () => {
  test("stores money in minor units and caps participants by remote configuration", () => {
    const { circle, organiser } = createCircle({ ...INPUT, maxParticipants: 50 }, ids, NOW, 12);
    expect(circle.totalBudgetMinor).toBe(1_000_000);
    expect(circle.perPersonBudgetMinor).toBe(150_000);
    expect(circle.maxParticipants).toBe(12);
    expect(circle.participants).toEqual([organiser]);
    expect(organiser.role).toBe("organiser");
  });
  test("rejects a deadline after the celebration", () => {
    expect(createCircleSchema.safeParse({ ...INPUT, contributionDeadline: "2027-11-01" }).success).toBe(false);
  });
  test("refuses joins beyond the limit and duplicate names", () => {
    let { circle } = createCircle({ ...INPUT, maxParticipants: 2 }, ids, NOW, 30);
    circle = addParticipant(circle, "Asha", "hi-IN", ids, NOW).circle;
    expect(() => addParticipant(circle, "Ravi", "hi-IN", ids, NOW)).toThrow(CircleError);
    const roomy = createCircle(INPUT, ids, NOW, 30).circle;
    const withAsha = addParticipant(roomy, "Asha", "hi-IN", ids, NOW).circle;
    expect(() => addParticipant(withAsha, "asha", "hi-IN", ids, NOW)).toThrow(/already uses that name/);
  });
});

describe("preferences keep the original and the translation apart", () => {
  test("original text and language are preserved exactly", () => {
    const circle = circleOf(2);
    const { preference } = addPreference(circle, circle.participants[1].id, TEXT_PREF, ids, NOW);
    expect(preference.original).toEqual({ text: TEXT_PREF.originalText, language: "kn-IN" });
    expect(preference.translation).toEqual({ text: "I like handmade gifts.", language: "en-IN", model: "sarvam-translate:v1", edited: false, provider: "sarvam" });
  });
  test("a typed preference never carries transcript metadata", () => {
    const circle = circleOf(2);
    const { preference } = addPreference(circle, circle.participants[1].id, { ...TEXT_PREF, transcript: { model: "saaras:v4", requestId: "x", detectedLanguage: "kn-IN", languageProbability: 0.9, edited: false } }, ids, NOW);
    expect(preference.transcript).toBeNull();
  });
  test("a corrected voice transcript is recorded as edited", () => {
    const circle = circleOf(2);
    const voice: PreferenceInput = { ...TEXT_PREF, source: "voice", transcript: { model: "saaras:v4", requestId: "req-1", detectedLanguage: "kn-IN", languageProbability: 0.93, edited: true } };
    expect(preferenceInputSchema.safeParse(voice).success).toBe(true);
    const { preference } = addPreference(circle, circle.participants[1].id, voice, ids, NOW);
    expect(preference.transcript?.edited).toBe(true);
    expect(preference.transcript?.provider).toBe("sarvam");
  });
  test("only the owner or the organiser can delete a preference", () => {
    let circle = circleOf(3);
    const [organiser, owner, other] = circle.participants;
    const { circle: withPref, preference } = addPreference(circle, owner.id, TEXT_PREF, ids, NOW);
    circle = withPref;
    expect(() => removePreference(circle, preference.id, other, NOW)).toThrow(/only delete your own/);
    expect(removePreference(circle, preference.id, owner, NOW).preferences).toHaveLength(0);
    expect(removePreference(circle, preference.id, organiser, NOW).preferences).toHaveLength(0);
  });
  test("removing a participant removes everything they added and invalidates the draw", () => {
    let circle = generateAssignments(circleOf(4), "seed", NOW);
    const leaver = circle.participants[2];
    circle = addPreference(circle, leaver.id, TEXT_PREF, ids, NOW).circle;
    circle = addWishlistItem(circle, leaver.id, { title: "Stole", category: "fashion", note: "", link: null, estimate: 900, origin: "manual" }, ids, NOW).circle;
    circle = setContribution(circle, leaver.id, 2000, "pledged", NOW);
    const after = removeParticipant(circle, leaver.id, NOW);
    expect(after.participants.map((p) => p.id)).not.toContain(leaver.id);
    expect(after.preferences).toHaveLength(0);
    expect(after.wishlist).toHaveLength(0);
    expect(after.contributions).toHaveLength(0);
    expect(after.assignments).toBeNull();
    expect(() => removeParticipant(after, after.participants[0].id, NOW)).toThrow(/organiser cannot be removed/);
  });
});

describe("Secret Santa", () => {
  test("needs at least three people", () => {
    expect(() => drawAssignments(["a", "b"], mulberry32(1))).toThrow(/at least three/);
  });
  test("every draw is a valid derangement forming one loop (1,000 random draws)", () => {
    for (let seed = 0; seed < 1000; seed += 1) {
      const people = Array.from({ length: 3 + (seed % 12) }, (_, i) => `p${i}`);
      const pairs = drawAssignments(people, mulberry32(seed));
      expect(isValidDerangement(pairs, people)).toBe(true);
      // Single cycle: following the chain from anyone visits everyone.
      const next = new Map(pairs.map((p) => [p.giverId, p.receiverId]));
      let at = people[0];
      const seen = new Set<string>();
      do {
        seen.add(at);
        at = next.get(at)!;
      } while (at !== people[0]);
      expect(seen.size).toBe(people.length);
    }
  });
  test("the organiser view hides pairs; each participant sees only their own", () => {
    const circle = generateAssignments(circleOf(5), "seed", NOW);
    const view = organiserView(circle);
    expect(view.assignments).toEqual({ generatedAt: NOW.toISOString(), count: 5 });
    expect(JSON.stringify(view)).not.toContain("receiverId");
    for (const person of circle.participants) {
      const mine = participantView(circle, person.id);
      const expected = circle.assignments!.pairs.find((p) => p.giverId === person.id)!.receiverId;
      expect(mine.myAssignment?.receiver.id).toBe(expected);
      expect(JSON.stringify(mine)).not.toContain("giverId");
    }
  });
});

describe("budget insights (integer arithmetic)", () => {
  test("even shares always add up to the target exactly", () => {
    for (let total = 0; total < 5000; total += 37) {
      for (let people = 1; people <= 13; people += 1) {
        const shares = evenSplit(total, people);
        expect(shares.reduce((a, b) => a + b, 0)).toBe(total);
        expect(Math.max(...shares) - Math.min(...shares)).toBeLessThanOrEqual(1);
      }
    }
  });
  test("tracks pledged, paid-outside and the gap, and flags wishes above the per-gift budget", () => {
    let circle = circleOf(3);
    const [a, b, c] = circle.participants;
    circle = setContribution(circle, a.id, 4000.5, "pledged", NOW);
    circle = setContribution(circle, b.id, 3000, "paid-offline", NOW);
    circle = addWishlistItem(circle, c.id, { title: "Silk saree", category: "fashion", note: "", link: null, estimate: 2500, origin: "manual" }, ids, NOW).circle;
    const insights = budgetInsights(circle, "2027-10-15");
    expect(insights.pledgedMinor).toBe(400050);
    expect(insights.paidOfflineMinor).toBe(300000);
    expect(insights.committedMinor).toBe(700050);
    expect(insights.gapMinor).toBe(1_000_000 - 700050);
    expect(insights.notYetPledged).toBe(1);
    expect(insights.evenShares).toEqual([333334, 333333, 333333]);
    expect(insights.wishlistOverPerPerson).toHaveLength(1);
    expect(insights.daysToDeadline).toBe(5);
  });
  test("setting a contribution to zero removes it", () => {
    let circle = circleOf(3);
    circle = setContribution(circle, circle.participants[1].id, 100, "pledged", NOW);
    expect(setContribution(circle, circle.participants[1].id, 0, "pledged", NOW).contributions).toHaveLength(0);
  });
});

describe("rules-based structuring", () => {
  test("extracts kinds of gift, likes, materials, dietary needs and things to avoid", () => {
    const s = structureByRules("I love handmade things, especially block-printed cotton stoles. No sweets please, I am diabetic. Allergic to nuts.");
    expect(s.categories).toEqual(expect.arrayContaining(["cultural", "fashion"]));
    expect(s.categories).not.toContain("sweets-gourmet");
    expect(s.likes).toContain("handmade");
    expect(s.materials).toContain("cotton");
    expect(s.dietary).toEqual(expect.arrayContaining(["nut-free", "no added sugar"]));
    expect(s.avoid).toEqual(expect.arrayContaining(["sweets", "nuts"]));
  });
  test("returns empty fields for empty input and merges several preferences", () => {
    expect(structureByRules("   ").categories).toEqual([]);
    const merged = mergeStructures([structureByRules("I like silver earrings"), structureByRules("Brass lamps are lovely, and tea")]);
    expect(merged.categories).toEqual(expect.arrayContaining(["jewellery", "home-lifestyle"]));
    expect(merged.materials).toEqual(expect.arrayContaining(["silver", "brass"]));
  });
});

describe("gift suggestions", () => {
  const circle = { giftTier: "premium" as const, occasion: { festivalSlug: "diwali", label: "Diwali" } };
  test("respect the circle's tier and leave out Elite unless the premium experience is on", () => {
    const profile = structureByRules("jewellery please");
    const off = suggestGifts({ ...circle, giftTier: "elite" }, profile, { count: 12, premiumExperience: false });
    expect(off.every((s) => !s.tiers.includes("elite"))).toBe(true);
    const on = suggestGifts({ ...circle, giftTier: "elite" }, profile, { count: 12, premiumExperience: true });
    expect(on.some((s) => s.tiers.includes("elite"))).toBe(true);
  });
  test("never suggest what a person asked to avoid, or nuts to someone nut-free", () => {
    const profile = structureByRules("No sweets please. Allergic to nuts.");
    const ideas = suggestGifts(circle, profile, { count: 12, premiumExperience: false });
    expect(ideas.find((s) => /sweets|nuts/i.test(s.title))).toBeUndefined();
  });
  test("explain every suggestion, carry no prices, and honour the requested count", () => {
    const ideas = suggestGifts(circle, structureByRules("handmade cotton"), { count: 3, premiumExperience: false });
    expect(ideas).toHaveLength(3);
    for (const idea of ideas) {
      expect(idea.reasons.length).toBeGreaterThan(0);
      expect(JSON.stringify(idea)).not.toMatch(/price|₹|\$/i);
    }
  });
  test("are deterministic", () => {
    const profile = structureByRules("I like books and tea");
    expect(suggestGifts(circle, profile, { count: 4, premiumExperience: false })).toEqual(suggestGifts(circle, profile, { count: 4, premiumExperience: false }));
  });
});

describe("cultural context", () => {
  test("comes only from the curated guide, with its sources", () => {
    const context = verifiedContext("diwali")!;
    expect(context.festival.name).toBe("Diwali");
    expect(context.sources.length).toBeGreaterThan(0);
    expect(context.giftCustoms.length).toBeGreaterThan(0);
    expect(verifiedContext(null)).toBeNull();
    expect(verifiedContext("not-a-festival")).toBeNull();
  });
});
