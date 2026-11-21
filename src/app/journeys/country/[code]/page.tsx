import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, LinkRows } from "@/components/PageIntro";
import { attire } from "@/data/attire";
import { countries, countryByCode } from "@/data/countries";
import { destinations } from "@/data/destinations";
import { festivals, REGION_LABELS } from "@/data/festivals";
import { foods } from "@/data/foods";
import { artists } from "@/data/music";

type Props = { params: Promise<{ code: string }> };

export function generateStaticParams() {
  return countries.map((c) => ({ code: c.code.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = countryByCode.get(code.toUpperCase());
  if (!country) return { title: "Country not found" };
  return { title: `${country.name}: festivals, food, dress and places`, description: country.blurb, alternates: { canonical: `/journeys/country/${country.code.toLowerCase()}` } };
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params;
  const country = countryByCode.get(code.toUpperCase());
  if (!country) notFound();
  const c = country.code;
  const fests = festivals.filter((f) => f.countries.includes(c));
  return (
    <article>
      <section className="shell pb-10 pt-10 lg:pt-14">
        <nav aria-label="Breadcrumb">
          <Link href="/journeys" className="link note">
            Back to Journeys
          </Link>
        </nav>
        <h1 className="display-1 mt-5">{country.name}</h1>
        <p className="lede mt-5 max-w-2xl">{country.blurb}</p>
        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-[0.95rem]">
          <div>
            <dt className="note">Region</dt>
            <dd>{REGION_LABELS[country.region]}</dd>
          </div>
          <div>
            <dt className="note">Languages include</dt>
            <dd>{country.languages.join(", ")}</dd>
          </div>
          <div>
            <dt className="note">Currency</dt>
            <dd>{country.currency}</dd>
          </div>
        </dl>
      </section>
      <div className="shell pb-20">
        <Block title="Festivals" id="festivals">
          <LinkRows items={fests.map((f) => ({ href: `/discover/${f.slug}`, title: f.name, text: f.summary }))} />
        </Block>
        <Block title="Places" id="places">
          <LinkRows items={destinations.filter((d) => d.country === c).map((d) => ({ href: `/journeys/${d.slug}`, title: d.name, text: d.summary }))} />
        </Block>
        <Block title="Food" id="food">
          <LinkRows items={foods.filter((f) => f.country === c).map((f) => ({ href: `/taste/${f.slug}`, title: f.name, text: f.background }))} />
        </Block>
        <Block title="Dress" id="dress">
          <LinkRows items={attire.filter((a) => a.country === c).map((a) => ({ href: `/wear/${a.slug}`, title: a.name, text: a.summary }))} />
        </Block>
        <Block title="Music" id="music">
          <LinkRows items={artists.filter((a) => a.country === country.name).map((a) => ({ href: `/sound?q=${encodeURIComponent(a.name)}`, title: a.name, text: a.languages.join(", ") }))} />
        </Block>
        <p className="rule note border-t pt-6">
          <Link href={`/matchmaker?country=${c}`} className="link link-accent">
            Plan a celebration in {country.name}
          </Link>
        </p>
      </div>
    </article>
  );
}
