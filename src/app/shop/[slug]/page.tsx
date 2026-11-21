import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, DetailHero } from "@/components/PageIntro";
import { SaveButton } from "@/components/SaveButton";
import { SourceLink } from "@/components/Sources";
import { brandBySlug, brands, CATEGORY_LABELS, giftIdeas, TIER_LABELS } from "@/data/shop";
import { paletteFor, type SlugProps } from "@/lib/view";

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandBySlug.get(slug);
  if (!brand) return { title: "Brand not found" };
  return { title: `${brand.name}: brand profile`, description: brand.about, alternates: { canonical: `/shop/${brand.slug}` } };
}

export default async function BrandPage({ params }: SlugProps) {
  const { slug } = await params;
  const brand = brandBySlug.get(slug);
  if (!brand) notFound();
  const ideas = giftIdeas.filter((g) => g.brands.includes(brand.slug));
  return (
    <article>
      <DetailHero
        back={{ href: "/shop", label: "Shop" }}
        title={brand.name}
        subtitle={`${TIER_LABELS[brand.tier]} tier, from ${brand.origin}`}
        summary={brand.about}
        seed={brand.slug}
        palette={paletteFor(brand.slug)}
        art={{ kind: "brand", name: brand.name, tier: brand.tier, origin: brand.origin }}
        transitionName={`art-brand-${brand.slug}`}
        actions={
          <a href={brand.officialUrl} className="btn btn-plum" target="_blank" rel="noopener noreferrer nofollow">
            Visit the official {brand.name} site
          </a>
        }
      />
      <div className="shell pb-20">
        <Block title="Known for" id="known-for">
          <ul className="list-disc pl-5">
            {brand.knownFor.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          <p className="note">Categories: {brand.categories.map((c) => CATEGORY_LABELS[c]).join(", ")}.</p>
        </Block>
        <Block title="Gift ideas where this brand fits" id="ideas">
          {ideas.length === 0 ? (
            <p className="note">No gift ideas are linked to this brand yet.</p>
          ) : (
            <ul>
              {ideas.map((idea) => (
                <li key={idea.slug} className="rule flex flex-wrap items-center justify-between gap-4 border-t py-3 first:border-t-0">
                  <span>
                    <span className="font-semibold">{idea.title}</span>
                    <span className="note block">{idea.note}</span>
                  </span>
                  <SaveButton kind="wishlist" id={idea.slug} name={idea.title} small />
                </li>
              ))}
            </ul>
          )}
        </Block>
        <Block title="What FESTIVA does not know" id="limits">
          <p>
            FESTIVA does not hold prices, availability, delivery areas or reviews for {brand.name}, and is not affiliated with it. The tier is an editorial guide to the brand&rsquo;s general positioning. For anything you need to rely on, use the official site.
          </p>
        </Block>
        <div className="rule border-t pt-6">
          <SourceLink source={brand.source} />
        </div>
      </div>
    </article>
  );
}
