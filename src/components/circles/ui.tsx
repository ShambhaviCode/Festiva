"use client";

import type { ReactNode } from "react";
import { directionOf, languageByTag, languageLabel } from "@/domain/languages";
import { formatMoney } from "@/domain/currency";
import type { Preference } from "@/domain/circle/schema";
import { GIFT_CATEGORY_LABELS } from "@/domain/circle/schema";

/** A section of a circle page: heading on the left, content on the right, on wide screens. */
export function Panel({
  title,
  id,
  children,
  aside,
}: {
  title: string;
  id: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="rule border-t py-9" aria-labelledby={id}>
      <div className="grid gap-5 lg:grid-cols-[0.36fr_1fr] lg:gap-12">
        <div>
          <h2 id={id} className="display-3">
            {title}
          </h2>
          {aside && <div className="note mt-2 max-w-xs">{aside}</div>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export function Notice({
  tone = "plain",
  children,
  testId,
}: {
  tone?: "plain" | "warn" | "ok";
  children: ReactNode;
  testId?: string;
}) {
  const colour =
    tone === "warn"
      ? "border-vermilion/50 bg-vermilion/5"
      : tone === "ok"
        ? "border-emerald/40 bg-emerald/5"
        : "rule bg-cream/40";
  return (
    <div
      role={tone === "warn" ? "alert" : "status"}
      data-testid={testId}
      className={`rounded-lg border px-4 py-3 text-[0.95rem] ${colour}`}
    >
      {children}
    </div>
  );
}

/** Text in a person's own language, marked up so browsers and screen readers handle script and direction. */
export function LangText({
  text,
  lang,
  className = "",
  as: Tag = "p",
}: {
  text: string;
  lang: string;
  className?: string;
  as?: "p" | "span" | "blockquote";
}) {
  const direction = directionOf(lang);
  return (
    <Tag
      lang={lang}
      dir={direction === "auto" ? "auto" : direction}
      className={`whitespace-pre-wrap break-words ${className}`}
    >
      {text}
    </Tag>
  );
}

export function LanguageTag({ tag }: { tag: string }) {
  return <span className="note">{languageLabel(tag)}</span>;
}

export function Money({
  minor,
  currency,
}: {
  minor: number;
  currency: string;
}) {
  return (
    <span className="tabular-nums">
      {formatMoney(minor, currency, "en-IN")}
    </span>
  );
}

export function ProviderNote({ children }: { children: ReactNode }) {
  return <p className="note mt-1 text-[0.85rem]">{children}</p>;
}

/** One preference as people see it: the original first, any translation beneath, never merged. */
export function PreferenceCard({
  preference,
  ownerName,
  onDelete,
  deleting,
}: {
  preference: Preference;
  ownerName?: string;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const s = preference.structured;
  const chips = [
    ...s.categories.map((c) => GIFT_CATEGORY_LABELS[c]),
    ...s.likes.map((l) => `Likes ${l}`),
    ...s.materials.map((m) => m),
    ...s.dietary.map((d) => d),
    ...s.avoid.map((a) => `Avoid ${a}`),
  ];
  return (
    <article
      className="rule rounded-xl border bg-[#fffdf7] p-5"
      data-testid="preference-card"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">
          {ownerName
            ? `${ownerName}, ${preference.source === "voice" ? "spoken" : "typed"}`
            : preference.source === "voice"
              ? "Spoken"
              : "Typed"}{" "}
          in{" "}
          {languageByTag.get(preference.original.language)?.name ??
            preference.original.language}
        </p>
        {onDelete && (
          <button
            type="button"
            className="link note"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </header>
      <LangText
        text={preference.original.text}
        lang={preference.original.language}
        className="mt-3 text-lg leading-relaxed"
        as="blockquote"
      />
      {preference.transcript && (
        <ProviderNote>
          Transcribed by Sarvam {preference.transcript.model}
          {preference.transcript.edited
            ? ", then corrected by the participant"
            : ", approved by the participant"}
          .
        </ProviderNote>
      )}
      {preference.translation && (
        <div
          className="rule mt-4 border-t pt-3"
          data-testid="preference-translation"
        >
          <p className="note">
            Translation into{" "}
            {languageByTag.get(preference.translation.language)?.name ??
              preference.translation.language}
          </p>
          <LangText
            text={preference.translation.text}
            lang={preference.translation.language}
            className="mt-1"
          />
          <ProviderNote>
            By Sarvam {preference.translation.model}
            {preference.translation.edited ? ", edited by the participant" : ""}
            . The original above is what they said.
          </ProviderNote>
        </div>
      )}
      {chips.length > 0 && (
        <ul
          className="mt-4 flex flex-wrap gap-2"
          aria-label="Structured details"
        >
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full bg-cream px-3 py-1 text-[0.85rem]"
            >
              {chip}
            </li>
          ))}
        </ul>
      )}
      <ProviderNote>
        Details{" "}
        {preference.structuredBy === "sarvam"
          ? "suggested by Sarvam's model"
          : preference.structuredBy === "rules"
            ? "suggested by FESTIVA's rules"
            : "entered by the participant"}{" "}
        and reviewed before saving.
      </ProviderNote>
    </article>
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters
    .map((p) => Array.from(p)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

/**
 * The circle itself: everyone placed around a ring, the occasion at its centre.
 * Decorative summary of who has joined; the list beside it carries the same information as text.
 */
export function CircleRing({
  names,
  total,
  centre,
  size = 260,
}: {
  names: string[];
  total: number;
  centre: string;
  size?: number;
}) {
  const seats = Math.max(names.length, Math.min(total, 12), 3);
  const r = size / 2 - 26;
  const c = size / 2;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`${names.length} of ${total} places taken`}
      className="max-w-full"
      data-testid="circle-ring"
    >
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.25"
        strokeDasharray="2 5"
      />
      {Array.from({ length: seats }, (_, i) => {
        const angle = (i / seats) * Math.PI * 2 - Math.PI / 2;
        const x = c + r * Math.cos(angle);
        const y = c + r * Math.sin(angle);
        const name = names[i];
        // Keyed by name, so a person who joins while the page is open takes their seat with a small arrival.
        return name ? (
          <g
            key={`seat-${i}-${name}`}
            className="seat-arrive"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <circle
              cx={x}
              cy={y}
              r={19}
              fill={i === 0 ? "var(--color-saffron)" : "var(--color-plum)"}
            />
            <text
              x={x}
              y={y}
              dy="0.35em"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill={i === 0 ? "var(--color-plum-deep)" : "var(--color-ivory)"}
            >
              {initials(name)}
            </text>
          </g>
        ) : (
          <circle
            key={`empty-${i}`}
            cx={x}
            cy={y}
            r={9}
            fill="var(--color-ivory)"
            stroke="var(--color-gold)"
            strokeWidth="1.25"
          />
        );
      })}
      <text
        x={c}
        y={c}
        dy="0.35em"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="21"
        fill="var(--color-charcoal)"
      >
        {centre.length > 18 ? `${centre.slice(0, 17)}…` : centre}
      </text>
    </svg>
  );
}

/**
 * Committed money against the target as one bar: paid outside FESTIVA, then
 * pledged, then what is still open. The figures beside it carry the detail.
 */
export function BudgetMeter({
  targetMinor,
  paidOfflineMinor,
  pledgedMinor,
  currency,
}: {
  targetMinor: number;
  paidOfflineMinor: number;
  pledgedMinor: number;
  currency: string;
}) {
  const committed = paidOfflineMinor + pledgedMinor;
  const scale = Math.max(targetMinor, committed, 1);
  const pct = (v: number) => `${(v / scale) * 100}%`;
  const share =
    targetMinor > 0 ? Math.round((committed / targetMinor) * 100) : 0;
  return (
    <figure className="mb-8" data-testid="budget-meter">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-[family-name:var(--font-display)] text-5xl leading-none">
          {share}%
        </span>
        <span className="note text-right">
          <Money minor={committed} currency={currency} /> of{" "}
          <Money minor={targetMinor} currency={currency} /> committed
        </span>
      </div>
      <div
        className="relative mt-4 h-4 overflow-hidden rounded-full bg-cream"
        role="img"
        aria-label={`${share}% of the target committed: ${formatMoney(paidOfflineMinor, currency, "en-IN")} paid outside FESTIVA and ${formatMoney(pledgedMinor, currency, "en-IN")} pledged.`}
      >
        <div className="meter-grow flex h-full">
          <span
            className="h-full bg-emerald transition-[width] duration-700 ease-[var(--ease-out-soft)]"
            style={{ width: pct(paidOfflineMinor) }}
          />
          <span
            className="h-full bg-saffron transition-[width] duration-700 ease-[var(--ease-out-soft)]"
            style={{ width: pct(pledgedMinor) }}
          />
        </div>
        {committed > targetMinor && (
          <span
            className="absolute inset-y-0 w-0.5 bg-charcoal"
            style={{ left: pct(targetMinor) }}
          />
        )}
      </div>
      <figcaption className="note mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.85rem]">
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full bg-emerald"
            aria-hidden="true"
          />{" "}
          Paid outside FESTIVA
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full bg-saffron"
            aria-hidden="true"
          />{" "}
          Pledged
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block size-2.5 rounded-full border border-gold bg-cream"
            aria-hidden="true"
          />{" "}
          Still open
        </span>
      </figcaption>
    </figure>
  );
}
