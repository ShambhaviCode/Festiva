"use client";

import { useState } from "react";

const QUICK = ["Diwali", "Kerala", "Japan", "Harvest", "Lanterns", "Carnival"];

/** The homepage's search box. It opens FESTIVA's global search with the words already typed. */
export function HeroSearch() {
  const [q, setQ] = useState("");
  const open = (query: string) => window.dispatchEvent(new CustomEvent("festiva:search", { detail: { query } }));
  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); open(q); }}
        className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[0_18px_40px_-20px_rgba(23,8,51,0.55)] ring-1 ring-charcoal/10 focus-within:ring-2 focus-within:ring-saffron"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-saffron-deep"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <label htmlFor="hero-search" className="sr-only">Search festivals, countries, states and food</label>
        <input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a festival, country, Indian state or dish"
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-charcoal outline-none placeholder:text-ink/70"
          data-testid="hero-search"
        />
        <button type="submit" className="btn btn-saffron btn-sm shrink-0">Search</button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="note">Try</span>
        {QUICK.map((s) => (
          <button key={s} type="button" onClick={() => open(s)} className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold text-plum transition-colors hover:bg-marigold">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
