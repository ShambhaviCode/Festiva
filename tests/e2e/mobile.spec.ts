import { expect, test } from "@playwright/test";

test.describe("19. Mobile experience", () => {
  test("the menu opens, navigates, and closes with Escape", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    const toggle = page.getByRole("button", { name: "Menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("navigation", { name: "All sections" });
    await expect(menu.getByRole("link", { name: /Taste/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await page.getByRole("button", { name: "Menu" }).click();
    await menu.getByRole("link", { name: /Taste/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Taste" })).toBeVisible();
    await expect(menu).toBeHidden();
  });

  test("no page scrolls sideways on a phone", async ({ page }) => {
    test.setTimeout(240_000);
    for (const path of ["/", "/world", "/discover", "/discover/diwali", "/matchmaker", "/shop", "/wishes", "/play/memory", "/sound", "/intelligence", "/circles", "/circles/new", "/admin"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect([path, overflow]).toEqual([path, 0]);
    }
  });

  test("the Matchmaker can be completed by touch", async ({ page }) => {
    await page.goto("/matchmaker?occasion=lunar-new-year&country=SG");
    await expect(page.getByTestId("occasion")).toHaveValue("lunar-new-year");
    for (let i = 0; i < 6; i += 1) await page.getByTestId("wizard-next").tap();
    await expect(page.getByTestId("plan-headline")).toContainText("Lunar New Year");
    await expect(page.getByTestId("plan")).toContainText("Lunar New Year in Singapore");
    await expect(page.getByTestId("budget-planned")).toBeVisible();
  });

  test("a game is playable by touch", async ({ page }) => {
    await page.goto("/play/puzzle");
    await page.locator('[data-movable="true"]').first().tap();
    await expect(page.getByTestId("stat-moves")).toHaveText("1");
  });
});
