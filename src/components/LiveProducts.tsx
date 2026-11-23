import { formatMoney } from "@/domain/currency";
import type { LiveCatalog } from "@/lib/integrations/brand-catalog";

/** Live products from a brand's own store, with the source and refresh time stated plainly. */
export function LiveProducts({ catalog, brandName, compact = false }: { catalog: LiveCatalog; brandName: string; compact?: boolean }) {
  if (catalog.status !== "live") {
    return <p className="note">Live products from {brandName} could not be loaded right now. {catalog.reason}</p>;
  }
  const shown = compact ? catalog.products.slice(0, 4) : catalog.products;
  return (
    <div data-testid={`live-products-${catalog.brand}`}>
      <ul className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
        {shown.map((p) => (
          <li key={p.id}>
            <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="card-lift photo-zoom group block overflow-hidden rounded-3xl bg-white ring-1 ring-charcoal/10">
              <div className="aspect-square overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element -- the brand's own product photo, served from its store's CDN */}
                <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="line-clamp-2 min-h-[2.6em] font-semibold leading-snug text-charcoal">{p.title}</p>
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-plum-deep">{formatMoney(p.priceMinor, p.currency, p.currency === "INR" ? "en-IN" : "en-US")}</span>
                  {p.compareAtMinor && <s className="note">{formatMoney(p.compareAtMinor, p.currency, p.currency === "INR" ? "en-IN" : "en-US")}</s>}
                </p>
                <p className="mt-2 text-sm font-semibold text-saffron-deep group-hover:underline">View on {catalog.store.replace(/^www\./, "")} ↗</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p className="note mt-3">
        Live from {catalog.store.replace(/^www\./, "")}: names, photos and prices ({catalog.products[0].currency}) as the store lists them, refreshed about hourly. Check the store before you buy.
      </p>
    </div>
  );
}
