"use client";

import type { ReactNode } from "react";
import { bestScores, useStore } from "@/lib/store";

export function GameStats({ game, items }: { game: string; items: [label: string, value: string | number][] }) {
  const [scores] = useStore(bestScores);
  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-2" data-testid="game-stats">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="note">{label}</dt>
          <dd className="font-[family-name:var(--font-display)] text-3xl tabular-nums" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
            {value}
          </dd>
        </div>
      ))}
      <div>
        <dt className="note">Your best</dt>
        <dd className="font-[family-name:var(--font-display)] text-3xl tabular-nums" data-testid="stat-best">
          {scores[game] ?? "–"}
        </dd>
      </div>
    </dl>
  );
}

export function Completion({ title, children, onReset, resetLabel = "Play again" }: { title: string; children?: ReactNode; onReset: () => void; resetLabel?: string }) {
  return (
    <div className="on-dark rounded-[1.5rem] bg-emerald-deep p-7 text-ivory" role="status" data-testid="game-complete">
      <p className="font-[family-name:var(--font-display)] text-3xl">{title}</p>
      {children && <div className="mt-2 text-ivory/90">{children}</div>}
      <button type="button" className="btn btn-saffron mt-5" onClick={onReset}>
        {resetLabel}
      </button>
    </div>
  );
}
