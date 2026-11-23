/** @jest-environment node */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { countries } from "@/data/countries";
import { festivalBySlug, festivals } from "@/data/festivals";
import { indiaDivisions, indiaFestivalLinks, linksForDivision } from "@/data/geo-india";
import { DEFAULT_INPUT } from "@/domain/matchmaker/schema";
import { cleanPatch, describePatch, mergeBrief, parseBrief, type BriefCatalog } from "@/domain/matchmaker/brief";
import { rank, tokenise } from "@/domain/search-score";
import { NAV_GROUPS } from "@/lib/site";

const geo = (file: string) => JSON.parse(readFileSync(join(process.cwd(), "public", "geo", file), "utf8"));

describe("India's geographic hierarchy", () => {
  test("has exactly 28 states and 8 union territories, with unique ids", () => {
    expect(indiaDivisions.filter((d) => d.kind === "state")).toHaveLength(28);
    expect(indiaDivisions.filter((d) => d.kind === "union-territory")).toHaveLength(8);
    expect(new Set(indiaDivisions.map((d) => d.id)).size).toBe(36);
  });
  test("every division has a boundary in the Natural Earth file, and every boundary is a division", () => {
    const ids = new Set(geo("admin1-IN.json").items.map((i: { id: string }) => i.id));
    for (const d of indiaDivisions) expect(ids.has(d.id)).toBe(true);
    expect(ids.size).toBe(36);
  });
  test("festival links come only from the festival's own record", () => {
    for (const link of indiaFestivalLinks) {
      const f = festivalBySlug.get(link.festival);
      expect(f).toBeDefined();
      expect(f!.countries).toContain("IN");
      expect(indiaDivisions.some((d) => d.id === link.division)).toBe(true);
      if (link.basis === "variation") expect(f!.regionalVariations.map((v) => v.place)).toContain(link.place);
    }
  });
  test("flagship regional festivals sit in their states", () => {
    const has = (div: string, slug: string) => linksForDivision(div).some((l) => l.festival === slug);
    expect(has("IN-KL", "onam")).toBe(true);
    expect(has("IN-WB", "durga-puja")).toBe(true);
    expect(has("IN-AS", "bihu")).toBe(true);
    expect(has("IN-NL", "hornbill-festival")).toBe(true);
    expect(has("IN-KA", "dussehra")).toBe(true);
    // Pongal's record mentions Lohri and Bihu as related festivals elsewhere; it must not be linked there.
    expect(has("IN-PB", "pongal")).toBe(false);
  });
});

describe("World map data", () => {
  const world = geo("world.json");
  test("covers the guide's countries with sane, India point-of-view shapes", () => {
    const ids = new Set(world.countries.map((c: { id: string }) => c.id));
    expect(world.countries.length).toBeGreaterThan(200);
    expect(new Set(world.countries.map((c: { id: string }) => c.id)).size).toBe(world.countries.length);
    const missing = countries.filter((c) => !ids.has(c.code)).map((c) => c.code);
    // Very small island states can be below Natural Earth's simplified detail; the map's country list still covers them.
    expect(missing.length).toBeLessThan(25);
    const india = world.countries.find((c: { id: string }) => c.id === "IN");
    const [x0, , x1] = india.b;
    expect(x1 - x0).toBeLessThan(150); // a country, not the whole globe (ring direction is right)
    expect(world.source).toMatch(/India point of view/);
  });
});

describe("Navigation", () => {
  test("six intents at the top level, every section reachable", () => {
    expect(NAV_GROUPS.map((g) => g.label)).toEqual(["Discover", "World", "Journeys", "Culture", "Shop", "Plan"]);
    const hrefs = NAV_GROUPS.flatMap((g) => [g.href, ...(g.links ?? []).map((l) => l.href)]);
    for (const h of ["/discover", "/world", "/journeys", "/taste", "/wear", "/sound", "/wishes", "/play", "/shop", "/matchmaker", "/circles", "/intelligence"]) expect(hrefs).toContain(h);
  });
});

describe("Global search", () => {
  const docs = [
    { title: "Karnataka", alt: "", haystack: " karnataka india state " },
    { title: "Diwali", alt: "deepavali", haystack: " diwali festival of lights india " },
    { title: "Día de Muertos", alt: "", haystack: " dia de muertos mexico " },
  ];
  test("matches word starts, local names and accents", () => {
    expect(rank(docs, "karna")[0].title).toBe("Karnataka");
    expect(rank(docs, "deepa")[0].title).toBe("Diwali");
    expect(rank(docs, "dia de")[0].title).toBe("Día de Muertos");
    expect(rank(docs, "zzz")).toHaveLength(0);
    expect(tokenise("  Tết  ")).toEqual(["tet"]);
  });
  test("the search index includes India's states and opens countries on the map", async () => {
    const { GET } = await import("@/app/api/search-index/route");
    const index = (await (await GET()).json()) as { type: string; title: string; href: string }[];
    expect(index.find((d) => d.title === "Karnataka")?.href).toBe("/world?country=IN&region=IN-KA");
    expect(index.find((d) => d.type === "country" && d.title === "Japan")?.href).toBe("/world?country=JP");
    expect(index.filter((d) => d.type === "festival")).toHaveLength(festivals.length);
  });
});

describe("Celebration brief", () => {
  const catalog: BriefCatalog = {
    occasions: [{ id: "diwali", names: ["Diwali", "Deepavali"] }, { id: "holi", names: ["Holi"] }, { id: "birthday", names: ["birthday"] }],
    countries: [{ code: "IN", name: "India" }, { code: "JP", name: "Japan" }],
    cities: { bengaluru: "IN", mumbai: "IN" },
  };
  test("reads occasion, people, place, budget, time, diet and style from English", () => {
    const { patch } = parseBrief("I want to celebrate Diwali with six friends in Bengaluru. Our budget is ₹5,000. We have two days, vegetarian food, something memorable.", catalog);
    expect(patch).toMatchObject({ occasion: "diwali", attendees: 7, audience: "friends", city: "Bengaluru", countryCode: "IN", budget: 5000, currency: "INR", duration: "weekend", dietary: ["vegetarian"], style: "grand" });
  });
  test("handles a family of N, other currencies and k multipliers", () => {
    expect(parseBrief("Holi for a family of 8, $200", catalog).patch).toMatchObject({ occasion: "holi", attendees: 8, budget: 200, currency: "USD" });
    expect(parseBrief("birthday party budget 12k rupees", catalog).patch).toMatchObject({ occasion: "birthday", budget: 12000, currency: "INR" });
  });
  test("never invents values", () => {
    expect(parseBrief("hello there", catalog).patch).toEqual({});
  });
  test("AI output is validated field by field, and invalid merges fall back to the base", () => {
    const cleaned = cleanPatch({ occasion: "not-a-festival", attendees: 0, budget: -5, currency: "XYZ", audience: "aliens", dietary: ["vegan", "carnivore"], countryCode: "in", city: "Mysuru" }, new Set(["diwali"]));
    expect(cleaned).toEqual({ dietary: ["vegan"], countryCode: "IN", city: "Mysuru" });
    expect(mergeBrief(DEFAULT_INPUT, { attendees: 12, occasion: "holi" })).toMatchObject({ attendees: 12, occasion: "holi" });
    expect(describePatch({ occasion: "diwali", attendees: 7, budget: 5000, currency: "INR" }, () => "Diwali")).toEqual(["Occasion: Diwali", "7 people", "Budget: INR 5,000"]);
  });
  test("the brief route works without Sarvam, saying plainly that rules read it", async () => {
    const { POST } = await import("@/app/api/matchmaker/brief/route");
    const res = await POST(new Request("http://localhost/api/matchmaker/brief", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost" }, body: JSON.stringify({ text: "Diwali with six friends in Mumbai, budget ₹5,000" }) }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toBe("rules");
    expect(data.notice).toMatch(/not configured/);
    expect(data.input).toMatchObject({ occasion: "diwali", attendees: 7, city: "Mumbai", budget: 5000, currency: "INR" });
  });
});
