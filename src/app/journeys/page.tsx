import type { Metadata } from "next";
import Link from "next/link";
import { CatalogExplorer, type CatalogItem, type Facet } from "@/components/CatalogExplorer";
import { WorldMap } from "@/components/art/WorldMap";
import { countries, countryName } from "@/data/countries";
import { destinations } from "@/data/destinations";
import { festivalBySlug, REGION_LABELS } from "@/data/festivals";
import { paletteFor } from "@/lib/view";

export const metadata: Metadata = {
  title: "Journeys: countries and cultural destinations",
  description: "Cities, heritage sites and regions where the world's festivals are at their most vivid, with landmarks, local experiences and cultural itineraries.",
  alternates: { canonical: "/journeys" },
};

const KIND = { city: "City", heritage: "Heritage site", region: "Region" } as const;

const items: CatalogItem[] = destinations.map((d) => ({
  id: d.slug,
  href: `/journeys/${d.slug}`,
  title: d.name,
  kicker: [countryName(d.country), d.festivals.map((s) => festivalBySlug.get(s)?.name).filter(Boolean).join(", ")].filter(Boolean).join(". "),
  summary: d.summary,
  seed: d.slug,
  palette: paletteFor(d.slug, d.festivals),
  keywords: [...d.landmarks, ...d.experiences].join(" "),
  facets: { kind: [d.kind], country: [d.country], festival: d.festivals },
  art: { kind: "locator", lat: d.lat, lon: d.lon },
  transitionName: `art-place-${d.slug}`,
}));

const used = new Set(destinations.map((d) => d.country));
const facets: Facet[] = [
  { key: "kind", label: "Kind of place", options: Object.entries(KIND).map(([value, label]) => ({ value, label })) },
  { key: "country", label: "Country", options: countries.filter((c) => used.has(c.code)).map((c) => ({ value: c.code, label: c.name })).sort((a, b) => a.label.localeCompare(b.label)) },
  { key: "festival", label: "Festival", options: [...new Set(destinations.flatMap((d) => d.festivals))].map((s) => ({ value: s, label: festivalBySlug.get(s)?.name ?? s })).sort((a, b) => a.label.localeCompare(b.label)) },
];

export default function JourneysPage() {
  const byRegion = Object.entries(REGION_LABELS).map(([region, label]) => ({ label, list: countries.filter((c) => c.region === region) }));
  return (
    <>
      <section className="on-dark bg-plum-deep text-ivory" aria-labelledby="journeys-title">
        <div className="shell pb-10 pt-14 lg:pt-20">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <h1 id="journeys-title" className="display-1">
              Journeys
            </h1>
            <p className="lede max-w-xl text-ivory/85">
              Places where celebrations live: the ghats, plazas, lakes and old towns behind the festivals in the guide. Notes cover what to see and do, not prices or opening hours, which change and should be checked with official sources.
            </p>
          </div>
          <div className="mt-10">
            <WorldMap places={destinations.map((d) => ({ slug: d.slug, href: `/journeys/${d.slug}`, name: d.name, detail: [countryName(d.country), d.festivals.map((s) => festivalBySlug.get(s)?.name).filter(Boolean).join(" and ")].filter(Boolean).join(", for "), lat: d.lat, lon: d.lon }))} />
            <p className="note mt-3">{destinations.length} places in the guide. Select a point to open it.</p>
          </div>
        </div>
      </section>
      <section id="destinations" className="shell scroll-mt-24 py-14" aria-label="Destinations">
        <CatalogExplorer items={items} facets={facets} searchLabel="Search destinations" placeholder="Try “Kyoto”, “lanterns” or “river”" noun={["destination", "destinations"]} />
      </section>
      <section className="bg-cream" aria-labelledby="countries-heading">
        <div className="shell py-16">
          <h2 id="countries-heading" className="display-2">
            Countries in the guide
          </h2>
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {byRegion.map(({ label, list }) => (
              <div key={label}>
                <h3 className="font-[family-name:var(--font-sans)] text-base font-semibold tracking-normal">{label}</h3>
                <ul className="mt-2 grid gap-1">
                  {list.map((c) => (
                    <li key={c.code}>
                      <Link href={`/journeys/country/${c.code.toLowerCase()}`} className="link">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
