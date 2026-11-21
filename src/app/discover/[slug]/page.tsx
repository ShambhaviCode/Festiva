import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, DetailHero, LinkRows } from "@/components/PageIntro";
import { SaveButton } from "@/components/SaveButton";
import { Sources } from "@/components/Sources";
import { Track } from "@/components/Track";
import { NextDate } from "@/components/Upcoming";
import { attire } from "@/data/attire";
import { countryName } from "@/data/countries";
import { destinations } from "@/data/destinations";
import {
  CATEGORY_LABELS,
  festivalBySlug,
  festivals,
  REGION_LABELS,
} from "@/data/festivals";
import { calendarSystemOf, FESTIVAL_CULTURE } from "@/data/festival-culture";
import { foods } from "@/data/foods";
import { CLAIM_KINDS, reviewOf } from "@/data/reviews";
import { genreBySlug } from "@/data/music";
import { OG_IMAGES, site } from "@/lib/site";
import { paletteFor } from "@/lib/view";

type SlugProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return festivals.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const festival = festivalBySlug.get(slug);
  if (!festival) return { title: "Festival not found" };
  return {
    title: `${festival.name}: ${festival.tagline}`,
    description: festival.summary,
    alternates: { canonical: `/discover/${festival.slug}` },
    openGraph: {
      title: `${festival.name} | ${site.name}`,
      description: festival.summary,
      url: `/discover/${festival.slug}`,
      type: "article",
      siteName: site.name,
      images: OG_IMAGES,
    },
  };
}

export default async function FestivalPage({ params }: SlugProps) {
  const { slug } = await params;
  const festival = festivalBySlug.get(slug);
  if (!festival) notFound();
  const culture = FESTIVAL_CULTURE[festival.slug];
  const review = reviewOf(festival.slug);

  const relatedFood = foods.filter((f) => f.festivals.includes(slug));
  const relatedAttire = attire.filter((a) => a.festivals.includes(slug));
  const relatedPlaces = destinations.filter((d) => d.festivals.includes(slug));
  const dateSources =
    festival.date.kind === "table"
      ? festival.date.occurrences.flatMap((o) => o.sources)
      : [];

  return (
    <article>
      <Track name="festival_view" label={festival.slug} />
      <DetailHero
        back={{ href: "/discover", label: "Discover" }}
        title={festival.name}
        subtitle={
          festival.localName
            ? `${festival.localName}. ${festival.tagline}.`
            : `${festival.tagline}.`
        }
        summary={festival.summary}
        seed={festival.slug}
        palette={festival.palette}
        transitionName={`art-festival-${festival.slug}`}
        meta={
          <dl className="grid gap-x-10 gap-y-3 text-[0.95rem] sm:grid-cols-2">
            <div>
              <dt className="note">Observed by</dt>
              <dd>{festival.observedBy}</dd>
            </div>
            <div>
              <dt className="note">Closely associated with</dt>
              <dd>
                {festival.countries.map((code, i) => (
                  <span key={code}>
                    {i > 0 && ", "}
                    <Link
                      className="link"
                      href={`/journeys/country/${code.toLowerCase()}`}
                    >
                      {countryName(code)}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="note">Region</dt>
              <dd>{REGION_LABELS[festival.region]}</dd>
            </div>
            <div>
              <dt className="note">Kind</dt>
              <dd>{CATEGORY_LABELS[festival.category]}</dd>
            </div>
            <div>
              <dt className="note">Calendar</dt>
              <dd>{calendarSystemOf(festival.slug, festival.date)}</dd>
            </div>
          </dl>
        }
        actions={
          <>
            <Link
              href={`/matchmaker?occasion=${festival.slug}`}
              className="btn btn-saffron"
            >
              Plan {festival.name} with the Matchmaker
            </Link>
            <SaveButton
              kind="festival"
              id={festival.slug}
              name={festival.name}
            />
          </>
        }
      />
      <div className="shell pb-20">
        <Block title="When it falls" id="when">
          <NextDate date={festival.date} dateNote={festival.dateNote} />
        </Block>
        <Block title="History and origins" id="history">
          <p>{festival.history}</p>
        </Block>
        <Block title="Why it matters" id="significance">
          <p>{festival.significance}</p>
        </Block>
        {culture && (
          <Block title="Names and symbols" id="names-symbols">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">In its own languages</h3>
                {culture.originalNames.length > 0 ? (
                  <ul className="mt-3 grid gap-3" data-testid="original-names">
                    {culture.originalNames.map((name) => (
                      <li key={name.name + name.lang}>
                        <span lang={name.lang} className="font-[family-name:var(--font-display)] text-2xl">
                          {name.name}
                        </span>
                        <span className="note block">
                          {name.language}
                          {name.romanized ? `, ${name.romanized}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {culture.namesNote && <p className="note mt-3">{culture.namesNote}</p>}
              </div>
              <div>
                <h3 className="font-semibold">Symbols and what they stand for</h3>
                <dl className="mt-3 grid gap-3" data-testid="symbols">
                  {culture.symbolism.map((sym) => (
                    <div key={sym.symbol}>
                      <dt className="font-semibold">{sym.symbol}</dt>
                      <dd className="text-ink">{sym.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Block>
        )}
        <Block title="Traditions" id="traditions">
          <ul className="list-disc pl-5">
            {festival.traditions.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Block>
        {festival.regionalVariations.length > 0 && (
          <Block title="How it varies" id="variations">
            <dl className="grid gap-4">
              {festival.regionalVariations.map((v) => (
                <div key={v.place}>
                  <dt className="font-semibold">{v.place}</dt>
                  <dd>{v.text}</dd>
                </div>
              ))}
            </dl>
          </Block>
        )}
        <Block title="Celebrating respectfully" id="etiquette">
          <ul className="list-disc pl-5">
            {festival.etiquette.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Block>
        {festival.greetings.length > 0 && (
          <Block title="Greetings" id="greetings">
            <ul className="grid gap-3">
              {festival.greetings.map((g) => (
                <li key={g.text}>
                  <span
                    className="font-[family-name:var(--font-display)] text-xl"
                    lang={g.language === "English" ? "en" : undefined}
                  >
                    {g.text}
                  </span>
                  <span className="note block">
                    {g.language}
                    {g.meaning ? `: ${g.meaning}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p>
              <Link
                href={`/wishes?festival=${festival.slug}`}
                className="link link-accent"
              >
                Make a {festival.name} card in Wishes
              </Link>
            </p>
          </Block>
        )}
        <Block title="On the table" id="food">
          <LinkRows
            items={relatedFood.map((f) => ({
              href: `/taste/${f.slug}`,
              title: f.name,
              text: f.background,
              thumb: {
                art: {
                  kind: "plate",
                  course: f.type,
                  hint: `${f.name} ${f.background}`,
                },
                seed: f.slug,
                palette: paletteFor(f.slug, f.festivals),
              },
            }))}
          />
        </Block>
        <Block title="What people wear" id="attire">
          <LinkRows
            items={relatedAttire.map((a) => ({
              href: `/wear/${a.slug}`,
              title: a.name,
              text: a.summary,
              thumb: {
                art: { kind: "textile" },
                seed: a.slug,
                palette: paletteFor(a.slug, a.festivals),
              },
            }))}
          />
        </Block>
        <Block title="Where to experience it" id="places">
          <LinkRows
            items={relatedPlaces.map((d) => ({
              href: `/journeys/${d.slug}`,
              title: `${d.name}, ${countryName(d.country)}`,
              text: d.summary,
              thumb: {
                art: { kind: "locator", lat: d.lat, lon: d.lon },
                seed: d.slug,
                palette: paletteFor(d.slug, d.festivals),
              },
            }))}
          />
        </Block>
        <Block title="Music" id="music">
          <LinkRows
            items={festival.genres.map((g) => ({
              href: `/sound?genre=${g}`,
              title: genreBySlug.get(g)?.name ?? g,
              text: genreBySlug.get(g)?.about,
            }))}
          />
        </Block>
        <section aria-labelledby="about-info" className="rule mb-10 border-t pt-6" data-testid="about-information">
          <h2 id="about-info" className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">
            What kind of information this page holds
          </h2>
          <dl className="mt-3 grid max-w-3xl gap-3 text-[0.95rem]">
            {CLAIM_KINDS.map((c) => (
              <div key={c.section}>
                <dt>
                  <span className="font-semibold">{c.section}:</span> {c.kind.toLowerCase()}
                </dt>
                <dd className="note">{c.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-3xl text-[0.95rem]" data-testid="review-status">
            {review
              ? `Reviewed by ${review.reviewer} (${review.credentials}) on ${review.reviewedOn}: ${review.scope}.`
              : "Not yet reviewed by a cultural expert. FESTIVA welcomes corrections from people who keep this festival."}
          </p>
        </section>
        <Sources provenance={festival.provenance} extra={dateSources} />
      </div>
    </article>
  );
}
