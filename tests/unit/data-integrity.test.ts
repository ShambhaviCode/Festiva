import { festivals, festivalBySlug } from "@/data/festivals";
import { countries, countryByCode } from "@/data/countries";
import { foods } from "@/data/foods";
import { attire } from "@/data/attire";
import { destinations } from "@/data/destinations";
import { brands, brandBySlug, giftIdeas } from "@/data/shop";
import { artists, genreBySlug, genres, playlists } from "@/data/music";
import { QUIZ_QUESTIONS } from "@/data/quiz";

const unique = (values: string[]) => new Set(values).size === values.length;
const festivalOk = (slug: string) => festivalBySlug.has(slug);

describe("curated data integrity", () => {
  test("slugs and codes are unique", () => {
    expect(unique(festivals.map((f) => f.slug))).toBe(true);
    expect(unique(countries.map((c) => c.code))).toBe(true);
    expect(unique(foods.map((f) => f.slug))).toBe(true);
    expect(unique(attire.map((a) => a.slug))).toBe(true);
    expect(unique(destinations.map((d) => d.slug))).toBe(true);
    expect(unique(brands.map((b) => b.slug))).toBe(true);
    expect(unique(giftIdeas.map((g) => g.slug))).toBe(true);
    expect(unique(genres.map((g) => g.slug))).toBe(true);
    expect(unique(artists.map((a) => a.name))).toBe(true);
    expect(unique(QUIZ_QUESTIONS.map((q) => q.id))).toBe(true);
  });

  test("festivals reference known countries and genres, and carry sources", () => {
    for (const f of festivals) {
      expect(f.countries.length).toBeGreaterThan(0);
      for (const code of f.countries) expect(countryByCode.has(code)).toBe(true);
      for (const g of f.genres) expect(genreBySlug.has(g)).toBe(true);
      expect(f.provenance.sources.length).toBeGreaterThan(0);
      for (const s of f.provenance.sources) expect(s.url).toMatch(/^https:\/\//);
      expect(f.palette).toHaveLength(3);
      expect(Math.abs(f.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(f.lon)).toBeLessThanOrEqual(180);
    }
  });

  test("food, attire and destinations reference known festivals and countries", () => {
    for (const f of foods) {
      expect(countryByCode.has(f.country)).toBe(true);
      expect(f.festivals.every(festivalOk)).toBe(true);
      if (f.vegan) expect(f.vegetarian).toBe(true);
      if (f.vegetarian) expect(f.contains.some((c) => c === "meat" || c === "fish" || c === "pork")).toBe(false);
      if (f.vegan) expect(f.contains.some((c) => c === "dairy" || c === "egg")).toBe(false);
    }
    for (const a of attire) {
      expect(countryByCode.has(a.country)).toBe(true);
      expect(a.festivals.every(festivalOk)).toBe(true);
      expect(a.brands.every((b) => brandBySlug.has(b))).toBe(true);
    }
    for (const d of destinations) {
      expect(countryByCode.has(d.country)).toBe(true);
      expect(d.festivals.every(festivalOk)).toBe(true);
    }
  });

  test("every festival has at least one related food or destination", () => {
    // Chopi Timbila's only place (Zavala) was removed because no free photograph of it exists.
    const EXCEPTIONS = new Set(["chopi-timbila"]);
    for (const f of festivals) {
      if (EXCEPTIONS.has(f.slug)) continue;
      const related = foods.some((x) => x.festivals.includes(f.slug)) || destinations.some((x) => x.festivals.includes(f.slug));
      expect([f.slug, related]).toEqual([f.slug, true]);
    }
  });

  test("shop data: brands have https official links; gift ideas reference known brands", () => {
    for (const b of brands) expect(b.officialUrl).toMatch(/^https:\/\//);
    for (const g of giftIdeas) {
      expect(g.brands.every((b) => brandBySlug.has(b))).toBe(true);
      expect(g.festivals.every((s) => s === "any" || festivalOk(s))).toBe(true);
      expect(g.tiers.length).toBeGreaterThan(0);
    }
    // The catalogue must never carry prices, ratings or stock fields.
    for (const item of [...brands, ...giftIdeas] as unknown as Record<string, unknown>[]) {
      for (const key of ["price", "rating", "reviews", "discount", "stock", "inventory"]) expect(item).not.toHaveProperty(key);
    }
  });

  test("music data is internally consistent", () => {
    for (const a of artists) expect(genreBySlug.has(a.genre)).toBe(true);
    for (const g of genres) expect(artists.some((a) => a.genre === g.slug)).toBe(true);
    for (const p of playlists) {
      for (const t of p.tracks) {
        const artist = artists.find((a) => a.name === t.artist);
        expect(artist?.songs).toContain(t.song);
      }
    }
  });

  test("quiz answers are valid and point at real festivals", () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      expect(unique(q.options)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(festivalOk(q.festival)).toBe(true);
    }
  });
});

describe("cultural provenance (1.2)", () => {
  // Imported here so the existing suite above stays unchanged.
  const { FESTIVAL_CULTURE, calendarSystemOf } = jest.requireActual("@/data/festival-culture") as typeof import("@/data/festival-culture");
  const { EXPERT_REVIEWS } = jest.requireActual("@/data/reviews") as typeof import("@/data/reviews");

  test("every festival has original names (or a note why not), symbols and a calendar system", () => {
    for (const f of festivals) {
      const c = FESTIVAL_CULTURE[f.slug];
      expect(c).toBeDefined();
      expect(c.originalNames.length > 0 || Boolean(c.namesNote)).toBe(true);
      for (const name of c.originalNames) expect(name.lang).toMatch(/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/);
      expect(c.symbolism.length).toBeGreaterThan(0);
      expect(calendarSystemOf(f.slug, f.date).length).toBeGreaterThan(5);
    }
    for (const slug of Object.keys(FESTIVAL_CULTURE)) expect(festivalBySlug.has(slug)).toBe(true);
  });

  test("nothing is marked expert-reviewed without a named reviewer, credentials, date and scope", () => {
    for (const r of EXPERT_REVIEWS) {
      expect(festivalBySlug.has(r.festival)).toBe(true);
      expect(r.reviewer.trim().length).toBeGreaterThan(2);
      expect(r.credentials.trim().length).toBeGreaterThan(5);
      expect(r.scope.trim().length).toBeGreaterThan(5);
      expect(r.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  test("checked and projected dates always cite a source", () => {
    for (const f of festivals) {
      if (f.date.kind !== "table") continue;
      for (const o of f.date.occurrences) {
        if (o.status !== "unchecked") {
          expect(o.sources.length).toBeGreaterThan(0);
          expect(o.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
        expect(o.start <= o.end).toBe(true);
      }
    }
  });

  test("the guide covers every region: at least three festivals in each, except two in North America and one in Central Asia", () => {
    const byRegion = new Map<string, number>();
    for (const f of festivals) byRegion.set(f.region, (byRegion.get(f.region) ?? 0) + 1);
    for (const region of ["africa", "southeast-asia", "oceania", "latin-america", "europe", "south-asia", "east-asia", "middle-east"]) {
      expect(byRegion.get(region) ?? 0).toBeGreaterThanOrEqual(3);
    }
    expect(byRegion.get("north-america") ?? 0).toBeGreaterThanOrEqual(2);
    expect(byRegion.get("central-asia") ?? 0).toBeGreaterThanOrEqual(1);
  });
});
