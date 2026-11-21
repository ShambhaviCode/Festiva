"use client";

import { PageSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import type { ParticipantView } from "@/domain/circle/engine";
import { currencyDigits, fromMinor } from "@/domain/currency";
import { languageByTag } from "@/domain/languages";
import { api, ApiError, forgetCircle } from "@/lib/client/circles";
import { CultureBlock, Suggestions, Wishlist } from "./CircleParts";
import { PreferenceComposer } from "./PreferenceComposer";
import { Money, Notice, Panel, PreferenceCard } from "./ui";
import { useCircle, type Capabilities } from "./useCircle";
import { createLocalStore, toggleIn, useStore } from "@/lib/store";

function Contribution({
  view,
  circleKey,
  onSaved,
}: {
  view: ParticipantView;
  circleKey: string;
  onSaved: () => void;
}) {
  const current = view.myContribution;
  const [amount, setAmount] = useState(
    current ? String(fromMinor(current.amountMinor, view.currency)) : "",
  );
  const [status, setStatus] = useState<"pledged" | "paid-offline">(
    current?.status ?? "pledged",
  );
  const [message, setMessage] = useState<{
    tone: "ok" | "warn";
    text: string;
  } | null>(null);

  async function save(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount.replace(/,/g, "") || "0");
    const decimals = amount.split(".")[1]?.length ?? 0;
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      decimals > currencyDigits(view.currency)
    ) {
      setMessage({ tone: "warn", text: "Enter the amount as a number." });
      return;
    }
    try {
      await api(`/api/circles/${view.id}/contribution`, {
        method: "PUT",
        key: circleKey,
        body: JSON.stringify({ amount: value, status }),
      });
      setMessage({
        tone: "ok",
        text:
          value === 0
            ? "Your commitment was cleared."
            : "Your commitment is recorded.",
      });
      onSaved();
    } catch (err) {
      setMessage({
        tone: "warn",
        text: err instanceof ApiError ? err.message : "It could not be saved.",
      });
    }
  }

  return (
    <form
      onSubmit={save}
      className="grid max-w-xl gap-4"
      data-testid="contribution-form"
    >
      <div>
        <label htmlFor="pledge" className="field-label">
          How much will you put in ({view.currency})?
        </label>
        <input
          id="pledge"
          inputMode="decimal"
          className="field max-w-xs"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <fieldset>
        <legend className="field-label">Status</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="chip"
            aria-pressed={status === "pledged"}
            onClick={() => setStatus("pledged")}
          >
            I will contribute this
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={status === "paid-offline"}
            onClick={() => setStatus("paid-offline")}
          >
            I have paid it outside FESTIVA
          </button>
        </div>
      </fieldset>
      <p className="note text-[0.85rem]">
        FESTIVA records what you say you will contribute. It does not take, hold
        or check payments; settle up the way your group usually does.
      </p>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <button type="submit" className="btn btn-line justify-self-start">
        Save my commitment
      </button>
    </form>
  );
}

/** Which Secret Santa matches this browser has already unwrapped, so the reveal happens once. */
const unwrapped = createLocalStore<string[]>(
  "festiva:circle-unwrapped",
  [],
  (v): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string"),
);

function GiftBox() {
  return (
    <svg
      viewBox="0 0 220 200"
      className="h-auto w-40 sm:w-48"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="28"
        y="84"
        width="164"
        height="108"
        rx="6"
        fill="var(--color-plum)"
      />
      <rect x="98" y="84" width="24" height="108" fill="var(--color-saffron)" />
      <g className="gift-lid">
        <rect
          x="18"
          y="58"
          width="184"
          height="32"
          rx="6"
          fill="var(--color-plum-deep)"
        />
        <rect
          x="98"
          y="58"
          width="24"
          height="32"
          fill="var(--color-saffron)"
        />
        <path d="M110 58 C 84 22, 52 36, 72 56 Z" fill="var(--color-gold)" />
        <path d="M110 58 C 136 22, 168 36, 148 56 Z" fill="var(--color-gold)" />
        <circle cx="110" cy="56" r="8" fill="var(--color-saffron-deep)" />
      </g>
    </svg>
  );
}

/** The match stays wrapped until the person chooses to look, so nobody reads it over their shoulder. */
function GiftReveal({
  revealKey,
  receiverName,
  children,
}: {
  revealKey: string;
  receiverName: string;
  children: ReactNode;
}) {
  const [opened] = useStore(unwrapped);
  const [justOpened, setJustOpened] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  if (!opened.includes(revealKey)) {
    return (
      <div
        className="grid items-center gap-6 rounded-2xl bg-cream/60 p-6 sm:grid-cols-[auto_1fr] sm:p-8"
        data-testid="santa-gift"
      >
        <GiftBox />
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl leading-tight">
            Your match is wrapped.
          </p>
          <p className="note mt-2 max-w-md">
            Open it when nobody is looking over your shoulder. Only you can see
            who you are giving to.
          </p>
          <button
            type="button"
            className="btn btn-plum mt-5"
            onClick={() => {
              setJustOpened(true);
              toggleIn(unwrapped, revealKey);
              requestAnimationFrame(() => target.current?.focus());
            }}
          >
            Unwrap your match
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={target}
      tabIndex={-1}
      className="relative scroll-mt-24 outline-none"
      aria-label={`Your Secret Santa match: ${receiverName}`}
    >
      {justOpened && (
        <div
          className="gift-lid-off pointer-events-none absolute -top-4 right-0 z-10 hidden sm:block"
          aria-hidden="true"
        >
          <svg viewBox="0 0 220 80" className="w-40">
            <rect
              x="18"
              y="18"
              width="184"
              height="32"
              rx="6"
              fill="var(--color-plum-deep)"
            />
            <rect
              x="98"
              y="18"
              width="24"
              height="32"
              fill="var(--color-saffron)"
            />
            <path
              d="M110 18 C 84 -18, 52 -4, 72 16 Z"
              fill="var(--color-gold)"
            />
            <path
              d="M110 18 C 136 -18, 168 -4, 148 16 Z"
              fill="var(--color-gold)"
            />
          </svg>
        </div>
      )}
      <div className={justOpened ? "gift-card-rise" : undefined}>
        {children}
      </div>
    </div>
  );
}

function Recipient({
  view,
  circleKey,
  capabilities,
}: {
  view: ParticipantView;
  circleKey: string;
  capabilities: Capabilities;
}) {
  if (!capabilities.secretSanta)
    return (
      <p className="note">
        Secret Santa is switched off for this circle right now.
      </p>
    );
  if (!view.myAssignment)
    return (
      <p className="note">
        {view.assignmentsGenerated
          ? "Your Secret Santa draw is not available."
          : "The organiser has not drawn names yet. You will see who you are giving to here."}
      </p>
    );
  const { receiver, preferences, wishlist } = view.myAssignment;
  return (
    <GiftReveal
      revealKey={`${view.id}:${view.myAssignment.receiver.id}`}
      receiverName={receiver.name}
    >
      <div className="grid gap-6" data-testid="my-recipient">
        <p className="font-[family-name:var(--font-display)] text-3xl">
          You are giving to{" "}
          <span className="text-saffron-deep">{receiver.name}</span>.
        </p>
        <p className="note">
          Only you can see this. {receiver.name} prefers{" "}
          {languageByTag.get(receiver.language)?.name ?? receiver.language}.
        </p>
        {preferences.length === 0 ? (
          <p className="note">
            {receiver.name} has not shared any preferences yet.
          </p>
        ) : (
          preferences.map((p) => <PreferenceCard key={p.id} preference={p} />)
        )}
        <div>
          <h3 className="font-semibold">Their wishlist</h3>
          <div className="mt-2">
            <Wishlist
              items={wishlist}
              currency={view.currency}
              perPersonBudgetMinor={view.perPersonBudgetMinor}
              circleId={view.id}
              circleKey={circleKey}
              editable={false}
              onChange={() => undefined}
            />
          </div>
        </div>
        {capabilities.recommendations && (
          <div>
            <h3 className="font-semibold">Ideas for {receiver.name}</h3>
            <div className="mt-2">
              <Suggestions
                circleId={view.id}
                circleKey={circleKey}
                forId={receiver.id}
                refreshKey={String(preferences.length)}
              />
            </div>
          </div>
        )}
      </div>
    </GiftReveal>
  );
}

export function ParticipantHome({ circleId }: { circleId: string }) {
  const router = useRouter();
  const { mounted, entry, key, data, error, reload } = useCircle(
    circleId,
    "participant",
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!mounted) return <PageSkeleton label="Loading…" />;
  if (!entry || !key) {
    return (
      <div className="py-6">
        <h1 className="display-2">This browser is not part of that circle.</h1>
        <p className="lede mt-4 max-w-xl">
          Open the invitation link the organiser sent you, in the browser you
          want to use.
        </p>
      </div>
    );
  }
  if (error && !data) return <Notice tone="warn">{error.message}</Notice>;
  if (!data || data.role !== "participant")
    return <PageSkeleton label="Loading your circle…" />;
  const view = data.circle;
  const caps = data.capabilities;

  return (
    <div>
      <header className="pb-8">
        {data.organiser && (
          <Link href={`/circles/${circleId}`} className="link note">
            Back to the organiser view
          </Link>
        )}
        <h1 className="display-1 mt-3" data-testid="participant-circle-name">
          {view.name}
        </h1>
        <p className="lede mt-3">
          {view.occasion.label} on{" "}
          {new Date(`${view.celebrationDate}T00:00:00`).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "long" },
          )}
          . You are {view.me.name}. {view.participants.length} people have
          joined.
        </p>
      </header>

      <Panel
        title="Your preferences"
        id="prefs"
        aside="Tell the circle what you would love to receive. Speak or type in your own language."
      >
        <div className="grid gap-5">
          {view.myPreferences.map((p) => (
            <PreferenceCard
              key={p.id}
              preference={p}
              deleting={deleting === p.id}
              onDelete={async () => {
                setDeleting(p.id);
                try {
                  await api(`/api/circles/${circleId}/preferences/${p.id}`, {
                    method: "DELETE",
                    key,
                  });
                  await reload();
                } finally {
                  setDeleting(null);
                }
              }}
            />
          ))}
          <PreferenceComposer
            circleId={circleId}
            circleKey={key}
            myLanguage={view.me.language}
            organiserLanguage={view.organiserLanguage}
            capabilities={caps}
            onSaved={reload}
          />
        </div>
      </Panel>

      <Panel
        title="Your wishlist"
        id="wishlist"
        aside={
          view.perPersonBudgetMinor !== null ? (
            <>
              The circle&rsquo;s per-gift budget is{" "}
              <Money
                minor={view.perPersonBudgetMinor}
                currency={view.currency}
              />
              .
            </>
          ) : undefined
        }
      >
        <Wishlist
          items={view.myWishlist}
          currency={view.currency}
          perPersonBudgetMinor={view.perPersonBudgetMinor}
          circleId={circleId}
          circleKey={key}
          editable
          onChange={reload}
        />
      </Panel>

      <Panel title="Your Secret Santa" id="santa">
        <Recipient view={view} circleKey={key} capabilities={caps} />
      </Panel>

      <Panel
        title="Your contribution"
        id="contribution"
        aside={
          <>
            The circle is raising{" "}
            <Money minor={view.totalBudgetMinor} currency={view.currency} /> by{" "}
            {view.contributionDeadline}.
          </>
        }
      >
        <Contribution view={view} circleKey={key} onSaved={reload} />
      </Panel>

      <Panel title="About the festival" id="culture">
        <CultureBlock
          culture={data.culture}
          aiAvailable={caps.aiCulture}
          circleId={circleId}
          circleKey={key}
        />
      </Panel>

      {!data.organiser && (
        <Panel title="Leave" id="leave">
          <p className="max-w-xl">
            Leaving removes your preferences, wishlist and contribution from
            this circle.
          </p>
          <button
            type="button"
            className="btn btn-line mt-4"
            onClick={async () => {
              if (
                !window.confirm("Leave this circle and delete what you added?")
              )
                return;
              await api(`/api/circles/${circleId}/participants/${view.me.id}`, {
                method: "DELETE",
                key,
              });
              forgetCircle(circleId);
              router.push("/circles");
            }}
          >
            Leave the circle
          </button>
        </Panel>
      )}
    </div>
  );
}
