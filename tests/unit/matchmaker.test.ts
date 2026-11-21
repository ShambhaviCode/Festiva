import { DEFAULT_INPUT, matchmakerInputSchema, planSchema, type MatchmakerInput } from "@/domain/matchmaker/schema";
import { buildSchedule, editItem, foodAllowed, generatePlan, planToText, regenerateSection, removeItem, replaceItem, SECTION_META } from "@/domain/matchmaker/engine";
import { sumLines } from "@/domain/budget";
import { foodBySlug, foods } from "@/data/foods";

const NOW = new Date("2026-11-16T12:00:00Z");
const make = (patch: Partial<MatchmakerInput> = {}) => generatePlan({ ...DEFAULT_INPUT, ...patch }, { id: "plan-1", now: NOW });
const section = (plan: ReturnType<typeof make>, key: string) => plan.sections.find((s) => s.key === key)!;

describe("Matchmaker input validation", () => {
  test("accepts the default input and rejects bad values", () => {
    expect(matchmakerInputSchema.safeParse(DEFAULT_INPUT).success).toBe(true);
    expect(matchmakerInputSchema.safeParse({ ...DEFAULT_INPUT, attendees: 0 }).success).toBe(false);
    expect(matchmakerInputSchema.safeParse({ ...DEFAULT_INPUT, budget: -1 }).success).toBe(false);
    expect(matchmakerInputSchema.safeParse({ ...DEFAULT_INPUT, currency: "XXX" }).success).toBe(false);
    expect(matchmakerInputSchema.safeParse({ ...DEFAULT_INPUT, startTime: "25:00" }).success).toBe(false);
    expect(matchmakerInputSchema.safeParse({ ...DEFAULT_INPUT, countryCode: "india" }).success).toBe(false);
    expect(matchmakerInputSchema.safeParse({ ...DEFAULT_INPUT, dietary: ["carnivore"] }).success).toBe(false);
  });
});

describe("Matchmaker plan generation", () => {
  test("is deterministic for the same input", () => {
    expect(make()).toEqual(make());
  });

  test("produces every promised section and validates against the plan schema", () => {
    const plan = make();
    expect(plan.sections.map((s) => s.key)).toEqual(["schedule", "food", "gifts", "attire", "decor", "activities", "music", "greetings", "destinations", "context"]);
    expect(planSchema.safeParse(plan).success).toBe(true);
    expect(plan.concept.source).toBe("rules");
    expect(plan.title).toBe("Diwali in India");
    for (const s of plan.sections) for (const item of s.items) expect(item.reason.length).toBeGreaterThan(0);
  });

  test("budget lines sum to the stated budget in minor units", () => {
    const plan = make({ budget: 15000, currency: "INR" });
    expect(plan.budget.totalMinor).toBe(1_500_000);
    expect(sumLines(plan.budget.lines)).toBe(1_500_000);
    const yen = make({ budget: 33333, currency: "JPY", interests: ["food", "music", "fashion"] });
    expect(sumLines(yen.budget.lines)).toBe(33333);
  });

  test("dietary requirements are honoured for every suggested dish", () => {
    for (const dietary of [["vegan"], ["vegetarian", "nut-free"], ["gluten-free", "dairy-free"], ["no-pork", "egg-free"]] as MatchmakerInput["dietary"][]) {
      for (const occasion of ["diwali", "lunar-new-year", "christmas", "eid-al-fitr", "birthday"]) {
        const plan = make({ dietary, occasion });
        for (const item of section(plan, "food").items) {
          if (!item.href?.startsWith("/taste/")) continue;
          const food = foodBySlug.get(item.href.replace("/taste/", ""))!;
          expect(foodAllowed(food, dietary)).toBe(true);
        }
      }
    }
  });

  test("says so honestly when no dish fits", () => {
    const plan = make({ occasion: "oktoberfest", countryCode: "DE", dietary: ["vegan", "gluten-free"] });
    const food = section(plan, "food").items;
    expect(food).toHaveLength(1);
    expect(food[0].title).toMatch(/No dish in FESTIVA's guide/);
    expect(foods.filter((f) => f.festivals.includes("oktoberfest") && foodAllowed(f, ["vegan", "gluten-free"]))).toHaveLength(0);
  });

  test("festival dishes rank above unrelated ones, and duration sets counts", () => {
    const short = make({ duration: "two-hours" });
    const long = make({ duration: "weekend" });
    expect(section(short, "food").items).toHaveLength(2);
    expect(section(long, "activities").items).toHaveLength(5);
    expect(section(short, "food").items[0].reason).toMatch(/Diwali/);
  });

  test("schedule runs forward in time from the chosen start", () => {
    const plan = make({ startTime: "17:00", duration: "half-day" });
    const times = section(plan, "schedule").items.map((i) => i.time!);
    expect(times[0]).toBe("17:00");
    const minutes = times.map((t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3)));
    for (let i = 1; i < minutes.length; i += 1) expect(minutes[i]).toBeGreaterThan(minutes[i - 1]);
    expect(minutes[minutes.length - 1] - minutes[0]).toBeLessThanOrEqual(240);
    const weekend = make({ duration: "weekend" });
    expect(section(weekend, "schedule").items.some((i) => i.time!.startsWith("Day 2"))).toBe(true);
  });

  test("generic occasions work without a festival", () => {
    const plan = make({ occasion: "birthday", countryCode: "JP" });
    expect(plan.title).toBe("Birthday in Japan");
    expect(section(plan, "context").items[0].title).toBe("Make it yours");
    expect(planSchema.safeParse(plan).success).toBe(true);
  });

  test("notes when the festival is celebrated outside its home regions", () => {
    const plan = make({ occasion: "diwali", countryCode: "DE" });
    expect(section(plan, "context").items.some((i) => i.title === "Celebrating in Germany")).toBe(true);
  });
});

describe("Matchmaker editing", () => {
  const later = new Date("2026-11-16T13:00:00Z");

  test("regenerating a section offers different items and keeps the rest untouched", () => {
    const plan = make();
    const next = regenerateSection(plan, "activities", later);
    expect(section(next, "activities").nonce).toBe(1);
    expect(section(next, "activities").items.map((i) => i.id)).not.toEqual(section(plan, "activities").items.map((i) => i.id));
    expect(section(next, "food")).toBe(section(plan, "food"));
    expect(next.updatedAt).toBe(later.toISOString());
    expect(planSchema.safeParse(next).success).toBe(true);
  });

  test("replacing swaps exactly one item for one not already present", () => {
    const plan = make();
    const target = section(plan, "gifts").items[0];
    const next = replaceItem(plan, "gifts", target.id, later)!;
    const ids = section(next, "gifts").items.map((i) => i.id);
    expect(ids).not.toContain(target.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(section(plan, "gifts").items.length);
  });

  test("replace is refused for derived sections", () => {
    const plan = make();
    expect(SECTION_META.schedule.replaceable).toBe(false);
    expect(replaceItem(plan, "schedule", section(plan, "schedule").items[0].id, later)).toBeNull();
  });

  test("edit marks the item as edited; remove deletes it", () => {
    const plan = make();
    const target = section(plan, "decor").items[0];
    const edited = editItem(plan, "decor", target.id, { title: "My own idea", detail: "Fairy lights" }, later);
    expect(section(edited, "decor").items[0]).toMatchObject({ title: "My own idea", detail: "Fairy lights", edited: true });
    const removed = removeItem(edited, "decor", target.id, later);
    expect(section(removed, "decor").items).toHaveLength(section(plan, "decor").items.length - 1);
  });

  test("rebuilding the schedule reflects edited activities", () => {
    const plan = make();
    const first = section(plan, "activities").items[0];
    const edited = editItem(plan, "activities", first.id, { title: "Fly a kite", detail: "On the terrace" }, later);
    const rebuilt = regenerateSection(edited, "schedule", later);
    expect(section(rebuilt, "schedule").items.some((i) => i.title === "Fly a kite")).toBe(true);
    expect(buildSchedule(plan.input, [], [])[0].title).toBe("Welcome");
  });

  test("text export contains sections and the budget total", () => {
    const text = planToText(make());
    expect(text).toContain("Diwali in India");
    expect(text).toContain("SCHEDULE");
    expect(text).toContain("Total budget: ₹15,000");
    expect(text).toContain("estimates, not prices");
  });
});

describe("Matchmaker observance and age bands (1.2)", () => {
  const plan = (patch: Partial<MatchmakerInput>) => generatePlan({ ...DEFAULT_INPUT, ...patch }, { id: "t", now: NOW });
  const items = (p: ReturnType<typeof plan>, key: string) => p.sections.find((s) => s.key === key)?.items ?? [];

  test("plans saved before 1.2 still parse, with neutral defaults", () => {
    const { observance: _o, ageBands: _a, ...old } = DEFAULT_INPUT;
    void _o;
    void _a;
    const parsed = matchmakerInputSchema.parse(old);
    expect(parsed.observance).toBe("cultural");
    expect(parsed.ageBands).toEqual([]);
    const legacy = generatePlan(DEFAULT_INPUT, { id: "t", now: NOW });
    expect(planSchema.parse(JSON.parse(JSON.stringify({ ...legacy, input: old }))).input.ageBands).toEqual([]);
  });

  test("the defaults change nothing: same plan as before the new options existed", () => {
    const a = plan({});
    const b = plan({ observance: "cultural", ageBands: [] });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test("children or teenagers coming means no alcohol, even if the host did not ask", () => {
    const adults = plan({ occasion: "inti-raymi", countryCode: "PE" });
    expect(items(adults, "food").map((i) => i.href)).toContain("/taste/chicha-de-jora");
    for (const band of ["under-5", "5-12", "13-17"] as const) {
      const withKids = plan({ occasion: "inti-raymi", countryCode: "PE", ageBands: ["adults", band] });
      expect(items(withKids, "food").map((i) => i.href)).not.toContain("/taste/chicha-de-jora");
      expect(items(withKids, "context").map((i) => i.title)).toContain("With children and teenagers");
      expect(withKids.concept.reasoning.join(" ")).toContain("no alcohol added because children or teenagers are coming");
    }
  });

  test("a secular gathering leaves out rites; a religious one schedules them first", () => {
    const secular = plan({ occasion: "diwali", observance: "secular", activities: ["ritual"] });
    expect(items(secular, "activities").some((i) => i.detail.startsWith("Ritual"))).toBe(false);
    expect(items(secular, "schedule").map((i) => i.title)).not.toContain("Prayer or rites");
    const religious = plan({ occasion: "diwali", observance: "religious" });
    const schedule = items(religious, "schedule").map((i) => i.title);
    expect(schedule.indexOf("Prayer or rites")).toBeGreaterThan(-1);
    expect(schedule.indexOf("Prayer or rites")).toBeLessThan(schedule.indexOf("The meal"));
    expect(items(religious, "context").map((i) => i.title)).toContain("Keeping the religious rites");
  });

  test("under-fives get a quiet-time block on longer days and a choking-hazard note; over-65s get an access note", () => {
    const toddlers = plan({ ageBands: ["under-5", "adults"], duration: "full-day" });
    expect(items(toddlers, "schedule").map((i) => i.title)).toContain("Quiet time");
    expect(items(toddlers, "context").map((i) => i.title)).toContain("For the under-fives");
    expect(items(plan({ ageBands: ["under-5"], duration: "two-hours" }), "schedule").map((i) => i.title)).not.toContain("Quiet time");
    expect(items(plan({ ageBands: ["over-65"] }), "context").map((i) => i.title)).toContain("For older guests");
  });

  test("budgets still add up exactly with the new options", () => {
    for (const observance of ["religious", "cultural", "secular"] as const) {
      const p = plan({ observance, ageBands: ["under-5", "13-17", "over-65"], budget: 33333.33 });
      expect(sumLines(p.budget.lines)).toBe(p.budget.totalMinor);
    }
  });
});
