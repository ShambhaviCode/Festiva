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
