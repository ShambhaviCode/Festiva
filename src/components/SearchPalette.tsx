"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { rank, type Scorable } from "@/domain/search-score";
import { useFocusTrap } from "@/lib/client/focus-trap";

interface Searchable extends Scorable { type: string; summary: string; href: string }

const TYPE_LABEL: Record<string, string> = { festival: "Festival", country: "Country", region: "State / UT", food: "Food", attire: "Attire", destination: "Place", brand: "Brand", artist: "Artist", genre: "Genre" };
const TYPE_COLOUR: Record<string, string> = {
  festival: "bg-saffron text-plum-deep", country: "bg-turquoise/20 text-plum", region: "bg-jade/20 text-emerald-deep",
  food: "bg-coral/20 text-vermilion", attire: "bg-pink/15 text-pink", destination: "bg-marigold/30 text-saffron-deep",
  brand: "bg-plum/10 text-plum", artist: "bg-plum/10 text-plum", genre: "bg-plum/10 text-plum",
};
const SUGGESTIONS = ["Diwali", "India", "Karnataka", "Japan", "Lantern", "Harvest", "Kerala", "Carnival"];
const RECENT_KEY = "festiva.search.recent";

let indexPromise: Promise<Searchable[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/api/search-index").then((r) => {
    if (!r.ok) throw new Error(`search index ${r.status}`);
    return r.json() as Promise<Searchable[]>;
  }).catch((e) => { indexPromise = null; throw e; });
  return indexPromise;
}
function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5); } catch { return []; }
}
function remember(q: string) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...readRecent().filter((r) => r !== q)].slice(0, 5))); } catch { /* storage unavailable */ }
}

/** Global search: festivals, countries, India's states and UTs, food, attire and places. */
export function SearchPalette({ onClose, initialQuery = "" }: { onClose: () => void; initialQuery?: string }) {
  const router = useRouter();
  const [index, setIndex] = useState<Searchable[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQueryRaw] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const [recent] = useState<string[]>(readRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const listId = useId();
  const setQuery = (q: string) => { setQueryRaw(q); setActive(0); };

  // Mounted only while open (the header renders it on demand), so this runs once per opening.
  useEffect(() => {
    loadIndex().then(setIndex, () => setFailed(true));
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  const results = useMemo(() => (index && query.trim() ? rank(index, query, 12) : []), [index, query]);

  const go = useCallback((entry: Searchable) => {
    remember(query.trim() || entry.title);
    onClose();
    router.push(entry.href);
    // Pages that are already open (the world map) hear about in-page destinations directly.
    window.dispatchEvent(new CustomEvent("festiva:navigate", { detail: { href: entry.href } }));
  }, [onClose, query, router]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]); }
  };

  return (
    <div className="backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-plum-deep/55 backdrop-blur-sm sm:items-start sm:px-3 sm:pt-[9vh]" onMouseDown={(e) => e.target === e.currentTarget && onClose()} data-testid="search-palette">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search FESTIVA" className="palette-in flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-ivory pb-[env(safe-area-inset-bottom)] text-charcoal shadow-[0_40px_90px_-30px_rgba(23,8,51,0.7)] sm:rounded-3xl sm:pb-0" onKeyDown={onKey}>
        <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-charcoal/15 sm:hidden" />
        <div className="flex items-center gap-3 border-b border-charcoal/10 px-5">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-saffron-deep"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search festivals, countries, Indian states, food…"
            className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-ink/70"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            data-testid="search-input"
          />
          {query && <button type="button" className="note shrink-0 font-semibold" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>Clear</button>}
          <kbd className="hidden shrink-0 rounded-md border border-charcoal/20 px-1.5 py-0.5 text-xs text-ink sm:block">Esc</kbd>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:max-h-[60vh]">
          {failed && <p className="p-4 text-vermilion" role="alert">Search could not load. Check your connection and try again.</p>}
          {!failed && !index && query && <p className="note p-4">Loading the search index…</p>}
          {query.trim() && index && results.length === 0 && (
            <p className="p-4 text-ink" data-testid="search-empty">No match for &ldquo;{query}&rdquo;. Try a festival, a country, an Indian state or a dish.</p>
          )}
          {results.length > 0 && (
            <ul id={listId} role="listbox" aria-label="Results" data-testid="search-results">
              {results.map((r, i) => (
                <li key={r.href + r.title} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(r)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-cream" : ""}`}>
                    <span className={`pill-tag shrink-0 ${TYPE_COLOUR[r.type] ?? "bg-cream"}`}>{TYPE_LABEL[r.type] ?? r.type}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{r.title}</span>
                      <span className="note block truncate">{r.summary}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!query.trim() && (
            <div className="p-3">
              {recent.length > 0 && (
                <>
                  <p className="eyebrow mb-2">Recent</p>
                  <div className="mb-4 flex flex-wrap gap-2">{recent.map((r) => <button key={r} type="button" className="chip" onClick={() => setQuery(r)}>{r}</button>)}</div>
                </>
              )}
              <p className="eyebrow mb-2">Try</p>
              <div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <button key={s} type="button" className="chip" onClick={() => setQuery(s)}>{s}</button>)}</div>
            </div>
          )}
        </div>
        <p className="note border-t border-charcoal/10 px-5 py-2.5">↑ ↓ to move · Enter to open · Esc to close</p>
      </div>
    </div>
  );
}
