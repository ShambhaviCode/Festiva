/** @jest-environment node */
import { confirmAction, type ConfirmRequest } from "@/lib/confirm";
import type { ServerEnv } from "@/lib/env.server";
import { amazonSearchUrl, amazonStatus } from "@/lib/integrations/amazon";

/** A minimal browser window: an event target with a native confirm. */
function fakeWindow(answer: boolean) {
  const target = new EventTarget() as EventTarget & { confirm: jest.Mock };
  target.confirm = jest.fn(() => answer);
  return target;
}

describe("confirmAction", () => {
  const original = (globalThis as { window?: unknown }).window;
  afterEach(() => {
    (globalThis as { window?: unknown }).window = original;
  });

  test("on the server it never confirms", async () => {
    delete (globalThis as { window?: unknown }).window;
    await expect(confirmAction({ title: "Delete?" })).resolves.toBe(false);
  });

  test("with no dialog host mounted it falls back to the browser's confirm, so the check is never skipped", async () => {
    const w = fakeWindow(true);
    (globalThis as { window?: unknown }).window = w;
    await expect(confirmAction({ title: "Delete this circle?", body: "This cannot be undone." })).resolves.toBe(true);
    expect(w.confirm).toHaveBeenCalledWith("Delete this circle?\n\nThis cannot be undone.");
  });

  test("a mounted host answers instead, and the browser's confirm is not shown", async () => {
    const w = fakeWindow(true);
    (globalThis as { window?: unknown }).window = w;
    const seen: ConfirmRequest[] = [];
    w.addEventListener("festiva:confirm", (e) => {
      e.preventDefault();
      const req = (e as CustomEvent<ConfirmRequest>).detail;
      seen.push(req);
      req.resolve(false);
    });
    await expect(confirmAction({ title: "Clear data?", tone: "danger", confirmLabel: "Clear data" })).resolves.toBe(false);
    expect(w.confirm).not.toHaveBeenCalled();
    expect(seen[0]).toMatchObject({ title: "Clear data?", tone: "danger", confirmLabel: "Clear data" });
  });
});

describe("Amazon links for Shop", () => {
  const env = (extra: Record<string, string>) => ({ ...extra }) as unknown as ServerEnv;

  test("without configuration: a plain Amazon search link, no affiliate tag, and no claim of live products", () => {
    const url = new URL(amazonSearchUrl("Silver diya set", env({})));
    expect(url.origin).toBe("https://www.amazon.in");
    expect(url.pathname).toBe("/s");
    expect(url.searchParams.get("k")).toBe("Silver diya set");
    expect(url.searchParams.has("tag")).toBe(false);
    expect(amazonStatus(env({}))).toEqual({ marketplace: "amazon.in", affiliate: false, liveProducts: false });
  });

  test("the Associates tag and marketplace are used only when set; live products need all three keys", () => {
    const configured = env({ AMAZON_ASSOCIATE_TAG: "festiva-21", AMAZON_MARKETPLACE: "amazon.co.uk" });
    expect(new URL(amazonSearchUrl("Tea gift box", configured)).searchParams.get("tag")).toBe("festiva-21");
    expect(amazonStatus(configured)).toMatchObject({ marketplace: "amazon.co.uk", affiliate: true, liveProducts: false });
    expect(amazonStatus(env({ AMAZON_ASSOCIATE_TAG: "festiva-21", AMAZON_PAAPI_ACCESS_KEY: "a", AMAZON_PAAPI_SECRET_KEY: "b" })).liveProducts).toBe(true);
  });
});

describe("Brand logos", () => {
  test("every brand in Shop has a logo file that exists, with a recorded source", async () => {
    const { brands } = await import("@/data/shop");
    const { BRAND_LOGOS } = await import("@/data/brand-logos");
    const { existsSync } = await import("node:fs");
    const { join } = await import("node:path");
    for (const b of brands) {
      const logo = BRAND_LOGOS[b.slug];
      expect([b.slug, Boolean(logo)]).toEqual([b.slug, true]);
      expect(existsSync(join(process.cwd(), "public", logo.src))).toBe(true);
      expect(logo.source).toMatch(/^https:\/\//);
    }
  });
});

describe("Photographs", () => {
  test("every festival, dish, garment and place shows a real photograph, never generated artwork", async () => {
    const { festivals } = await import("@/data/festivals");
    const { foods } = await import("@/data/foods");
    const { attire } = await import("@/data/attire");
    const { destinations } = await import("@/data/destinations");
    const { imageFor } = await import("@/data/photo-fallbacks");
    expect(festivals.filter((f) => !imageFor("rosette", f.slug)).map((f) => f.slug)).toEqual([]);
    expect(foods.filter((f) => !imageFor("plate", f.slug)).map((f) => f.slug)).toEqual([]);
    expect(attire.filter((a) => !imageFor("textile", a.slug)).map((a) => a.slug)).toEqual([]);
    expect(destinations.filter((d) => !imageFor("locator", d.slug)).map((d) => d.slug)).toEqual([]);
  });
  test("Taste lists vegetarian dishes only", async () => {
    const { foods } = await import("@/data/foods");
    expect(foods.filter((f) => !f.vegetarian).map((f) => f.slug)).toEqual([]);
  });
});

describe("Live brand catalogue", () => {
  const store = { domain: "www.example-store.com", currency: "INR" as const };
  const feed = {
    products: [
      { id: 1, title: "Block-print kurta", handle: "block-print-kurta", product_type: "Kurta", images: [{ src: "https://cdn.shopify.com/s/files/1/kurta.jpg?v=1" }], variants: [{ price: "1499.00", compare_at_price: "1999.00", available: true }, { price: "1299.00", compare_at_price: null, available: false }] },
      { id: 2, title: "Sold out scarf", handle: "scarf", images: [{ src: "https://cdn.shopify.com/s/files/1/scarf.jpg" }], variants: [{ price: "499.00", available: false }] },
      { id: 3, title: "No photo", handle: "no-photo", images: [], variants: [{ price: "99.00", available: true }] },
      { id: 4, title: "Odd image host", handle: "odd", images: [{ src: "https://evil.example/x.jpg" }], variants: [{ price: "10.00", available: true }] },
    ],
  };

  test("keeps only in-stock products with a store photo, and reads the store's own prices exactly", async () => {
    const { parseStoreProducts } = await import("@/lib/integrations/brand-catalog");
    const products = parseStoreProducts(feed, store);
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({ title: "Block-print kurta", url: "https://www.example-store.com/products/block-print-kurta", priceMinor: 149900, compareAtMinor: 199900, currency: "INR" });
    expect(products[0].image).toBe("https://cdn.shopify.com/s/files/1/kurta.jpg?v=1&width=600");
  });

  test("a store that fails or is unknown is reported as unavailable, never invented", async () => {
    const { fetchBrandCatalog } = await import("@/lib/integrations/brand-catalog");
    const down = (async () => new Response("nope", { status: 503 })) as unknown as typeof fetch;
    expect(await fetchBrandCatalog("fabindia", down)).toMatchObject({ status: "unavailable", reason: "The store answered HTTP 503." });
    const offline = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    expect((await fetchBrandCatalog("giva", offline)).status).toBe("unavailable");
    expect((await fetchBrandCatalog("cartier", offline)).status).toBe("unavailable");
    const ok = (async () => new Response(JSON.stringify(feed), { status: 200 })) as unknown as typeof fetch;
    const live = await fetchBrandCatalog("nicobar", ok);
    expect(live.status).toBe("live");
  });
});
