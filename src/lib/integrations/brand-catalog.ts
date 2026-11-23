import { toMinor } from "@/domain/currency";

/**
 * Live products for brands whose own online store publishes a public product feed (Shopify's
 * `/products.json`). Everything shown comes from the brand's store: name, photo, price and the link to buy.
 * FESTIVA adds nothing and changes nothing; if a store cannot be reached, the brand shows no live products.
 *
 * Brands without a public feed (Tanishq, Swarovski, Cartier, Manyavar and others) have no live data here.
 * FESTIVA does not scrape web pages.
 */
export interface BrandStore {
  domain: string;
  /** The store's own selling currency, confirmed from its cart (24 November 2026). */
  currency: "INR" | "USD";
}

export const BRAND_STORES: Record<string, BrandStore> = {
  fabindia: { domain: "www.fabindia.com", currency: "INR" },
  giva: { domain: "www.giva.co", currency: "INR" },
  nicobar: { domain: "www.nicobar.com", currency: "INR" },
  godiva: { domain: "www.godiva.com", currency: "USD" },
};

export interface LiveProduct {
  id: string;
  title: string;
  url: string;
  image: string;
  priceMinor: number;
  /** The store's own "was" price, only when it is higher than the current price. */
  compareAtMinor: number | null;
  currency: string;
  type: string;
}

export type LiveCatalog =
  | { status: "live"; brand: string; store: string; products: LiveProduct[]; fetchedAt: string }
  | { status: "unavailable"; brand: string; store: string; reason: string };

interface ShopifyVariant { price?: string; compare_at_price?: string | null; available?: boolean }
interface ShopifyProduct { id?: number | string; title?: string; handle?: string; product_type?: string; images?: { src?: string }[]; variants?: ShopifyVariant[] }

const SAFE_HANDLE = /^[a-z0-9][a-z0-9-]{0,200}$/i;

/** Keep only products that are in stock and have a photo, and read prices exactly as the store gives them. */
export function parseStoreProducts(raw: unknown, store: BrandStore, limit = 12): LiveProduct[] {
  const list = (raw as { products?: ShopifyProduct[] } | null)?.products;
  if (!Array.isArray(list)) return [];
  const out: LiveProduct[] = [];
  for (const p of list) {
    const variants = (p.variants ?? []).filter((v) => v.available && v.price && Number.isFinite(Number(v.price)));
    const image = p.images?.[0]?.src;
    if (!p.title || !p.handle || !SAFE_HANDLE.test(p.handle) || !variants.length || !image) continue;
    let imageUrl: URL;
    try {
      imageUrl = new URL(image);
    } catch {
      continue;
    }
    if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "cdn.shopify.com") continue;
    imageUrl.searchParams.set("width", "600");
    const cheapest = variants.reduce((a, b) => (Number(b.price) < Number(a.price) ? b : a));
    const priceMinor = toMinor(Number(cheapest.price), store.currency);
    const compare = cheapest.compare_at_price ? toMinor(Number(cheapest.compare_at_price), store.currency) : null;
    out.push({
      id: String(p.id ?? p.handle),
      title: p.title.trim().slice(0, 140),
      url: `https://${store.domain}/products/${p.handle}`,
      image: imageUrl.toString(),
      priceMinor,
      compareAtMinor: compare && compare > priceMinor ? compare : null,
      currency: store.currency,
      type: (p.product_type ?? "").trim(),
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Fetch one brand's live products. Never throws: a failure is reported as "unavailable". */
export async function fetchBrandCatalog(brand: string, fetchImpl: typeof fetch = fetch, limit = 12): Promise<LiveCatalog> {
  const store = BRAND_STORES[brand];
  if (!store) return { status: "unavailable", brand, store: "", reason: "This brand has no public product feed." };
  try {
    const res = await fetchImpl(`https://${store.domain}/products.json?limit=60`, {
      headers: { accept: "application/json", "user-agent": "FESTIVA-catalog/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { status: "unavailable", brand, store: store.domain, reason: `The store answered HTTP ${res.status}.` };
    const products = parseStoreProducts(await res.json(), store, limit);
    if (!products.length) return { status: "unavailable", brand, store: store.domain, reason: "The store listed no products in stock." };
    return { status: "live", brand, store: store.domain, products, fetchedAt: new Date().toISOString() };
  } catch {
    return { status: "unavailable", brand, store: store.domain, reason: "The store could not be reached." };
  }
}
