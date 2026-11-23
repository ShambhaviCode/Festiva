import { serverEnv, type ServerEnv } from "@/lib/env.server";

/**
 * Amazon, for Shop. FESTIVA never scrapes Amazon and never shows prices, stock, ratings or reviews.
 *
 * What works today: a "Search on Amazon" link for each gift idea. It opens Amazon's own search results for
 * that idea, which is a real destination and makes no claim about any product. The Associates tag is added
 * only when AMAZON_ASSOCIATE_TAG is set, and the page then says the link is an affiliate link.
 *
 * Live product data (Product Advertising API 5.0) needs approved Associates credentials. Until
 * AMAZON_PAAPI_ACCESS_KEY, AMAZON_PAAPI_SECRET_KEY and the tag are all set, liveProducts is false
 * and nothing on the site presents itself as live Amazon data.
 */
export interface AmazonStatus {
  marketplace: string;
  affiliate: boolean;
  liveProducts: boolean;
}

export function amazonStatus(env: ServerEnv = serverEnv()): AmazonStatus {
  return {
    marketplace: env.AMAZON_MARKETPLACE ?? "amazon.in",
    affiliate: Boolean(env.AMAZON_ASSOCIATE_TAG),
    liveProducts: Boolean(env.AMAZON_PAAPI_ACCESS_KEY && env.AMAZON_PAAPI_SECRET_KEY && env.AMAZON_ASSOCIATE_TAG),
  };
}

/** Amazon's own search page for a gift idea, with the Associates tag only when one is configured. */
export function amazonSearchUrl(query: string, env: ServerEnv = serverEnv()): string {
  const { marketplace } = amazonStatus(env);
  const url = new URL(`https://www.${marketplace}/s`);
  url.searchParams.set("k", query.trim().slice(0, 120));
  if (env.AMAZON_ASSOCIATE_TAG) url.searchParams.set("tag", env.AMAZON_ASSOCIATE_TAG);
  return url.toString();
}
