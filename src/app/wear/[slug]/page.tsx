import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, DetailHero, LinkRows } from "@/components/PageIntro";
import { SourceLink } from "@/components/Sources";
import { attire, attireBySlug } from "@/data/attire";
import { countryName } from "@/data/countries";
import { festivalBySlug } from "@/data/festivals";
import { brandBySlug } from "@/data/shop";
import { paletteFor, type SlugProps } from "@/lib/view";

export function generateStaticParams() {
  return attire.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const item = attireBySlug.get(slug);
  if (!item) return { title: "Attire not found" };
  return { title: `${item.name}: traditional dress from ${countryName(item.country)}`, description: item.summary, alternates: { canonical: `/wear/${item.slug}` } };
}

export default async function AttirePage({ params }: SlugProps) {
  const { slug } = await params;
  const item = attireBySlug.get(slug);
  if (!item) notFound();
  const festivals = item.festivals.map((s) => festivalBySlug.get(s)).filter((f) => f !== undefined);
  const brands = item.brands.map((s) => brandBySlug.get(s)).filter((b) => b !== undefined);
  return (
    <article>
      <DetailHero back={{ href: "/wear", label: "Wear" }} title={item.name} subtitle={countryName(item.country)} summary={item.summary} seed={item.slug} palette={paletteFor(item.slug, item.festivals)} art={{ kind: "textile" }} transitionName={`art-garment-${item.slug}`} />
      <div className="shell pb-20">
        <Block title="Textiles and materials" id="textiles">
          <ul className="list-disc pl-5">
            {item.textiles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Block>
        <Block title="Craftsmanship" id="craft">
          <p>{item.craftsmanship}</p>
        </Block>
        <Block title="Wearing it with respect" id="wearing">
          <p>{item.wearing}</p>
        </Block>
        <Block title="Contemporary interpretations" id="contemporary">
          <p>{item.contemporary}</p>
        </Block>
        <Block title="Worn for" id="festivals">
          <LinkRows items={festivals.map((f) => ({ href: `/discover/${f.slug}`, title: f.name, text: f.tagline }))} />
        </Block>
        {brands.length > 0 && (
          <Block title="Designers and labels to browse" id="brands">
            <LinkRows items={brands.map((b) => ({ href: `/shop/${b.slug}`, title: b.name, text: b.about }))} />
            <p className="note">Catalogue examples only. FESTIVA has no partnership with these brands.</p>
          </Block>
        )}
        <div className="rule border-t pt-6">
          <SourceLink source={item.source} />
        </div>
      </div>
    </article>
  );
}
