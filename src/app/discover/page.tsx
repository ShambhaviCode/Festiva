import type { Metadata } from "next";
import Link from "next/link";
import { CatalogExplorer, type CatalogItem, type Facet } from "@/components/CatalogExplorer";
import { PageIntro } from "@/components/PageIntro";
import { UpcomingList } from "@/components/Upcoming";
import { countries, countryName } from "@/data/countries";
import { CATEGORY_LABELS, festivals, REGION_LABELS } from "@/data/festivals";
import { monthName, typicalMonths } from "@/domain/dates";
import { datedFestivals, placeLine } from "@/lib/view";

export const metadata: Metadata = {
  title: "Discover festivals around the world",
  description: "Search festivals by country, region, month and kind. Each guide covers history, meaning, traditions, regional variations and the next date, with sources.",
  alternates: { canonical: "/discover" },
};

const items: CatalogItem[] = festivals.map((f) => ({
  id: f.slug,
  href: `/discover/${f.slug}`,
  title: f.name,
  kicker: placeLine(f),
  summary: f.summary,
  seed: f.slug,
  palette: f.palette,
  transitionName: `art-festival-${f.slug}`,
  keywords: [f.localName ?? "", f.tagline, f.observedBy, REGION_LABELS[f.region], ...f.countries.map(countryName)].join(" "),
  facets: {
    region: [f.region],
    category: [f.category],
    country: f.countries,
    month: typicalMonths(f.date, 2026).map(String),
  },
}));

const usedCountries = new Set(festivals.flatMap((f) => f.countries));
const facets: Facet[] = [
  { key: "region", label: "Region", options: Object.entries(REGION_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "country", label: "Country", options: countries.filter((c) => usedCountries.has(c.code)).map((c) => ({ value: c.code, label: c.name })).sort((a, b) => a.label.localeCompare(b.label)) },
  { key: "month", label: "Usually falls in", options: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: monthName(i + 1) })) },
  { key: "category", label: "Kind", options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })) },
];

export default function DiscoverPage() {
  return (
    <>
      <PageIntro title="Discover festivals" lede="Thirty-one celebrations from ten regions, each with its story, its customs and an honest note on when it falls. Search by name, place or tradition.">
        <p className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
          <Link href="/discover/calendar" className="link link-accent">
            Browse the calendar by month
          </Link>
          <Link href="/saved" className="link link-accent">
            Your saved festivals
          </Link>
        </p>
      </PageIntro>
      <section className="bg-cream" aria-labelledby="upcoming-heading">
        <div className="shell grid gap-x-12 gap-y-4 py-10 lg:grid-cols-[0.5fr_1fr]">
          <div>
            <h2 id="upcoming-heading" className="display-3">
              Coming up
            </h2>
            <p className="note mt-2 max-w-xs">Worked out from today&rsquo;s date on your device. Projected dates are marked.</p>
          </div>
          <UpcomingList items={datedFestivals} limit={5} />
        </div>
      </section>
      <section className="shell py-14" aria-label="All festivals">
        <CatalogExplorer items={items} facets={facets} searchLabel="Search festivals" placeholder="Try “lantern”, “harvest” or “Japan”" noun={["festival", "festivals"]} timeline={{ facet: "month", title: "The year at a glance" }} />
      </section>
    </>
  );
}
