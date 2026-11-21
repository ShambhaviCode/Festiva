"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { prepareQuiz, quizScore, type PreparedQuestion } from "@/domain/games";
import { mulberry32 } from "@/domain/random";
import { recordScore } from "@/lib/store";
import { Completion, GameStats } from "./GameShell";

const LENGTH = 8;

export function QuizGame() {
  const [seed, setSeed] = useState(() => Date.now());
  const [questions, setQuestions] = useState<PreparedQuestion[]>(() => prepareQuiz(LENGTH, mulberry32(seed)));
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(LENGTH).fill(null));
  const [index, setIndex] = useState(0);
  const question = questions[index];
  const chosen = answers[index];
  const score = quizScore(answers, questions);
  const done = index >= LENGTH;

  useEffect(() => {
    if (done) recordScore("quiz", score);
  }, [done, score]);

  const reset = () => {
    const next = seed + 1;
    setSeed(next);
    setQuestions(prepareQuiz(LENGTH, mulberry32(next)));
    setAnswers(Array(LENGTH).fill(null));
    setIndex(0);
  };

  return (
    <div className="grid max-w-3xl gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <GameStats game="quiz" items={[["Question", done ? `${LENGTH} / ${LENGTH}` : `${index + 1} / ${LENGTH}`], ["Score", score]]} />
        <button type="button" className="btn btn-line" onClick={reset} data-testid="game-reset">
          Start again
        </button>
      </div>
      {done ? (
        <Completion title={`You scored ${score} out of ${LENGTH}.`} onReset={reset}>
          <p>{score === LENGTH ? "A perfect round." : score >= 5 ? "Well travelled." : "Every answer links to a festival guide if you would like to read more."}</p>
        </Completion>
      ) : (
        <section aria-labelledby="quiz-question">
          <h2 id="quiz-question" className="display-3" data-testid="quiz-question">
            {question.prompt}
          </h2>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2" role="group" aria-label="Answers">
            {question.options.map((option, i) => {
              const answered = chosen !== null;
              const correct = i === question.answer;
              const state = !answered ? "" : correct ? "!border-emerald !bg-emerald !text-ivory" : i === chosen ? "!border-vermilion !bg-vermilion !text-ivory" : "opacity-60";
              return (
                <button
                  key={option}
                  type="button"
                  className={`chip min-h-12 justify-start !rounded-xl px-4 text-left ${state}`}
                  disabled={answered}
                  data-correct={correct ? "true" : "false"}
                  onClick={() => setAnswers((a) => a.map((v, j) => (j === index ? i : v)))}
                >
                  {option}
                  {answered && correct && <span className="sr-only-focusable"> (correct answer)</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-5 min-h-28" aria-live="polite">
            {chosen !== null && (
              <>
                <p className="font-semibold" data-testid="quiz-feedback">
                  {chosen === question.answer ? "Correct." : `Not quite. The answer is ${question.options[question.answer]}.`}
                </p>
                <p className="mt-1 text-ink">
                  {question.explanation}{" "}
                  <Link href={`/discover/${question.festival}`} className="link link-accent">
                    Read the guide
                  </Link>
                </p>
                <button type="button" className="btn btn-plum mt-4" onClick={() => setIndex(index + 1)} data-testid="quiz-next">
                  {index === LENGTH - 1 ? "See my score" : "Next question"}
                </button>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
