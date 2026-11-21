"use client";

import { useEffect, useMemo, useState } from "react";
import { isSolved, movableIndexes, shuffledBoard, slide } from "@/domain/games";
import { mulberry32, seeded } from "@/domain/random";
import { recordScore } from "@/lib/store";
import { Completion, GameStats } from "./GameShell";

const SIZE = 3;

/** Original rosette artwork as an SVG data URI, used as the picture to reassemble. */
function artwork(seed: string): string {
  const rng = seeded(seed);
  const petals = 10 + Math.floor(rng() * 4) * 2;
  let shapes = "";
  [
    [140, "#f0a030"],
    [100, "#dcc898"],
    [62, "#b93626"],
  ].forEach(([radius, fill], ring) => {
    for (let i = 0; i < petals; i += 1) {
      const angle = (360 / petals) * i + (ring % 2 ? 180 / petals : 0);
      shapes += `<ellipse cx="150" cy="${150 - Number(radius) * 0.78}" rx="${Number(radius) * 0.11}" ry="${Number(radius) * 0.26}" fill="${fill}" transform="rotate(${angle} 150 150)"/>`;
    }
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#33143a"/><circle cx="150" cy="150" r="146" fill="none" stroke="#dcc898" stroke-width="2"/>${shapes}<circle cx="150" cy="150" r="14" fill="#fbf6ea"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function PuzzleGame() {
  const [seed, setSeed] = useState(() => Date.now());
  const [board, setBoard] = useState<number[]>(() => shuffledBoard(SIZE, mulberry32(seed)));
  const [moves, setMoves] = useState(0);
  const solved = isSolved(board);
  const score = Math.max(0, 1000 - moves * 5);
  const image = useMemo(() => artwork(String(seed)), [seed]);

  useEffect(() => {
    if (solved && moves > 0) recordScore("puzzle", score);
  }, [solved, moves, score]);

  const reset = () => {
    const next = seed + 1;
    setSeed(next);
    setBoard(shuffledBoard(SIZE, mulberry32(next)));
    setMoves(0);
  };

  const move = (index: number) => {
    if (solved) return;
    const next = slide(board, SIZE, index);
    if (next !== board) {
      setBoard(next);
      setMoves((m) => m + 1);
    }
  };

  const onKey = (event: React.KeyboardEvent) => {
    const empty = board.indexOf(0);
    const target = { ArrowUp: empty + SIZE, ArrowDown: empty - SIZE, ArrowLeft: empty % SIZE < SIZE - 1 ? empty + 1 : -1, ArrowRight: empty % SIZE > 0 ? empty - 1 : -1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    if (target >= 0 && target < board.length) move(target);
  };

  const movable = movableIndexes(board, SIZE);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <GameStats game="puzzle" items={[["Moves", moves], ["Score", solved && moves > 0 ? score : "–"]]} />
        <button type="button" className="btn btn-line" onClick={reset} data-testid="game-reset">
          Shuffle again
        </button>
      </div>
      {solved && moves > 0 && (
        <Completion title={`Solved in ${moves} moves.`} onReset={reset}>
          <p>Score {score}.</p>
        </Completion>
      )}
      <div
        className="grid aspect-square w-full max-w-md grid-cols-3 gap-1.5 rounded-2xl bg-plum-deep p-1.5"
        role="group"
        aria-label="Sliding puzzle. Use the arrow keys or select a tile next to the gap."
        onKeyDown={onKey}
        data-testid="puzzle-board"
        data-board={board.join(",")}
      >
        {board.map((value, index) =>
          value === 0 ? (
            <div key="gap" aria-hidden="true" className="rounded-lg bg-plum/60" />
          ) : (
            <button
              key={value}
              type="button"
              onClick={() => move(index)}
              aria-label={`Tile ${value}${movable.includes(index) ? ", can move" : ""}`}
              data-tile={value}
              data-movable={movable.includes(index) ? "true" : "false"}
              className="relative rounded-lg transition-transform duration-150 hover:brightness-110"
              style={{
                backgroundImage: image,
                backgroundSize: `${SIZE * 100}% ${SIZE * 100}%`,
                backgroundPosition: `${(((value - 1) % SIZE) / (SIZE - 1)) * 100}% ${(Math.floor((value - 1) / SIZE) / (SIZE - 1)) * 100}%`,
              }}
            >
              <span className="absolute left-1.5 top-1 rounded bg-plum-deep/80 px-1.5 text-sm font-semibold text-ivory">{value}</span>
            </button>
          ),
        )}
      </div>
      <p className="note max-w-xl">Slide the tiles to restore the rosette, with tile 1 at the top left and the gap at the bottom right. Every shuffle can be solved. Score starts at 1,000 and drops 5 for each move.</p>
    </div>
  );
}
