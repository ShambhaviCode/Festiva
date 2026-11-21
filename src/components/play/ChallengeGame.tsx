"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildStatements, challengeScore, type Statement } from "@/domain/games";
import { mulberry32 } from "@/domain/random";
import { recordScore } from "@/lib/store";
import { Completion, GameStats } from "./GameShell";

const SECONDS = 60;

export function ChallengeGame() {
  const [seed, setSeed] = useState(() => Date.now());
  const [statements, setStatements] = useState<Statement[]>(() => buildStatements(mulberry32(seed)));
  const [results, setResults] = useState<boolean[]>([]);
  const [left, setLeft] = useState(SECONDS);
  const [running, setRunning] = useState(false);
  const index = results.length;
  const finished = left === 0 || index >= statements.length;
  const score = challengeScore(results);
  const streak = results.length - (results.lastIndexOf(false) + 1);

  useEffect(() => {
    if (!running || finished) return;
    const timer = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, finished]);

  useEffect(() => {
    if (finished && running) recordScore("challenge", score);
  }, [finished, running, score]);

  const reset = () => {
    const next = seed + 1;
    setSeed(next);
    setStatements(buildStatements(mulberry32(next)));
    setResults([]);
    setLeft(SECONDS);
    setRunning(false);
  };

  const answer = (value: boolean) => {
    if (finished) return;
    setResults((r) => [...r, value === statements[index].truth]);
  };
  const last = index > 0 ? { statement: statements[index - 1], correct: results[index - 1] } : null;

  return (
    <div className="grid max-w-3xl gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <GameStats game="challenge" items={[["Time left", `${left}s`], ["Answered", index], ["Streak", streak], ["Score", score]]} />
        <button type="button" className="btn btn-line" onClick={reset} data-testid="game-reset">
          Reset
        </button>
      </div>
      {!running ? (
        <div>
          <p className="max-w-xl text-ink">You have {SECONDS} seconds. Decide whether each statement about a festival is true or false. One point for each correct answer, two once you are on a streak of three.</p>
          <button type="button" className="btn btn-saffron mt-5" onClick={() => setRunning(true)} data-testid="challenge-start">
            Start the challenge
          </button>
        </div>
      ) : finished ? (
        <Completion title={`Time. You scored ${score}.`} onReset={reset}>
          <p>
            {results.filter(Boolean).length} correct out of {index} answered.
          </p>
        </Completion>
      ) : (
        <section aria-label="Current statement">
          <p className="display-3 font-[family-name:var(--font-display)]" data-testid="challenge-statement" data-truth={statements[index].truth ? "true" : "false"}>
            {statements[index].text}
          </p>
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn btn-plum min-w-28" onClick={() => answer(true)} data-testid="challenge-true">
              True
            </button>
            <button type="button" className="btn btn-line min-w-28" onClick={() => answer(false)} data-testid="challenge-false">
              False
            </button>
          </div>
        </section>
      )}
      <p className="min-h-12 text-ink" aria-live="polite">
        {running && last && (
          <>
            <span className="font-semibold">{last.correct ? "Correct." : "Not this time."}</span> {last.statement.explanation}{" "}
            <Link href={`/discover/${last.statement.festival}`} className="link link-accent">
              Guide
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
