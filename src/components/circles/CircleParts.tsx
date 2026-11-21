"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  GIFT_CATEGORIES,
  GIFT_CATEGORY_LABELS,
  type WishlistItem,
} from "@/domain/circle/schema";
import type { VerifiedContext } from "@/domain/circle/culture";
import type { Suggestion } from "@/domain/circle/suggestions";
import { api, ApiError } from "@/lib/client/circles";
import { Money, Notice, ProviderNote } from "./ui";

/** Wishlist items with an add form. Figures are whatever the person entered; FESTIVA supplies no prices. */
export function Wishlist({
  items,
  currency,
  perPersonBudgetMinor,
  circleId,
  circleKey,
  editable,
  onChange,
  names,
}: {
  items: WishlistItem[];
  currency: string;
  perPersonBudgetMinor: number | null;
  circleId: string;
  circleKey: string;
  editable: boolean;
  onChange: () => void;
  names?: Record<string, string>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [estimate, setEstimate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const value = estimate.trim() ? Number(estimate.replace(/,/g, "")) : null;
      if (value !== null && (!Number.isFinite(value) || value < 0))
        throw new ApiError(
          400,
          "invalid",
          "Enter the estimate as a number, or leave it empty.",
        );
      await api(`/api/circles/${circleId}/wishlist`, {
        method: "POST",
        key: circleKey,
        body: JSON.stringify({
          title: title.trim(),
          category: category || null,
          note: note.trim(),
          link: link.trim() || null,
          estimate: value,
          origin: "manual",
        }),
      });
      setTitle("");
      setNote("");
      setLink("");
      setEstimate("");
      setCategory("");
      onChange();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "That item could not be added.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      await api(`/api/circles/${circleId}/wishlist/${id}`, {
        method: "DELETE",
        key: circleKey,
      });
      onChange();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "That item could not be removed.",
      );
    }
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="note">Nothing on this wishlist yet.</p>
      ) : (
        <ul data-testid="wishlist">
          {items.map((item) => {
            const over =
              perPersonBudgetMinor !== null &&
              item.estimateMinor !== null &&
              item.estimateMinor > perPersonBudgetMinor;
            return (
              <li
                key={item.id}
                className="rule flex flex-wrap items-baseline justify-between gap-3 border-t py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold" dir="auto">
                    {item.title}
                    {names?.[item.participantId] ? (
                      <span className="note font-normal">
                        , for {names[item.participantId]}
                      </span>
                    ) : null}
                  </p>
                  <p className="note">
                    {[
                      item.category
                        ? GIFT_CATEGORY_LABELS[item.category]
                        : null,
                      item.note || null,
                    ]
                      .filter(Boolean)
                      .join(". ")}
                    {item.link && (
                      <>
                        {" "}
                        <a
                          href={item.link}
                          className="link"
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                        >
                          Open link
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-baseline gap-4">
                  {item.estimateMinor !== null && (
                    <span
                      className={over ? "font-semibold text-vermilion" : ""}
                    >
                      About{" "}
                      <Money minor={item.estimateMinor} currency={currency} />
                      {over ? ", above the per-gift budget" : ""}
                    </span>
                  )}
                  {editable && (
                    <button
                      type="button"
                      className="link note"
                      onClick={() => remove(item.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editable && (
        <form
          onSubmit={add}
          className="mt-6 grid gap-4 sm:grid-cols-2"
          data-testid="wishlist-form"
        >
          <div className="sm:col-span-2">
            <label htmlFor="w-title" className="field-label">
              Add something you would like
            </label>
            <input
              id="w-title"
              className="field"
              maxLength={100}
              dir="auto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A block-printed cotton stole"
            />
          </div>
          <div>
            <label htmlFor="w-category" className="field-label">
              Kind of gift
            </label>
            <select
              id="w-category"
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Not specified</option>
              {GIFT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {GIFT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="w-estimate" className="field-label">
              Rough cost, if you know it ({currency})
            </label>
            <input
              id="w-estimate"
              inputMode="decimal"
              className="field"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="w-note" className="field-label">
              Note
            </label>
            <input
              id="w-note"
              className="field"
              maxLength={280}
              dir="auto"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Colour, size, where to find it"
            />
          </div>
          <div>
            <label htmlFor="w-link" className="field-label">
              Link (https only)
            </label>
            <input
              id="w-link"
              type="url"
              className="field"
              maxLength={500}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
            />
          </div>
          {error && (
            <div className="sm:col-span-2">
              <Notice tone="warn">{error}</Notice>
            </div>
          )}
          <button
            type="submit"
            className="btn btn-line justify-self-start"
            disabled={busy || !title.trim()}
          >
            Add to wishlist
          </button>
        </form>
      )}
    </div>
  );
}

/** Gift ideas for one person, each with the reasons it was chosen. */
export function Suggestions({
  circleId,
  circleKey,
  forId,
  refreshKey,
  onAdd,
}: {
  circleId: string;
  circleKey: string;
  forId: string;
  refreshKey: string;
  onAdd?: (s: Suggestion) => void;
}) {
  const [data, setData] = useState<{
    suggestions: Suggestion[];
    basedOn: number;
    notice: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    api<{ suggestions: Suggestion[]; basedOn: number; notice: string }>(
      `/api/circles/${circleId}/suggestions?for=${forId}`,
      { key: circleKey },
    )
      .then((d) => !cancelled && (setData(d), setError(null)))
      .catch(
        (err) =>
          !cancelled &&
          setError(
            err instanceof ApiError
              ? err.message
              : "Suggestions could not be loaded.",
          ),
      );
    return () => {
      cancelled = true;
    };
  }, [circleId, circleKey, forId, refreshKey]);
  if (error) return <p className="note">{error}</p>;
  if (!data) return <p className="note">Finding ideas…</p>;
  return (
    <div data-testid="suggestions">
      <p className="note">
        {data.basedOn === 0
          ? "No preferences yet, so these are general ideas."
          : `Based on ${data.basedOn} preference${data.basedOn === 1 ? "" : "s"}.`}
      </p>
      <ul className="mt-3 grid gap-4 md:grid-cols-2">
        {data.suggestions.map((s) => (
          <li key={s.slug} className="rule rounded-xl border p-4">
            <p className="font-semibold">{s.title}</p>
            <p className="note mt-1">{s.note}</p>
            <ul className="mt-2 list-disc pl-5 text-[0.9rem]">
              {s.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {s.brands.length > 0 && (
              <p className="note mt-2 text-[0.85rem]">
                Browse:{" "}
                {s.brands.map((b, i) => (
                  <span key={b.url}>
                    {i > 0 && ", "}
                    <a
                      href={b.url}
                      className="link"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {b.name}
                    </a>
                  </span>
                ))}
              </p>
            )}
            {onAdd && (
              <button
                type="button"
                className="link note mt-2"
                onClick={() => onAdd(s)}
              >
                Add to my wishlist
              </button>
            )}
          </li>
        ))}
      </ul>
      <ProviderNote>{data.notice}</ProviderNote>
    </div>
  );
}

/** Festival context from FESTIVA's guide, then (separately, and labelled) any AI suggestions. */
export function CultureBlock({
  culture,
  aiAvailable,
  circleId,
  circleKey,
}: {
  culture: VerifiedContext | null;
  aiAvailable: boolean;
  circleId: string;
  circleKey: string;
}) {
  const [ai, setAi] = useState<{
    suggestions: { kind: string; text: string }[];
    label: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!culture)
    return (
      <p className="note">
        This circle is for an occasion outside FESTIVA&rsquo;s festival guide,
        so there is no cultural background to show.
      </p>
    );
  return (
    <div className="grid gap-6">
      <div data-testid="verified-culture">
        <p className="font-semibold">
          {culture.festival.name}: {culture.festival.tagline.toLowerCase()}
        </p>
        {culture.giftCustoms.length > 0 && (
          <>
            <p className="note mt-3">Gift customs</p>
            <ul className="mt-1 list-disc pl-5">
              {culture.giftCustoms.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </>
        )}
        <p className="note mt-3">Etiquette</p>
        <ul className="mt-1 list-disc pl-5">
          {culture.etiquette.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        {culture.greetings.length > 0 && (
          <p className="mt-3">
            Greetings:{" "}
            {culture.greetings
              .map(
                (g) =>
                  `${g.text} (${g.language}${g.meaning ? `, "${g.meaning}"` : ""})`,
              )
              .join("; ")}
            .
          </p>
        )}
        <ProviderNote>
          From FESTIVA&rsquo;s guide
          {culture.verification === "reference"
            ? ", written from reference sources and not individually audited"
            : ""}
          . Source:{" "}
          {culture.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && ", "}
              <a
                href={s.url}
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.title}
              </a>
            </span>
          ))}
          . Customs vary by family and region.
        </ProviderNote>
      </div>
      {aiAvailable && (
        <div
          className="rule rounded-xl border border-dashed p-5"
          data-testid="ai-culture"
        >
          <p className="font-semibold">AI suggestions</p>
          {ai ? (
            <>
              <ul className="mt-2 list-disc pl-5" dir="auto">
                {ai.suggestions.map((s) => (
                  <li key={s.text}>{s.text}</li>
                ))}
              </ul>
              <ProviderNote>{ai.label}</ProviderNote>
            </>
          ) : (
            <>
              <p className="note mt-1">
                Sarvam can suggest gift ideas and greeting wording based on the
                guide above, in your language. They are suggestions, not facts.
              </p>
              <button
                type="button"
                className="btn btn-line btn-sm mt-3"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    setAi(
                      await api(`/api/circles/${circleId}/cultural`, {
                        method: "POST",
                        key: circleKey,
                      }),
                    );
                  } catch (err) {
                    setError(
                      err instanceof ApiError
                        ? err.message
                        : "Suggestions could not be generated.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Asking Sarvam…" : "Ask for suggestions"}
              </button>
            </>
          )}
          {error && <p className="note mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
