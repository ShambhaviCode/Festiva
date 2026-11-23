import { normalise, search } from "@/domain/search";
import { buildStatements, challengeScore, createMemoryDeck, isSolved, memoryScore, movableIndexes, prepareQuiz, quizScore, shuffledBoard, slide, solvedBoard, symmetryPoints } from "@/domain/games";
import { composeWish, wrapText } from "@/domain/wishes";
import { detectTopic, findFestival, groundedAnswer } from "@/domain/intelligence";
import { hashString, mulberry32, seeded, slugify } from "@/domain/random";
import { QUIZ_QUESTIONS } from "@/data/quiz";
import { festivalBySlug } from "@/data/festivals";
import { countryByCode } from "@/data/countries";

describe("search", () => {
  test("is diacritic-insensitive and requires every token", () => {
    expect(normalise("Tết Trung Thu")).toBe("tet trung thu");
    expect(search("tet")[0].title).toBe("Lunar New Year");
    expect(search("dia de muertos")[0].title).toBe("Día de Muertos");
    expect(search("festival lights india").some((d) => d.title === "Diwali")).toBe(true);
    expect(search("zzzzqq")).toHaveLength(0);
    expect(search("   ")).toHaveLength(0);
  });
  test("can be limited by type and finds across modules", () => {
    expect(search("kyoto", { types: ["destination"] })[0].href).toBe("/journeys/kyoto");
    expect(search("panettone", { types: ["food"] })[0].href).toBe("/taste/panettone");
    expect(search("korean", { types: ["artist"] }).map((d) => d.title)).toEqual(expect.arrayContaining(["BTS", "IU"]));
    expect(search("sabyasachi", { types: ["brand"] })).toHaveLength(1);
  });
});

describe("games", () => {
  test("memory deck holds each pair exactly twice and scoring never goes negative", () => {
    const deck = createMemoryDeck([{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }], mulberry32(1));
    expect(deck).toHaveLength(6);
    for (const id of ["a", "b", "c"]) expect(deck.filter((c) => c.pairId === id)).toHaveLength(2);
    expect(memoryScore(8, 8)).toBe(800);
    expect(memoryScore(8, 12)).toBe(760);
    expect(memoryScore(2, 500)).toBe(0);
  });

  test("quiz keeps the right answer after shuffling options", () => {
    const quiz = prepareQuiz(8, mulberry32(7));
    expect(quiz).toHaveLength(8);
    for (const q of quiz) {
      const original = QUIZ_QUESTIONS.find((o) => o.id === q.id)!;
      expect(q.options[q.answer]).toBe(original.options[original.answer]);
    }
    expect(quizScore(quiz.map((q) => q.answer), quiz)).toBe(8);
    expect(quizScore(quiz.map(() => null), quiz)).toBe(0);
  });

  test("knowledge challenge statements are true exactly when they name a home country", () => {
    const statements = buildStatements(mulberry32(3));
    expect(statements.length).toBeGreaterThan(15);
    for (const s of statements) {
      const festival = festivalBySlug.get(s.festival)!;
      const named = festival.countries.some((code) => s.text.includes(countryByCode.get(code)!.name));
      expect(named).toBe(s.truth);
    }
    expect(challengeScore([true, true, true, true, false, true])).toBe(1 + 1 + 2 + 2 + 0 + 1);
  });

  test("tile puzzle shuffles are solvable by construction and moves are legal", () => {
    const solved = solvedBoard(3);
    expect(isSolved(solved)).toBe(true);
    expect(movableIndexes(solved, 3).sort()).toEqual([5, 7]);
    expect(slide(solved, 3, 0)).toBe(solved); // illegal move leaves the board untouched
    const board = shuffledBoard(3, mulberry32(11));
    expect(isSolved(board)).toBe(false);
    expect([...board].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const moved = slide(solved, 3, 5);
    expect(isSolved(slide(moved, 3, 8))).toBe(true);
  });

  test("rangoli symmetry produces the expected number of mirrored points", () => {
    expect(symmetryPoints(10, 0, 0, 0, 8, false)).toHaveLength(8);
    const pts = symmetryPoints(10, 0, 0, 0, 4, true);
    expect(pts).toHaveLength(8);
    for (const [x, y] of pts) expect(Math.hypot(x, y)).toBeCloseTo(10, 6);
  });
});

describe("wishes", () => {
  test("composes in each language and falls back when the name is empty", () => {
    expect(composeWish({ festival: "Diwali", recipient: "Asha", language: "English", tone: "warm" })).toBe(
      "Dear Asha, wishing you a Diwali filled with light, good food and the people you love.",
    );
    expect(composeWish({ festival: "Diwali", recipient: "Asha", language: "Hindi", tone: "formal" })).toContain("Asha");
    expect(composeWish({ festival: "Eid", recipient: " ", language: "English", tone: "playful" })).toMatch(/^friend!/);
    expect(composeWish({ festival: "Navidad", recipient: "Luz", language: "Spanish", tone: "playful" })).toBe("¡Luz! ¡Feliz Navidad! Que sobren los dulces y falten las preocupaciones.");
  });
  test("wraps text to a width", () => {
    const lines = wrapText("one two three four five", 9, (s) => s.length);
    expect(lines).toEqual(["one two", "three", "four five"]);
    expect(wrapText("a\nb", 10, (s) => s.length)).toEqual(["a", "b"]);
  });
});

describe("intelligence (grounded, no AI provider)", () => {
  const now = new Date("2026-11-16T10:00:00Z");
  test("finds the festival and topic in a natural question", () => {
    expect(findFestival("When is Diwali next year?")?.slug).toBe("diwali");
    expect(findFestival("tell me about the day of the dead")?.slug).toBe("dia-de-muertos");
    expect(findFestival("what is the weather")).toBeUndefined();
    expect(detectTopic("When is Diwali?")).toBe("date");
    expect(detectTopic("What should I wear to Onam?")).toBe("attire");
    expect(detectTopic("what do people eat at hanukkah")).toBe("food");
  });
  test("answers a date question from checked data, with its certainty and source", () => {
    const a = groundedAnswer("When is Diwali?", now);
    expect(a.facts[0].text).toContain("29 October 2027");
    expect(a.facts[0].text).toContain("Checked against published calendars");
    expect(a.sources[0].url).toMatch(/^https:\/\/en\.wikipedia\.org/);
  });
  test("flags projected dates as projections", () => {
    expect(groundedAnswer("when is eid al-fitr", now).facts[0].text).toContain("Projected");
  });
  test("refuses to guess when nothing matches", () => {
    const a = groundedAnswer("who won the football last night", now);
    expect(a.facts).toHaveLength(0);
    expect(a.answer).toMatch(/could not find/);
    expect(a.sources).toHaveLength(0);
  });
  test("generic title words alone do not match, but full festival names do", () => {
    expect(groundedAnswer("any plans for tomorrow night or the weekend show", now).facts).toHaveLength(0);
    expect(groundedAnswer("Tell me about Kupala Night", now).facts.map((f) => f.href)).toContain("/discover/kupala-night");
  });
  test("food answers come from the Taste dataset", () => {
    const a = groundedAnswer("What do people eat at Hanukkah?", now);
    expect(a.facts.map((f) => f.href)).toEqual(expect.arrayContaining(["/taste/latkes", "/taste/sufganiyot"]));
  });
});

describe("random helpers", () => {
  test("are stable", () => {
    expect(hashString("festiva")).toBe(hashString("festiva"));
    expect(seeded("a")()).toBe(seeded("a")());
    expect(seeded("a")()).not.toBe(seeded("b")());
    expect(slugify("Día de Muertos!")).toBe("dia-de-muertos");
  });
});
