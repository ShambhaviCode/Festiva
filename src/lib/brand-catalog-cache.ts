import { cacheLife } from "next/cache";
import { fetchBrandCatalog, type LiveCatalog } from "@/lib/integrations/brand-catalog";

/** A brand's live products, fetched from its own store at most about once an hour. */
export async function getLiveCatalog(brand: string, limit = 12): Promise<LiveCatalog> {
  "use cache";
  cacheLife("hours");
  return fetchBrandCatalog(brand, fetch, limit);
}
