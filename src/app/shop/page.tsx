import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogExplorer, type CatalogItem, type Facet } from "@/components/CatalogExplorer";
import { GiftFinder } from "@/components/GiftFinder";
import { PageIntro } from "@/components/PageIntro";
import { ShopBrands } from "@/components/ShopBrands";
import { brands, CATEGORY_LABELS, giftIdeas, TIER_LABELS } from "@/data/shop";
import { amazonSearchUrl, amazonStatus } from "@/lib/integrations/amazon";
import { paletteFor } from "@/lib/view";

export const metadata: Metadata = {
  title: "Shop: curated gift ideas and brands",
  description: "Gift ideas for festivals by tier, category and recipient, with brands to browse. A discovery guide with no prices and no paid placements.",
  alternates: { canonical: "/shop" },
};

const brandItems: CatalogItem[] = brands.map((b) => ({
  id: b.slug,
  href: `/shop/${b.slug}`,
  title: b.name,
  kicker: `${TIER_LABELS[b.tier]}, ${b.origin}`,
  summary: b.about,
  seed: b.slug,
  palette: paletteFor(b.slug),
  keywords: b.knownFor.join(" "),
  facets: { tier: [b.tier], category: b.categories, origin: [b.origin] },
  art: { kind: "brand", name: b.name, tier: b.tier, origin: b.origin },
  transitionName: `art-brand-${b.slug}`,
}));

const facets: Facet[] = [
  { key: "tier", label: "Tier", options: Object.entries(TIER_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "category", label: "Category", options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })) },
  { key: "origin", label: "From", options: [...new Set(brands.map((b) => b.origin))].sort().map((o) => ({ value: o, label: o })) },
];

export default function ShopPage() {
  const amazon = amazonStatus();
  const retailer = {
    label: amazon.marketplace.replace(/^amazon/, "Amazon"),
    affiliate: amazon.affiliate,
    links: Object.fromEntries(giftIdeas.map((idea) => [idea.slug, amazonSearchUrl(idea.title)])),
  };
  return (
    <>
      <PageIntro title="Shop" lede="Ideas for what to give, and where you might look. This is a discovery guide, not a store.">
        <ul className="note mt-5 grid max-w-2xl list-disc gap-1 pl-5">
          <li>Brands are catalogue examples. FESTIVA has no partnership or commercial relationship with any of them.</li>
          <li>No prices, discounts, ratings, reviews or stock levels are shown, because FESTIVA has no live product feed.</li>
          <li>Tiers are an editorial guide to a brand&rsquo;s general positioning. Check the brand&rsquo;s own site for everything else.</li>
          <li>
            &ldquo;Search {retailer.label}&rdquo; opens {retailer.label}&rsquo;s own search results for that idea. FESTIVA shows no live Amazon products{amazon.affiliate ? "; these links are affiliate links, so FESTIVA may earn a commission at no cost to you" : ""}.
          </li>
        </ul>
      </PageIntro>
      <section id="gift-ideas-section" className="shell scroll-mt-24 pb-16" aria-labelledby="gift-ideas">
        <h2 id="gift-ideas" className="display-2 mb-8">
          Gift ideas
        </h2>
        <GiftFinder ideas={giftIdeas} brandNames={Object.fromEntries(brands.map((b) => [b.slug, b.name]))} categoryLabels={CATEGORY_LABELS} tierLabels={TIER_LABELS} retailer={retailer} />
      </section>
      <section className="scroll-mt-24 bg-cream" aria-labelledby="brand-directory">
        <div className="shell py-16">
          <h2 id="brand-directory" className="display-2 mb-8">
            Brands to browse
          </h2>
          <Suspense fallback={<CatalogExplorer items={brandItems} facets={facets} searchLabel="Search brands" placeholder="Try “jewellery”, “chocolate” or “handloom”" noun={["brand", "brands"]} />}>
            <ShopBrands items={brandItems} facets={facets} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
