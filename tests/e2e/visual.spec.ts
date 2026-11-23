import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { anonFor, createCircleGuided, signInAdmin, withAnon } from "./helpers";

/**
 * Visual system checks: the parts of the 1.1 visual upgrade that can break
 * silently (layout shift, sideways scrolling, art per module, reduced motion).
 */

async function trackLayoutShift(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
      }[])
        if (!entry.hadRecentInput)
          (window as unknown as { __cls: number }).__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}

async function measure(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  return page.evaluate(() => ({
    cls: (window as unknown as { __cls: number }).__cls,
    overflow:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));
}

test.describe("24. Visual system", () => {
  test("each module draws its own kind of artwork", async ({ page }) => {
    for (const [path, kind] of [
      ["/discover", "rosette"],
      ["/taste", "plate"],
      ["/wear", "textile"],
      ["/journeys", "locator"],
    ] as const) {
      await page.goto(path);
      const frames = page.getByTestId("catalog-grid").locator("[data-art]");
      await expect(frames.first()).toHaveAttribute("data-art", kind);
      // Each card shows either a credited photo or FESTIVA's generated artwork (an aria-hidden SVG).
      expect(await frames.first().locator("img, svg[aria-hidden='true']").count()).toBeGreaterThan(0);
    }
  });

  test("the year ribbon filters festivals by month", async ({ page }) => {
    await page.goto("/discover");
    const ribbon = page.getByTestId("year-ribbon");
    await expect(ribbon.getByRole("button")).toHaveCount(12);
    const before = await page
      .getByTestId("catalog-grid")
      .getByRole("listitem")
      .count();
    const march = ribbon.getByRole("button", { name: /^Mar/ });
    await march.click();
    await expect(march).toHaveAttribute("aria-pressed", "true");
    const label = (await march.textContent()) ?? "";
    const expected = Number(label.match(/(\d+) celebration/)?.[1]);
    await expect(
      page.getByTestId("catalog-grid").getByRole("listitem"),
    ).toHaveCount(expected);
    expect(expected).toBeLessThan(before);
    await march.click();
    await expect(march).toHaveAttribute("aria-pressed", "false");
    await expect(
      page.getByTestId("catalog-grid").getByRole("listitem"),
    ).toHaveCount(before);
  });

  test("every point on the Journeys map is a link to its destination", async ({
    page,
  }) => {
    await page.goto("/journeys");
    const pins = page.getByTestId("world-map").getByRole("link");
    expect(await pins.count()).toBeGreaterThan(10);
    const kyoto = page
      .getByTestId("world-map")
      .getByRole("link", { name: /Kyoto/ });
    await kyoto.focus();
    await expect(kyoto).toBeFocused();
    await kyoto.press("Enter");
    await expect(page).toHaveURL(/\/journeys\/kyoto$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Kyoto",
    );
  });

  test("Play shows a cover for every game", async ({ page }) => {
    await page.goto("/play");
    const games = page.getByRole("main").getByRole("listitem");
    await expect(games).toHaveCount(5);
    for (const game of await games.all())
      await expect(game.locator("svg")).toHaveCount(1);
  });

  test("shop gift ideas are grouped by kind of gift", async ({ page }) => {
    await page.goto("/shop");
    const groups = page.getByTestId("gift-list").locator("section");
    expect(await groups.count()).toBeGreaterThan(3);
    await expect(
      groups.first().getByRole("heading", { level: 3 }),
    ).toBeVisible();
  });

  for (const path of ["/journeys", "/shop", "/circles"]) {
    test(`no serious accessibility violations on ${path}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        serious.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((n) => n.target.join(" "))
              .slice(0, 3)
              .join(" | ")}`,
        ),
      ).toEqual([]);
    });
  }

  test("with reduced motion, decorative animation is switched off", async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/journeys");
    const pin = page.getByTestId("world-map").locator(".seat-arrive").first();
    await expect(pin).toBeVisible();
    // The global reduced-motion rule collapses every animation to an instant; nothing moves for longer than a frame.
    const seconds = await pin.evaluate((el) =>
      parseFloat(getComputedStyle(el).animationDuration),
    );
    expect(seconds).toBeLessThan(0.001);
    await context.close();
  });
});

test.describe("25. Layout stability", () => {
  for (const width of [1440, 768, 390]) {
    test(`public pages hold still and fit at ${width}px`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width, height: 900 });
      await trackLayoutShift(page);
      for (const path of [
        "/",
        "/discover",
        "/journeys",
        "/taste",
        "/shop",
        "/play",
        "/play/quiz",
        "/intelligence",
        "/circles",
        "/discover/calendar",
        "/wishes",
      ]) {
        await page.goto(path);
        const { cls, overflow } = await measure(page);
        expect.soft(cls, `layout shift on ${path}`).toBeLessThan(0.1);
        expect
          .soft(overflow, `sideways overflow on ${path}`)
          .toBeLessThanOrEqual(0);
      }
    });
  }

  test("Gift Circle and admin pages load without jumping or overflowing on a phone", async ({
    page,
  }) => {
    await withAnon(page, anonFor("guided", "visual"));
    const { id } = await createCircleGuided(page, { organiser: "Meera" });
    await page.setViewportSize({ width: 390, height: 844 });
    await trackLayoutShift(page);
    for (const path of [`/circles/${id}`, `/circles/${id}/summary`]) {
      await page.goto(path);
      await expect(page.getByTestId("page-skeleton")).toHaveCount(0);
      const { cls, overflow } = await measure(page);
      expect.soft(cls, `layout shift on ${path}`).toBeLessThan(0.1);
      expect
        .soft(overflow, `sideways overflow on ${path}`)
        .toBeLessThanOrEqual(0);
    }
    await expect(page.getByTestId("budget-meter")).toBeVisible();
    await signInAdmin(page, "/admin/integrations");
    await expect(page.getByTestId("integration-sarvam")).toBeVisible();
    await page.getByText(/Language coverage/).click();
    const { overflow } = await measure(page);
    expect(
      overflow,
      "sideways overflow on /admin/integrations",
    ).toBeLessThanOrEqual(0);
  });
});
