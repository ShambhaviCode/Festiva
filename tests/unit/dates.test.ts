import { addDays, easterSunday, formatRange, nextOccurrence, nthWeekday, occurrenceInYear, parseISO, toISO, typicalMonths, utc } from "@/domain/dates";
import { festivalBySlug, festivals } from "@/data/festivals";

const rule = (slug: string) => festivalBySlug.get(slug)!.date;

describe("date engine", () => {
  test("Easter Sunday for known years", () => {
    expect(toISO(easterSunday(2024))).toBe("2024-03-31");
    expect(toISO(easterSunday(2025))).toBe("2025-04-20");
    expect(toISO(easterSunday(2026))).toBe("2026-04-05");
    expect(toISO(easterSunday(2027))).toBe("2027-03-28");
  });

  test("nth weekday, including last-of-month", () => {
    expect(toISO(nthWeekday(2026, 11, 4, 4))).toBe("2026-11-26"); // US Thanksgiving 2026
    expect(toISO(nthWeekday(2027, 8, 3, -1))).toBe("2027-08-25"); // last Wednesday of August 2027
    expect(toISO(nthWeekday(2025, 8, 3, -1))).toBe("2025-08-27");
  });

  test("Oktoberfest rule matches published seasons", () => {
    const o25 = occurrenceInYear(rule("oktoberfest"), 2025)!;
    expect([toISO(o25.start), toISO(o25.end)]).toEqual(["2025-09-20", "2025-10-05"]);
    const o26 = occurrenceInYear(rule("oktoberfest"), 2026)!;
    expect([toISO(o26.start), toISO(o26.end)]).toEqual(["2026-09-19", "2026-10-04"]);
    const o27 = occurrenceInYear(rule("oktoberfest"), 2027)!;
    expect([toISO(o27.start), toISO(o27.end)]).toEqual(["2027-09-18", "2027-10-03"]);
  });

  test("Swedish Midsummer Eve is the Friday between 19 and 25 June", () => {
    for (let year = 2024; year <= 2032; year += 1) {
      const o = occurrenceInYear(rule("midsummer"), year)!;
      expect(o.start.getUTCDay()).toBe(5);
      expect(o.start.getUTCDate()).toBeGreaterThanOrEqual(19);
      expect(o.start.getUTCDate()).toBeLessThanOrEqual(25);
    }
  });

  test("Rio carnival runs Friday to Ash Wednesday", () => {
    const o = occurrenceInYear(rule("rio-carnival"), 2027)!;
    expect([toISO(o.start), toISO(o.end)]).toEqual(["2027-02-05", "2027-02-10"]);
    expect(o.start.getUTCDay()).toBe(5);
    expect(o.end.getUTCDay()).toBe(3);
  });

  test("next occurrence: fixed, spanning year end, and table-based", () => {
    const today = utc(2026, 11, 16);
    expect(toISO(nextOccurrence(rule("christmas"), today)!.start)).toBe("2026-12-25");
    expect(toISO(nextOccurrence(rule("thanksgiving"), today)!.start)).toBe("2026-11-26");
    const hanukkah = nextOccurrence(rule("hanukkah"), today)!;
    expect(toISO(hanukkah.start)).toBe("2026-12-04");
    expect(hanukkah.certainty).toBe("verified");
    // Kwanzaa in progress on 30 December still counts as current.
    expect(toISO(nextOccurrence(rule("kwanzaa"), utc(2026, 12, 30))!.start)).toBe("2026-12-26");
    expect(toISO(nextOccurrence(rule("kwanzaa"), utc(2027, 1, 1))!.start)).toBe("2026-12-26");
    expect(toISO(nextOccurrence(rule("diwali"), today)!.start)).toBe("2027-10-29");
  });

  test("never extrapolates lunar dates beyond the checked table", () => {
    expect(nextOccurrence(rule("diwali"), utc(2029, 1, 1))).toBeNull();
    expect(nextOccurrence(rule("eid-al-fitr"), utc(2027, 1, 1))!.certainty).toBe("projected");
  });

  test("table occurrences are valid, ordered and sourced", () => {
    for (const festival of festivals) {
      if (festival.date.kind !== "table") continue;
      expect(festival.date.occurrences.length).toBeGreaterThan(0);
      for (const o of festival.date.occurrences) {
        expect(parseISO(o.start).getTime()).toBeLessThanOrEqual(parseISO(o.end).getTime());
        expect(o.sources.length).toBeGreaterThan(0);
        if (o.status !== "unchecked") expect(o.lastChecked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  test("typical months and formatting", () => {
    expect(typicalMonths(rule("diwali"), 2026)).toEqual([10, 11]);
    expect(typicalMonths(rule("semana-santa"), 2026)).toEqual([3, 4]);
    expect(formatRange(utc(2027, 10, 29), utc(2027, 10, 29), "en-GB")).toBe("29 October 2027");
    expect(formatRange(utc(2027, 2, 6), utc(2027, 2, 20), "en-GB")).toBe("6 – 20 February 2027");
    expect(formatRange(utc(2027, 12, 24), utc(2028, 1, 1), "en-GB")).toBe("24 December 2027 – 1 January 2028");
    expect(toISO(addDays(utc(2028, 2, 28), 1))).toBe("2028-02-29");
    expect(() => parseISO("2027-2-1")).toThrow();
  });
});
