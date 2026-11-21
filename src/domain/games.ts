import { festivals } from "@/data/festivals";
import { countries } from "@/data/countries";
import { QUIZ_QUESTIONS, type QuizQuestion } from "@/data/quiz";
import { shuffle, type Rng } from "./random";

/* ----------------------------- Memory match ----------------------------- */

export interface MemoryCard {
  id: number;
  pairId: string;
  label: string;
}

export function createMemoryDeck(pairs: { id: string; label: string }[], rng: Rng): MemoryCard[] {
  const doubled = pairs.flatMap((p) => [p, p]);
  return shuffle(doubled, rng).map((p, index) => ({ id: index, pairId: p.id, label: p.label }));
}

/** 100 points per pair, minus 10 for every move beyond the minimum. Never below zero. */
export function memoryScore(pairs: number, moves: number): number {
  return Math.max(0, pairs * 100 - Math.max(0, moves - pairs) * 10);
}

/* ------------------------------ Culture quiz ----------------------------- */

export interface PreparedQuestion extends Omit<QuizQuestion, "answer"> {
  /** Index of the correct option after shuffling. */
  answer: number;
}

export function prepareQuiz(count: number, rng: Rng, pool: QuizQuestion[] = QUIZ_QUESTIONS): PreparedQuestion[] {
  return shuffle(pool, rng)
    .slice(0, count)
    .map((q) => {
      const correct = q.options[q.answer];
      const options = shuffle(q.options, rng);
      return { ...q, options, answer: options.indexOf(correct) };
    });
}

export function quizScore(answers: (number | null)[], questions: PreparedQuestion[]): number {
  return questions.reduce((score, q, i) => score + (answers[i] === q.answer ? 1 : 0), 0);
}

/* -------------------------- Knowledge challenge -------------------------- */

export interface Statement {
  text: string;
  truth: boolean;
  explanation: string;
  festival: string;
}

/** True/false statements generated from the festival guide, so they stay in step with the data. */
export function buildStatements(rng: Rng): Statement[] {
  const statements: Statement[] = [];
  for (const festival of festivals) {
    if (festival.countries.length > 4) continue; // too widely celebrated for a fair country question
    const home = countries.find((c) => c.code === festival.countries[0]);
    if (!home) continue;
    // A festival named after its own country ("Trinidad and Tobago Carnival") would give the answer away.
    if (festival.countries.some((code) => festival.name.includes(countries.find((c) => c.code === code)?.name ?? "\u0000"))) continue;
    const others = countries.filter((c) => !festival.countries.includes(c.code) && c.region !== festival.region);
    const truth = rng() < 0.5;
    const shown = truth ? home : others[Math.floor(rng() * others.length)];
    statements.push({
      text: `${festival.name} is most closely associated with ${shown.name}.`,
      truth,
      explanation: `${festival.name}: ${festival.tagline.toLowerCase()}, associated with ${home.name}.`,
      festival: festival.slug,
    });
  }
  return shuffle(statements, rng);
}

/** One point per correct answer, with a bonus point for each answer in a streak of three or more. */
export function challengeScore(results: boolean[]): number {
  let score = 0;
  let streak = 0;
  for (const correct of results) {
    streak = correct ? streak + 1 : 0;
    if (correct) score += streak >= 3 ? 2 : 1;
  }
  return score;
}

/* ------------------------------ Tile puzzle ------------------------------ */

/** Board is a flat array; value 0 is the empty tile; solved = [1, 2, …, n*n-1, 0]. */
export function solvedBoard(size: number): number[] {
  return Array.from({ length: size * size }, (_, i) => (i === size * size - 1 ? 0 : i + 1));
}

export function isSolved(board: number[]): boolean {
  return board.every((value, i) => (i === board.length - 1 ? value === 0 : value === i + 1));
}

export function movableIndexes(board: number[], size: number): number[] {
  const empty = board.indexOf(0);
  const row = Math.floor(empty / size);
  const col = empty % size;
  const out: number[] = [];
  if (row > 0) out.push(empty - size);
  if (row < size - 1) out.push(empty + size);
  if (col > 0) out.push(empty - 1);
  if (col < size - 1) out.push(empty + 1);
  return out;
}

/** Slide the tile at `index` into the empty space, if it is adjacent. Returns the same array when the move is illegal. */
export function slide(board: number[], size: number, index: number): number[] {
  if (!movableIndexes(board, size).includes(index)) return board;
  const next = [...board];
  const empty = board.indexOf(0);
  [next[empty], next[index]] = [next[index], next[empty]];
  return next;
}

/** Shuffle by making random legal moves from the solved state, which guarantees the puzzle can be solved. */
export function shuffledBoard(size: number, rng: Rng, moves = 120): number[] {
  let board = solvedBoard(size);
  let previous = -1;
  for (let i = 0; i < moves; i += 1) {
    const options = movableIndexes(board, size).filter((idx) => idx !== previous);
    const pick = options[Math.floor(rng() * options.length)];
    previous = board.indexOf(0);
    board = slide(board, size, pick);
  }
  return isSolved(board) ? slide(board, size, movableIndexes(board, size)[0]) : board;
}

/* -------------------------------- Rangoli -------------------------------- */

/** Reflect and rotate a point around the centre to produce radial symmetry. */
export function symmetryPoints(x: number, y: number, cx: number, cy: number, folds: number, mirror: boolean): [number, number][] {
  const dx = x - cx;
  const dy = y - cy;
  const radius = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const points: [number, number][] = [];
  for (let i = 0; i < folds; i += 1) {
    const turn = (2 * Math.PI * i) / folds;
    points.push([cx + radius * Math.cos(angle + turn), cy + radius * Math.sin(angle + turn)]);
    if (mirror) points.push([cx + radius * Math.cos(-angle + turn), cy + radius * Math.sin(-angle + turn)]);
  }
  return points;
}
