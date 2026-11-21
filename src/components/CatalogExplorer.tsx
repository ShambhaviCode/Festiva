"use client";

import Link from "next/link";
import { useId, useMemo, useState, ViewTransition } from "react";
import { normalise } from "@/domain/text";
import { useMounted } from "@/lib/hooks";
import { ArtImage, frameClass, type Art } from "./art/Art";

export interface CatalogItem {
  id: string;
  href: string;
  title: string;
  kicker?: string;
  summary: string;
  /** facet key → values this item matches */
  facets: Record<string, string[]>;
  seed: string;
  palette: [string, string, string];
  /** extra words to match in search */
  keywords?: string;
  /** Which illustration to draw; festivals use the arch rosette by default. */
  art?: Art;
  /** Shared with the detail page hero so the artwork morphs between them. */
  transitionName?: string;
}

export interface Facet {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface Props {
  items: CatalogItem[];
  facets: Facet[];
  searchLabel: string;
  placeholder: string;
  noun: [singular: string, plural: string];
  initial?: Record<string, string>;
  /** Show an interactive year ribbon built from this month facet (values "1"–"12"). */
  timeline?: { facet: string; title: string };
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * The year at a glance: every item drawn as a small dot in the months it
 * usually falls in. Choosing a month filters the grid below; the dots that do
 * not match dim, so you can see where in the year your selection sits.
 */
function YearRibbon({
  items,
  facet,
  title,
  selected,
  onSelect,
  visible,
}: {
  items: CatalogItem[];
  facet: string;
  title: string;
  selected: string;
  onSelect: (month: string) => void;
  visible: Set<string>;
}) {
  const mounted = useMounted();
  const now = mounted ? new Date().getMonth() + 1 : 0;
  return (
    <section
      aria-labelledby="year-ribbon"
      className="mb-12"
      data-testid="year-ribbon"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="year-ribbon" className="display-3">
          {title}
        </h2>
        <p className="note">
          {selected
            ? `Showing ${MONTH_NAMES[Number(selected) - 1]}. Choose it again to see the whole year.`
            : "Choose a month to see what falls in it."}
        </p>
      </div>
      <div
        className="mt-5 grid grid-cols-6 gap-px overflow-hidden rounded-2xl bg-gold/30 sm:grid-cols-12"
        role="group"
        aria-label="Months"
      >
        {MONTHS.map((label, index) => {
          const month = String(index + 1);
          const here = items.filter((item) =>
            (item.facets[facet] ?? []).includes(month),
          );
          const on = selected === month;
          return (
            <button
              key={month}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(on ? "" : month)}
              className={`group relative flex min-h-36 flex-col items-center gap-2 px-1 pb-3 pt-3 transition-colors duration-300 ${on ? "bg-plum text-ivory" : "bg-ivory hover:bg-cream"}`}
            >
              <span
                className={`text-[0.82rem] font-semibold ${now === index + 1 && !on ? "text-saffron-deep" : ""}`}
              >
                {label}
              </span>
              {now === index + 1 && (
                <span
                  className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-b bg-saffron"
                  aria-hidden="true"
                />
              )}
              <span
                className="flex flex-wrap content-start justify-center gap-1.5"
                aria-hidden="true"
              >
                {here.map((item) => (
                  <span
                    key={item.id}
                    title={item.title}
                    className="block h-3.5 w-3.5 rounded-full border-2 transition-opacity duration-300"
                    style={{
                      background: item.palette[1],
                      borderColor: item.palette[0],
                      opacity: visible.has(item.id) ? 1 : 0.22,
                    }}
                  />
                ))}
              </span>
              {/* Accessible name reads "Mar: 7 celebrations", starting with the visible month so voice control matches it. */}
              <span
                className={`mt-auto text-[0.75rem] tabular-nums ${on ? "text-ivory/80" : "text-ink"}`}
              >
                <span className="sr-only">: </span>
                {here.length}
                <span className="sr-only">
                  {here.length === 1 ? " celebration" : " celebrations"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Search-and-filter grid shared by Discover, Journeys, Taste, Wear and Shop. */
export function CatalogExplorer({
  items,
  facets,
  searchLabel,
  placeholder,
  noun,
  initial = {},
  timeline,
}: Props) {
  const [query, setQuery] = useState(initial.q ?? "");
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(facets.map((f) => [f.key, initial[f.key] ?? ""])),
  );
  const searchId = useId();

  const indexed = useMemo(
    () =>
      items.map((item) => ({
        item,
        text: ` ${normalise(`${item.title} ${item.kicker ?? ""} ${item.summary} ${item.keywords ?? ""}`)} `,
      })),
    [items],
  );

  const results = useMemo(() => {
    const tokens = normalise(query).split(" ").filter(Boolean);
    return indexed
      .filter(({ item, text }) => {
        for (const facet of facets) {
          const want = selected[facet.key];
          if (want && !(item.facets[facet.key] ?? []).includes(want))
            return false;
        }
        return tokens.every((token) => text.includes(` ${token}`));
      })
      .map(({ item }) => item);
  }, [indexed, query, selected, facets]);

  const active = query.trim() !== "" || Object.values(selected).some(Boolean);
  const clear = () => {
    setQuery("");
    setSelected(Object.fromEntries(facets.map((f) => [f.key, ""])));
  };

  const visible = useMemo(() => new Set(results.map((r) => r.id)), [results]);

  return (
    <div>
      {timeline && (
        <YearRibbon
          items={items}
          facet={timeline.facet}
          title={timeline.title}
          selected={selected[timeline.facet] ?? ""}
          onSelect={(month) =>
            setSelected((s) => ({ ...s, [timeline.facet]: month }))
          }
          visible={visible}
        />
      )}
      <form
        role="search"
        className="grid gap-5"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor={searchId} className="field-label">
            {searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            className="field max-w-xl"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          {facets.map((facet) =>
            facet.options.length <= 5 ? (
              <fieldset key={facet.key}>
                <legend className="field-label">{facet.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {[{ value: "", label: "All" }, ...facet.options].map(
                    (option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="chip"
                        aria-pressed={selected[facet.key] === option.value}
                        onClick={() =>
                          setSelected((s) => ({
                            ...s,
                            [facet.key]: option.value,
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
            ) : (
              <label key={facet.key} className="grid">
                <span className="field-label">{facet.label}</span>
                <select
                  className="field min-w-44"
                  value={selected[facet.key]}
                  onChange={(e) =>
                    setSelected((s) => ({ ...s, [facet.key]: e.target.value }))
                  }
                >
                  <option value="">All</option>
                  {facet.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ),
          )}
          {active && (
            <button
              type="button"
              className="btn btn-line btn-sm"
              onClick={clear}
            >
              Clear filters
            </button>
          )}
        </div>
      </form>

      <p
        className="note mt-8"
        role="status"
        aria-live="polite"
        data-testid="result-count"
      >
        {results.length} {results.length === 1 ? noun[0] : noun[1]}
        {active ? " match your filters" : ""}
      </p>

      {results.length === 0 ? (
        <div className="rule mt-4 border-t py-12">
          <p className="display-3 font-[family-name:var(--font-display)]">
            Nothing matches those filters.
          </p>
          <p className="mt-2 text-ink">
            FESTIVA&rsquo;s guide is curated and still growing. Try fewer
            filters or a different word.
          </p>
          <button type="button" className="btn btn-plum mt-6" onClick={clear}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul
          className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
          data-testid="catalog-grid"
        >
          {results.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="group block">
                <ViewTransition name={item.transitionName ?? `art-${item.id}`}>
                  <div
                    className={frameClass(
                      (item.art ?? { kind: "rosette" }).kind,
                    )}
                    data-art={(item.art ?? { kind: "rosette" }).kind}
                  >
                    <ArtImage
                      art={item.art ?? { kind: "rosette" }}
                      seed={item.seed}
                      palette={item.palette}
                      className="h-full w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                  </div>
                </ViewTransition>
                <h3 className="mt-4 text-[1.45rem] leading-tight group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                  {item.title}
                </h3>
                {item.kicker && (
                  <p className="mt-1 text-sm font-medium text-saffron-deep">
                    {item.kicker}
                  </p>
                )}
                <p className="note mt-1.5 line-clamp-3">{item.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
