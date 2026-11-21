import Link from "next/link";
import { Globe } from "@/components/Globe";
import { ViewTransition } from "react";
import { Motif } from "@/components/Motif";
import { UpcomingList } from "@/components/Upcoming";
import { festivalBySlug, festivals } from "@/data/festivals";
import { BUDGET_LABELS } from "@/domain/budget";
import { formatMoney } from "@/domain/currency";
import { generatePlan } from "@/domain/matchmaker/engine";
import { DEFAULT_INPUT } from "@/domain/matchmaker/schema";
import { NAV, site } from "@/lib/site";
import { datedFestivals, placeLine, SAMPLE_NOW } from "@/lib/view";

const MARKERS = festivals.map((f) => ({ lat: f.lat, lon: f.lon }));
const EDITORIAL = [
  "lunar-new-year",
  "dia-de-muertos",
  "nowruz",
  "timkat",
  "midsummer",
  "matariki",
];

const JOURNEY = [
  {
    step: "Discover",
    href: "/discover",
    text: "Find a festival by country, month or kind.",
  },
  {
    step: "Learn",
    href: "/intelligence",
    text: "Ask what it means and where it began.",
  },
  {
    step: "Explore",
    href: "/journeys",
    text: "See the places, food and dress around it.",
  },
  {
    step: "Plan",
    href: "/matchmaker",
    text: "Let the Matchmaker draft the day.",
  },
  {
    step: "Personalise",
    href: "/wishes",
    text: "Edit the plan and make a greeting.",
  },
  {
    step: "Celebrate",
    href: "/sound",
    text: "Put on the music and play the games.",
  },
  {
    step: "Share",
    href: "/plans",
    text: "Send the plan, or revoke the link later.",
  },
];

export default function HomePage() {
  const feature = festivalBySlug.get("diwali")!;
  const sample = generatePlan(
    { ...DEFAULT_INPUT, dietary: ["vegetarian"] },
    { id: "sample", now: SAMPLE_NOW },
  );
  const section = (key: string) =>
    sample.sections.find((s) => s.key === key)?.items ?? [];
  const budgetTop = [...sample.budget.lines]
    .sort((a, b) => b.amountMinor - a.amountMinor)
    .slice(0, 4);

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-plum-deep text-ivory">
        <div className="shell grid items-center gap-6 pb-10 pt-12 lg:min-h-[calc(100svh-4rem-11rem)] lg:grid-cols-[1.2fr_0.8fr] lg:pt-6">
          <div className="relative z-10 min-w-0">
            <h1 className="display-hero">
              <span
                className="rise block lg:whitespace-nowrap"
                style={{ "--i": 0 } as React.CSSProperties}
              >
                Discover the world.
              </span>
              <span
                className="rise block lg:whitespace-nowrap lg:pl-[0.7em]"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                Celebrate every culture.
              </span>
            </h1>
            <p
              className="lede rise mt-8 max-w-xl text-ivory/85"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              {site.supporting} FESTIVA brings the world&rsquo;s festivals
              together with their food, dress, music and places, then helps you
              plan a celebration of your own.
            </p>
            <div
              className="rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <Link href="/matchmaker" className="btn btn-saffron">
                Plan a celebration
              </Link>
              <Link href="/discover" className="link text-lg">
                Explore {festivals.length} festivals
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[26rem] lg:max-w-none lg:translate-x-[12%] lg:scale-[1.18]">
            <Globe markers={MARKERS} />
            <p className="note absolute bottom-2 left-1/2 w-max -translate-x-1/2 lg:left-[38%]">
              Each light is a festival in the guide. Drag to turn.
            </p>
          </div>
        </div>
        <div className="rule border-t">
          <div className="shell grid gap-x-12 gap-y-4 py-8 lg:grid-cols-[0.5fr_1fr]">
            <h2 className="display-3">Next on the world&rsquo;s calendar</h2>
            <UpcomingList items={datedFestivals} limit={3} tone="dark" />
          </div>
        </div>
      </section>

      <section className="shell py-20 lg:py-28" aria-labelledby="home-discover">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Link
            href={`/discover/${feature.slug}`}
            className="group relative block"
          >
            <ViewTransition name={`art-festival-${feature.slug}`}>
              <div className="arch aspect-[4/5] w-full">
                <Motif
                  seed={feature.slug}
                  palette={feature.palette}
                  className="h-full w-full transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                />
              </div>
            </ViewTransition>
            <p className="mt-5 font-[family-name:var(--font-display)] text-3xl">
              {feature.name}
            </p>
            <p className="note mt-1">
              {feature.tagline}. {placeLine(feature)}.
            </p>
          </Link>
          <div>
            <h2 id="home-discover" className="display-1">
              A year of celebrations, and the stories behind them.
            </h2>
            <p className="lede mt-6 max-w-xl text-ink">
              Each festival page explains what is celebrated and why, how it
              differs from place to place, and when it next falls, with the
              source for every movable date.
            </p>
            <ul className="mt-10">
              {EDITORIAL.map((slug) => {
                const f = festivalBySlug.get(slug)!;
                return (
                  <li key={slug} className="rule border-t last:border-b">
                    <Link
                      href={`/discover/${slug}`}
                      className="group grid grid-cols-[3rem_1fr] items-center gap-5 py-4 sm:grid-cols-[3rem_1fr_auto]"
                    >
                      <span className="arch block h-14 w-12">
                        <Motif
                          seed={slug}
                          palette={f.palette}
                          className="h-full w-full"
                        />
                      </span>
                      <span>
                        <span className="block font-[family-name:var(--font-display)] text-2xl group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                          {f.name}
                        </span>
                        <span className="note block">{f.tagline}</span>
                      </span>
                      <span className="note hidden sm:block">
                        {placeLine(f)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/discover" className="link link-accent text-lg">
                See all festivals
              </Link>
              <Link
                href="/discover/calendar"
                className="link link-accent text-lg"
              >
                Browse by month
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream" aria-labelledby="home-matchmaker">
        <div className="shell grid gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div>
            <h2 id="home-matchmaker" className="display-1">
              Tell the Matchmaker who is coming. It drafts the celebration.
            </h2>
            <p className="lede mt-6 max-w-xl text-ink">
              Answer six short questions about the occasion, the guests, your
              budget and what you enjoy. You get a schedule, dishes that fit
              everyone&rsquo;s diet, gift and decoration ideas, music, greetings
              and a budget split, each with the reason it was chosen.
            </p>
            <p className="mt-4 max-w-xl text-ink">
              Change anything, swap single items, then save, export or share the
              plan. Budget sums are calculated in code, never by a language
              model.
            </p>
            <Link href="/matchmaker" className="btn btn-plum mt-9">
              Start the Matchmaker
            </Link>
          </div>
          <figure className="rounded-[1.5rem] bg-ivory p-6 sm:p-9">
            <figcaption className="note">
              A real plan from the engine, for sample answers: Diwali, a family
              of eight in India, ₹15,000, vegetarian, half a day.
            </figcaption>
            <p className="mt-4 font-[family-name:var(--font-display)] text-[1.7rem] leading-tight">
              {sample.concept.headline}
            </p>
            <dl className="mt-6 grid gap-5">
              <div>
                <dt className="text-sm font-semibold text-saffron-deep">
                  Schedule
                </dt>
                <dd>
                  <ul className="mt-1.5">
                    {section("schedule")
                      .slice(0, 4)
                      .map((item) => (
                        <li
                          key={item.id}
                          className="rule grid grid-cols-[3.5rem_1fr] border-t py-1.5 text-[0.95rem]"
                        >
                          <span className="tabular-nums text-ink">
                            {item.time}
                          </span>
                          <span>{item.title}</span>
                        </li>
                      ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-saffron-deep">
                  On the table
                </dt>
                <dd className="mt-1">
                  {section("food")
                    .map((i) => i.title)
                    .join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-saffron-deep">
                  Suggested split of the budget
                </dt>
                <dd className="mt-1.5 grid gap-1 text-[0.95rem]">
                  {budgetTop.map((line) => (
                    <div
                      key={line.category}
                      className="flex justify-between gap-4"
                    >
                      <span>{BUDGET_LABELS[line.category]}</span>
                      <span className="tabular-nums">
                        {formatMoney(
                          line.amountMinor,
                          sample.budget.currency,
                          "en-IN",
                        )}
                      </span>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>
          </figure>
        </div>
      </section>

      <section className="shell py-20 lg:py-28" aria-labelledby="home-journey">
        <h2 id="home-journey" className="display-2 max-w-3xl">
          From a date on the calendar to a table full of people, in seven steps.
        </h2>
        <ol className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-7 lg:gap-x-5">
          {JOURNEY.map((item, index) => (
            <li key={item.step} className="rule border-t pt-4">
              <Link href={item.href} className="group block">
                <span className="note tabular-nums">{index + 1}</span>
                <span className="mt-1 block font-[family-name:var(--font-display)] text-2xl group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                  {item.step}
                </span>
                <span className="note mt-2 block">{item.text}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="on-dark bg-emerald-deep text-ivory"
        aria-labelledby="home-worlds"
      >
        <div className="shell py-20 lg:py-28">
          <h2 id="home-worlds" className="display-2 max-w-2xl">
            Everything around the celebration.
          </h2>
          <ul className="mt-12 grid gap-x-16 md:grid-cols-2">
            {NAV.slice(1).map((item) => (
              <li key={item.href} className="rule border-t">
                <Link
                  href={item.href}
                  className="group flex items-baseline justify-between gap-6 py-5"
                >
                  <span className="font-[family-name:var(--font-display)] text-4xl transition-colors group-hover:text-saffron">
                    {item.label}
                  </span>
                  <span className="note max-w-[55%] text-right">
                    {item.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell py-20" aria-labelledby="home-founder">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <h2 id="home-founder" className="display-3">
            Who makes FESTIVA
          </h2>
          <div>
            <p className="lede max-w-2xl">
              FESTIVA is founded by {site.founder.name}. It is built to be
              useful and honest: uncertain dates are marked as uncertain,
              sources are linked, and anything that is a suggestion is labelled
              as one.
            </p>
            <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/about" className="link link-accent">
                About FESTIVA
              </Link>
              {site.founder.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  className="link"
                  target="_blank"
                  rel="me noopener"
                >
                  {link.label}
                </a>
              ))}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
