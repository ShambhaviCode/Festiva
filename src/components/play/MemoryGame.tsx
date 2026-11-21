"use client";

import { useEffect, useState } from "react";
import { Motif } from "@/components/Motif";
import { createMemoryDeck, memoryScore, type MemoryCard } from "@/domain/games";
import { mulberry32, shuffle } from "@/domain/random";
import { recordScore } from "@/lib/store";
import { Completion, GameStats } from "./GameShell";

export interface MemoryFestival {
  slug: string;
  name: string;
  palette: [string, string, string];
}

const PAIRS = 8;

function deal(festivals: MemoryFestival[], seed: number): MemoryCard[] {
  const rng = mulberry32(seed);
  const chosen = shuffle(festivals, rng).slice(0, PAIRS);
  return createMemoryDeck(chosen.map((f) => ({ id: f.slug, label: f.name })), rng);
}

export function MemoryGame({ festivals }: { festivals: MemoryFestival[] }) {
  const [seed, setSeed] = useState(() => Date.now());
  const [deck, setDeck] = useState<MemoryCard[]>(() => deal(festivals, seed));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const byId = new Map(festivals.map((f) => [f.slug, f]));
  const done = matched.length === PAIRS;
  const score = memoryScore(PAIRS, moves);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((id) => deck[id]);
    const isMatch = a.pairId === b.pairId;
    const timer = window.setTimeout(
      () => {
        if (isMatch) setMatched((m) => [...m, a.pairId]);
        setOpen([]);
      },
      isMatch ? 350 : 900,
    );
    return () => window.clearTimeout(timer);
  }, [open, deck]);

  useEffect(() => {
    if (done) recordScore("memory", score);
  }, [done, score]);

  const reset = () => {
    const next = seed + 1;
    setSeed(next);
    setDeck(deal(festivals, next));
    setOpen([]);
    setMatched([]);
    setMoves(0);
  };

  const flip = (card: MemoryCard) => {
    if (open.length === 2 || open.includes(card.id) || matched.includes(card.pairId)) return;
    const next = [...open, card.id];
    setOpen(next);
    if (next.length === 2) setMoves((m) => m + 1);
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <GameStats game="memory" items={[["Moves", moves], ["Pairs found", `${matched.length} / ${PAIRS}`], ["Score", done ? score : "–"]]} />
        <button type="button" className="btn btn-line" onClick={reset} data-testid="game-reset">
          New game
        </button>
      </div>
      {done && (
        <Completion title={`All pairs found in ${moves} moves.`} onReset={reset}>
          <p>Score {score}. The fewest possible is {PAIRS} moves.</p>
        </Completion>
      )}
      <ul className="grid max-w-2xl grid-cols-4 gap-2.5 sm:gap-4" aria-label="Memory cards" data-testid="memory-grid">
        {deck.map((card, index) => {
          const faceUp = open.includes(card.id) || matched.includes(card.pairId);
          const festival = byId.get(card.pairId)!;
          return (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => flip(card)}
                aria-label={faceUp ? `${card.label}${matched.includes(card.pairId) ? ", matched" : ""}` : `Card ${index + 1}, face down`}
                aria-pressed={faceUp}
                disabled={matched.includes(card.pairId)}
                data-pair={card.pairId}
                data-face={faceUp ? "up" : "down"}
                className="arch relative block aspect-[4/5] w-full bg-plum transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-80"
              >
                {faceUp ? (
                  <>
                    <Motif seed={festival.slug} palette={festival.palette} className="absolute inset-0 h-full w-full" />
                    <span className="absolute inset-x-0 bottom-0 bg-plum-deep/85 px-1 py-1.5 text-center text-[0.7rem] font-semibold leading-tight text-ivory sm:text-sm">{card.label}</span>
                  </>
                ) : (
                  <span aria-hidden="true" className="absolute inset-0 grid place-items-center font-[family-name:var(--font-display)] text-3xl text-gold-soft">
                    F
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="note">Turn over two cards at a time to find matching festivals. 100 points per pair, less 10 for every extra move.</p>
    </div>
  );
}
