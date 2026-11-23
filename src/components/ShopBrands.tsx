"use client";

import { useSearchParams } from "next/navigation";
import { CatalogExplorer, type CatalogItem, type Facet } from "@/components/CatalogExplorer";

const TIERS = new Set(["everyday", "premium", "elite"]);

/** The brand directory, opened on a tier when the link says so (/shop?tier=premium). */
export function ShopBrands({ items, facets }: { items: CatalogItem[]; facets: Facet[] }) {
  const tier = useSearchParams().get("tier") ?? "";
  const initial: Record<string, string> = TIERS.has(tier) ? { tier } : {};
  return <CatalogExplorer key={tier} items={items} facets={facets} initial={initial} searchLabel="Search brands" placeholder="Try “jewellery”, “chocolate” or “handloom”" noun={["brand", "brands"]} />;
}
