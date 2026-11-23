"use client";

import { PageSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { BudgetInsights, OrganiserView } from "@/domain/circle/engine";
import { languageByTag } from "@/domain/languages";
import { api, ApiError, forgetCircle } from "@/lib/client/circles";
import { CultureBlock, Suggestions, Wishlist } from "./CircleParts";
import {
  CircleRing,
  Money,
  Notice,
  Panel,
  PreferenceCard,
  BudgetMeter,
} from "./ui";
import { useCircle } from "./useCircle";
import { confirmAction } from "@/lib/confirm";

function Invite({
  circle,
  circleKey,
  invite,
  onChange,
}: {
  circle: OrganiserView;
  circleKey: string;
  invite: { expiresAt: string; revokedAt: string | null } | null;
  onChange: () => void;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const active =
    invite && !invite.revokedAt && Date.parse(invite.expiresAt) > now;

  async function create() {
    setError(null);
    try {
      const result = await api<{ path: string }>(
        `/api/circles/${circle.id}/invite`,
        { method: "POST", key: circleKey },
      );
      setLink(`${window.location.origin}${result.path}`);
      setCopied(false);
      onChange();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "The link could not be created.",
      );
    }
  }

  return (
    <div className="grid gap-4" data-testid="invite-panel">
      {link ? (
        <div className="grid gap-3">
          <label htmlFor="invite-link" className="field-label">
            Send this link to the people you want in the circle
          </label>
          <input
            id="invite-link"
            className="field font-mono text-[0.85rem]"
            readOnly
            value={link}
            data-testid="invite-link"
            onFocus={(e) => e.target.select()}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-saffron btn-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                } catch {
                  setError(
                    "Copying is blocked here. Select the link and copy it yourself.",
                  );
                }
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                type="button"
                className="btn btn-line btn-sm"
                onClick={() =>
                  navigator
                    .share({
                      title: circle.name,
                      text: `Join our ${circle.occasion.label} gift circle on FESTIVA`,
                      url: link,
                    })
                    .catch(() => undefined)
                }
              >
                Share
              </button>
            )}
          </div>
          <p className="note text-[0.85rem]">
            This is the only time the link is shown. It works until{" "}
            {new Date(invite?.expiresAt ?? now).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
            })}
            .
          </p>
        </div>
      ) : active ? (
        <p>
          An invitation link is active until{" "}
          {new Date(invite!.expiresAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
          })}
          . For safety it is shown only once; make a new one to see it again.
        </p>
      ) : (
        <p>
          {invite?.revokedAt
            ? "The last invitation link was revoked."
            : "No one can join until you create an invitation link."}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-plum btn-sm"
          onClick={create}
          data-testid="create-invite"
        >
          {active || link
            ? "Make a new link (the old one stops working)"
            : "Create invitation link"}
        </button>
        {(active || link) && (
          <button
            type="button"
            className="btn btn-line btn-sm"
            onClick={async () => {
              await api(`/api/circles/${circle.id}/invite`, {
                method: "DELETE",
                key: circleKey,
              });
              setLink(null);
              onChange();
            }}
          >
            Revoke the link
          </button>
        )}
      </div>
      {error && <Notice tone="warn">{error}</Notice>}
    </div>
  );
}

function Insights({ insights }: { insights: BudgetInsights }) {
  const c = insights.currency;
  const rows: [string, React.ReactNode][] = [
    ["Target", <Money key="t" minor={insights.targetMinor} currency={c} />],
    [
      "Committed so far",
      <Money key="c" minor={insights.committedMinor} currency={c} />,
    ],
    [
      "Of which paid outside FESTIVA",
      <Money key="p" minor={insights.paidOfflineMinor} currency={c} />,
    ],
    [
      insights.gapMinor >= 0 ? "Still to raise" : "Committed beyond the target",
      <Money key="g" minor={Math.abs(insights.gapMinor)} currency={c} />,
    ],
    [
      "Even share per person",
      <Money key="e" minor={insights.evenShareMinor} currency={c} />,
    ],
    ["People who have not committed yet", insights.notYetPledged],
  ];
  return (
    <div data-testid="budget-insights">
      <BudgetMeter
        targetMinor={insights.targetMinor}
        paidOfflineMinor={insights.paidOfflineMinor}
        pledgedMinor={insights.pledgedMinor}
        currency={c}
      />
      <dl className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="rule flex items-baseline justify-between gap-4 border-b pb-2"
          >
            <dt className="note">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4">
        {insights.deadlinePassed
          ? `The contribution deadline passed ${Math.abs(insights.daysToDeadline)} day(s) ago.`
          : insights.daysToDeadline === 0
            ? "Contributions are due today."
            : `${insights.daysToDeadline} day(s) until the contribution deadline.`}
        {insights.wishlistOverPerPerson.length > 0 &&
          ` ${insights.wishlistOverPerPerson.length} wishlist item(s) are above the per-gift budget.`}
      </p>
      <p className="note mt-2 text-[0.85rem]">
        Calculated by FESTIVA in whole{" "}
        {c === "JPY" || c === "KRW" ? "units" : "paise or cents"}, so shares
        always add up to the target. These are commitments people recorded;
        FESTIVA does not handle money.
      </p>
    </div>
  );
}

export function OrganiserHome({ circleId }: { circleId: string }) {
  const router = useRouter();
  const { mounted, entry, key, data, error, reload } = useCircle(
    circleId,
    "organiser",
  );
  const [forId, setForId] = useState<string | null>(null);
  const [santaError, setSantaError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const role = entry?.role;
  useEffect(() => {
    if (role === "participant") router.replace(`/circles/${circleId}/me`);
  }, [role, router, circleId]);

  if (!mounted) return <PageSkeleton label="Loading…" />;
  if (!entry || !key) {
    return (
      <div className="py-6">
        <h1 className="display-2">
          This browser does not hold a key for that circle.
        </h1>
        <p className="lede mt-4 max-w-xl">
          Circles are opened with a private key saved in the browser that
          created or joined them.
        </p>
        <Link href="/circles" className="btn btn-line mt-6">
          Back to Gift Circle
        </Link>
      </div>
    );
  }
  if (entry.role === "participant")
    return <PageSkeleton label="Opening your view of the circle…" />;
  if (error && !data) return <Notice tone="warn">{error.message}</Notice>;
  if (!data || data.role !== "organiser")
    return <PageSkeleton label="Loading the circle…" />;

  const circle = data.circle;
  const caps = data.capabilities;
  const names = Object.fromEntries(
    circle.participants.map((p) => [p.id, p.name]),
  );
  const selected = forId ?? circle.participants[0]?.id;
  const days = Math.round(
    (Date.parse(`${circle.celebrationDate}T00:00:00`) - now) / 86_400_000,
  );

  return (
    <div>
      <header className="grid items-center gap-8 pb-10 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="note">You organise</p>
          <h1 className="display-1 mt-2" data-testid="organiser-circle-name">
            {circle.name}
          </h1>
          <p className="lede mt-3">
            {circle.occasion.label} on{" "}
            {new Date(`${circle.celebrationDate}T00:00:00`).toLocaleDateString(
              "en-IN",
              { weekday: "long", day: "numeric", month: "long" },
            )}
            {days > 0
              ? `, in ${days} day${days === 1 ? "" : "s"}`
              : days === 0
                ? ", today"
                : ""}
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/circles/${circleId}/me`} className="btn btn-saffron">
              Add your own preferences
            </Link>
            <Link
              href={`/circles/${circleId}/summary`}
              className="btn btn-line"
            >
              See the summary
            </Link>
          </div>
        </div>
        <CircleRing
          names={circle.participants.map((p) => p.name)}
          total={circle.maxParticipants}
          centre={circle.occasion.label}
        />
      </header>

      <Panel
        title="Invite"
        id="invite"
        aside={`${circle.participants.length} of ${circle.maxParticipants} places taken.`}
      >
        <Invite
          circle={circle}
          circleKey={key}
          invite={data.invite}
          onChange={reload}
        />
      </Panel>

      <Panel title="People" id="people">
        <ul data-testid="participants">
          {circle.participants.map((p) => (
            <li
              key={p.id}
              className="rule flex flex-wrap items-baseline justify-between gap-3 border-t py-3 first:border-t-0"
            >
              <span>
                <span className="font-semibold">{p.name}</span>
                <span className="note">
                  {p.role === "organiser" ? ", organiser" : ""},{" "}
                  {languageByTag.get(p.language)?.nativeName ?? p.language}
                </span>
              </span>
              <span className="flex items-baseline gap-4">
                <span className="note">
                  {
                    circle.preferences.filter((x) => x.participantId === p.id)
                      .length
                  }{" "}
                  preference(s),{" "}
                  {
                    circle.wishlist.filter((x) => x.participantId === p.id)
                      .length
                  }{" "}
                  wish(es)
                </span>
                {p.role !== "organiser" && (
                  <button
                    type="button"
                    className="link note"
                    onClick={async () => {
                      if (!(await confirmAction({ title: `Remove ${p.name}?`, body: "Everything they added to this circle is deleted.", confirmLabel: "Remove", tone: "danger" }))) return;
                      await api(
                        `/api/circles/${circleId}/participants/${p.id}`,
                        { method: "DELETE", key },
                      );
                      await reload();
                    }}
                  >
                    Remove
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Preferences"
        id="preferences"
        aside="Each person's own words come first. Translations are shown beneath them, labelled."
      >
        {circle.preferences.length === 0 ? (
          <p className="note">
            No preferences yet. They appear here as people add them.
          </p>
        ) : (
          <div
            className="grid gap-5 xl:grid-cols-2"
            data-testid="all-preferences"
          >
            {circle.preferences.map((p) => (
              <PreferenceCard
                key={p.id}
                preference={p}
                ownerName={names[p.participantId]}
                onDelete={async () => {
                  await api(`/api/circles/${circleId}/preferences/${p.id}`, {
                    method: "DELETE",
                    key,
                  });
                  await reload();
                }}
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Wishlists" id="wishlists">
        <Wishlist
          items={circle.wishlist}
          currency={circle.currency}
          perPersonBudgetMinor={circle.perPersonBudgetMinor}
          circleId={circleId}
          circleKey={key}
          editable={false}
          onChange={reload}
          names={names}
        />
      </Panel>

      {caps.recommendations && (
        <Panel
          title="Gift ideas"
          id="ideas"
          aside={caps.premiumGifting ? "Includes Elite-tier ideas." : undefined}
        >
          <div
            className="mb-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Ideas for"
          >
            {circle.participants.map((p) => (
              <button
                key={p.id}
                type="button"
                className="chip"
                aria-pressed={selected === p.id}
                onClick={() => setForId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
          {selected && (
            <Suggestions
              circleId={circleId}
              circleKey={key}
              forId={selected}
              refreshKey={`${circle.updatedAt}`}
            />
          )}
        </Panel>
      )}

      <Panel title="Budget" id="budget">
        {data.insights ? (
          <Insights insights={data.insights} />
        ) : (
          <p className="note">Budget insights are switched off.</p>
        )}
        <ul className="mt-6" data-testid="contributions">
          {circle.participants.map((p) => {
            const c = circle.contributions.find(
              (x) => x.participantId === p.id,
            );
            return (
              <li
                key={p.id}
                className="rule flex justify-between gap-4 border-t py-2 first:border-t-0"
              >
                <span>{p.name}</span>
                <span className={c ? "" : "note"}>
                  {c ? (
                    <>
                      <Money minor={c.amountMinor} currency={circle.currency} />{" "}
                      {c.status === "paid-offline"
                        ? "paid outside FESTIVA"
                        : "committed"}
                    </>
                  ) : (
                    "Nothing recorded"
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title="Secret Santa"
        id="secret-santa"
        aside="FESTIVA draws a single loop, so everyone gives once and receives once. Not even you can see who drew whom."
      >
        {!caps.secretSanta ? (
          <p className="note" data-testid="santa-off">
            Secret Santa is switched off right now.
          </p>
        ) : (
          <div data-testid="santa-panel">
            {circle.assignments ? (
              <p>
                Names were drawn on{" "}
                {new Date(circle.assignments.generatedAt).toLocaleString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}{" "}
                for {circle.assignments.count} people. Each person sees only
                their own match.
              </p>
            ) : (
              <p>
                {circle.participants.length < 3
                  ? `You need at least three people; ${circle.participants.length} so far.`
                  : "Ready to draw when everyone has joined."}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-plum btn-sm"
                disabled={circle.participants.length < 3}
                data-testid="draw-names"
                onClick={async () => {
                  setSantaError(null);
                  if (circle.assignments && !(await confirmAction({ title: "Draw names again?", body: "Everyone's match will change.", confirmLabel: "Draw again" }))) return;
                  try {
                    await api(`/api/circles/${circleId}/secret-santa`, {
                      method: "POST",
                      key,
                    });
                    await reload();
                  } catch (err) {
                    setSantaError(
                      err instanceof ApiError
                        ? err.message
                        : "Names could not be drawn.",
                    );
                  }
                }}
              >
                {circle.assignments ? "Draw again" : "Draw names"}
              </button>
              {circle.assignments && (
                <button
                  type="button"
                  className="btn btn-line btn-sm"
                  onClick={async () => {
                    await api(`/api/circles/${circleId}/secret-santa`, {
                      method: "DELETE",
                      key,
                    });
                    await reload();
                  }}
                >
                  Clear the draw
                </button>
              )}
            </div>
            {santaError && (
              <div className="mt-3">
                <Notice tone="warn">{santaError}</Notice>
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel title="About the festival" id="culture">
        <CultureBlock
          culture={data.culture}
          aiAvailable={caps.aiCulture}
          circleId={circleId}
          circleKey={key}
        />
      </Panel>

      <Panel title="Delete" id="delete">
        <p className="max-w-xl">
          Deleting removes the circle and everything in it for everyone,
          straight away.
        </p>
        <button
          type="button"
          className="btn btn-line mt-4"
          onClick={async () => {
            if (!(await confirmAction({ title: "Delete this circle for everyone?", body: "This cannot be undone.", confirmLabel: "Delete circle", tone: "danger" }))) return;
            await api(`/api/circles/${circleId}`, { method: "DELETE", key });
            forgetCircle(circleId);
            router.push("/circles");
          }}
        >
          Delete the circle
        </button>
      </Panel>
    </div>
  );
}
