import { expect, test } from "@playwright/test";
import { anonFor, withAnon } from "./helpers";

/** 1.2 journey: festival page → prefilled Matchmaker with ages and observance → plan → prefilled Gift Circle. */
test.describe("26. Festival to plan to Gift Circle", () => {
  test("a festival page opens a prefilled Matchmaker, and the plan starts a prefilled Gift Circle", async ({ page }) => {
    await withAnon(page, anonFor("single_page", "finalist"));
    await page.goto("/discover/diwali");
    await page.getByRole("link", { name: "Plan Diwali with the Matchmaker" }).click();
    await expect(page).toHaveURL(/\/matchmaker\?occasion=diwali/);
    await expect(page.getByTestId("occasion")).toHaveValue("diwali");
    await page.getByTestId("wizard-next").click();

    await page.getByTestId("attendees").fill("12");
    await page.getByRole("checkbox", { name: "Under 5" }).click();
    await page.getByRole("checkbox", { name: "Over 65" }).click();
    await expect(page.getByRole("checkbox", { name: "Under 5" })).toHaveAttribute("aria-checked", "true");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("budget-input").fill("24000");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-next").click();
    await page.getByRole("radio", { name: "With its religious rites" }).click();
    await page.getByRole("radio", { name: "A full day" }).click();
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-next").click();

    const plan = page.getByTestId("plan");
    await expect(plan).toBeVisible();
    await expect(page.getByTestId("section-schedule")).toContainText("Prayer or rites");
    await expect(page.getByTestId("section-schedule")).toContainText("Quiet time");
    await expect(page.getByTestId("section-context")).toContainText("For the under-fives");
    await expect(page.getByTestId("section-context")).toContainText("For older guests");
    await expect(page.getByTestId("budget-planned")).toHaveText("₹24,000");

    const gifts = await page.getByTestId("budget-gifts").inputValue();
    await page.getByTestId("start-gift-circle").click();
    await expect(page).toHaveURL(/\/circles\/new\?/);
    await expect(page.getByTestId("onboarding")).toBeVisible();
    await expect(page.getByLabel("Festival or occasion")).toHaveValue("diwali");
    await expect(page.getByLabel("Total budget for the circle")).toHaveValue(String(Math.round(Number(gifts))));
  });

  test("bad values in a prefill link are ignored, not trusted", async ({ page }) => {
    await page.goto("/matchmaker?occasion=not-a-festival&people=-4&ages=under-5,robots&observance=pagan");
    await expect(page.getByTestId("occasion")).toHaveValue("diwali");
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("attendees")).toHaveValue("8");
    await expect(page.getByRole("checkbox", { name: "Under 5" })).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("checkbox", { name: "5 to 12" })).toHaveAttribute("aria-checked", "false");
  });
});
