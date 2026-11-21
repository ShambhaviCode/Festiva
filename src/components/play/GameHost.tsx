"use client";

import Link from "next/link";
import { GameCover } from "@/components/art/GameCover";
import { useMounted } from "@/lib/hooks";
import { bestScores, useStore } from "@/lib/store";
import { ChallengeGame } from "./ChallengeGame";
import { GAMES, type GameSlug } from "./games";
import { MemoryGame, type MemoryFestival } from "./MemoryGame";
import { PuzzleGame } from "./PuzzleGame";
import { QuizGame } from "./QuizGame";
import { RangoliDesigner } from "./RangoliDesigner";

/** Games use randomness and browser storage, so they start after hydration. */
export function GameHost({
  game,
  festivals,
}: {
  game: GameSlug;
  festivals: MemoryFestival[];
}) {
  const mounted = useMounted();
  if (!mounted)
    return <p className="note">Setting up the game…</p>;
  switch (game) {
    case "memory":
      return <MemoryGame festivals={festivals} />;
    case "quiz":
      return <QuizGame />;
    case "rangoli":
      return <RangoliDesigner />;
    case "challenge":
      return <ChallengeGame />;
    case "puzzle":
      return <PuzzleGame />;
  }
}

export function GameIndex() {
  const [scores] = useStore(bestScores);
  return (
    <ul className="grid gap-x-8 gap-y-12 md:grid-cols-6">
      {GAMES.map((game, index) => (
        <li
          key={game.slug}
          className={index < 2 ? "md:col-span-3" : "md:col-span-2"}
        >
          <Link href={`/play/${game.slug}`} className="group block">
            <span className="block overflow-hidden rounded-2xl">
              <GameCover
                slug={game.slug}
                className="block h-auto w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
              />
            </span>
            <span className="mt-4 flex items-baseline justify-between gap-4">
              <span
                className={`font-[family-name:var(--font-display)] leading-tight group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4 ${index < 2 ? "text-[2rem]" : "text-[1.6rem]"}`}
              >
                {game.title}
              </span>
              <span className="note shrink-0">
                {game.slug === "rangoli"
                  ? "Free play"
                  : scores[game.scoreKey] !== undefined
                    ? `Your best: ${scores[game.scoreKey]}`
                    : "Not played yet"}
              </span>
            </span>
            <span className="mt-1 block max-w-xl text-ink">{game.blurb}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
