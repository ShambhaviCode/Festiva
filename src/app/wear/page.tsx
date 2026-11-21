import type { Metadata } from "next";
import { CatalogExplorer, type CatalogItem, type Facet } from "@/components/CatalogExplorer";
import { PageIntro } from "@/components/PageIntro";
import { attire } from "@/data/attire";
import { countries, countryName } from "@/data/countries";
import { festivalBySlug } from "@/data/festivals";
import { paletteFor } from "@/lib/view";

export const metadata: Metadata = {
  title: "Wear: traditional attire, textiles and festival fashion",
  description: "Traditional dress from around the world: the garments, the textiles and craft behind them, how they are worn, and contemporary interpretations.",
  alternates: { canonical: "/wear" },
};

const items: CatalogItem[] = attire.map((a) => ({
  id: a.slug,
  href: `/wear/${a.slug}`,
  title: a.name,
  kicker: countryName(a.country),
  summary: a.summary,
  seed: a.slug,
  palette: paletteFor(a.slug, a.festivals),
  keywords: [...a.textiles, a.craftsmanship].join(" "),
  facets: { country: [a.country], festival: a.festivals },
  art: { kind: "textile" },
  transitionName: `art-garment-${a.slug}`,
}));

const used = new Set(attire.map((a) => a.country));
const facets: Facet[] = [
  { key: "country", label: "Country", options: countries.filter((c) => used.has(c.code)).map((c) => ({ value: c.code, label: c.name })).sort((a, b) => a.label.localeCompare(b.label)) },
  { key: "festival", label: "Worn for", options: [...new Set(attire.flatMap((a) => a.festivals))].map((s) => ({ value: s, label: festivalBySlug.get(s)?.name ?? s })).sort((a, b) => a.label.localeCompare(b.label)) },
];

export default function WearPage() {
  return (
    <>
      <PageIntro title="Wear" lede="What people put on to celebrate, and the weaving, dyeing and tailoring behind it. Each entry includes a note on wearing it with respect, because dress carries meaning." />
      <section className="shell pb-20" aria-label="Attire">
        <CatalogExplorer items={items} facets={facets} searchLabel="Search garments and textiles" placeholder="Try “silk”, “handloom” or “Korea”" noun={["entry", "entries"]} />
      </section>
    </>
  );
}
