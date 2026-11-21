import { allocate, BASE_WEIGHTS, BUDGET_CATEGORIES, perHead, remaining, setLine, sumLines, weightsFor, type Weights } from "@/domain/budget";
import { formatMoney, fromMinor, toMinor } from "@/domain/currency";
import { mulberry32 } from "@/domain/random";

describe("budget arithmetic", () => {
  test("allocation always sums exactly to the total", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 500; i += 1) {
      const total = Math.floor(rng() * 10_000_000);
      const weights = Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, Math.floor(rng() * 50)])) as Weights;
      const lines = allocate(total, weights);
      expect(sumLines(lines)).toBe(total);
      for (const line of lines) expect(Number.isInteger(line.amountMinor) && line.amountMinor >= 0).toBe(true);
    }
  });

  test("known split with base weights", () => {
    const lines = allocate(1_500_000, BASE_WEIGHTS); // ₹15,000.00
    const byCat = Object.fromEntries(lines.map((l) => [l.category, l.amountMinor]));
    expect(byCat).toEqual({ food: 600000, gifts: 225000, decor: 180000, attire: 120000, activities: 150000, music: 75000, contingency: 150000 });
  });

  test("largest remainder distributes leftover units deterministically", () => {
    const even: Weights = { food: 1, gifts: 1, decor: 1, attire: 0, activities: 0, music: 0, contingency: 0 };
    const lines = allocate(100, even);
    expect(lines.slice(0, 3).map((l) => l.amountMinor)).toEqual([34, 33, 33]);
    expect(sumLines(lines)).toBe(100);
  });

  test("zero weights put everything in contingency; zero total gives zero lines", () => {
    const zero = Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, 0])) as Weights;
    expect(allocate(999, zero).find((l) => l.category === "contingency")!.amountMinor).toBe(999);
    expect(sumLines(allocate(0, BASE_WEIGHTS))).toBe(0);
  });

  test("rejects invalid numbers", () => {
    expect(() => allocate(-1, BASE_WEIGHTS)).toThrow(RangeError);
    expect(() => allocate(10.5, BASE_WEIGHTS)).toThrow(RangeError);
    expect(() => allocate(100, { ...BASE_WEIGHTS, food: -1 })).toThrow(RangeError);
    expect(() => perHead(100, 0)).toThrow(RangeError);
    expect(() => toMinor(-5, "INR")).toThrow(RangeError);
    expect(() => toMinor(Number.NaN, "INR")).toThrow(RangeError);
  });

  test("remaining, per head and editing a line", () => {
    const lines = allocate(100_000, BASE_WEIGHTS);
    expect(remaining(100_000, lines)).toBe(0);
    const edited = setLine(lines, "food", 90_000);
    expect(remaining(100_000, edited)).toBe(100_000 - sumLines(edited));
    expect(remaining(100_000, edited)).toBeLessThan(0);
    expect(perHead(100_000, 3)).toBe(33_333);
  });

  test("minor units respect currency digits", () => {
    expect(toMinor(1250.5, "INR")).toBe(125050);
    expect(toMinor(1250, "JPY")).toBe(1250);
    expect(toMinor(0.1 + 0.2, "USD")).toBe(30);
    expect(fromMinor(125050, "INR")).toBe(1250.5);
    expect(formatMoney(125050, "USD", "en-US")).toBe("$1,250.5");
    expect(formatMoney(5000, "JPY", "en-US")).toBe("¥5,000");
  });

  test("weights respond to preferences and explain themselves", () => {
    const base = weightsFor({ interests: [], style: "traditional", attendees: 4, audience: "family" });
    expect(base.weights).toEqual(BASE_WEIGHTS);
    expect(base.reasons).toHaveLength(0);
    const foodie = weightsFor({ interests: ["food", "gifting"], style: "grand", attendees: 40, audience: "family" });
    expect(foodie.weights.food).toBe(BASE_WEIGHTS.food + 18);
    expect(foodie.weights.decor).toBe(BASE_WEIGHTS.decor + 8);
    expect(foodie.reasons.length).toBe(4);
    const solo = weightsFor({ interests: [], style: "intimate", attendees: 1, audience: "solo" });
    expect(solo.weights.gifts).toBe(5);
    expect(Object.values(solo.weights).every((w) => w >= 0)).toBe(true);
  });
});
