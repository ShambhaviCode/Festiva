import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Browser, type Page } from "@playwright/test";

/** Same derivation as src/lib/integrations/flagsmith.ts, so a test can pick an onboarding variant when Flagsmith is not configured. */
function localVariant(anon: string): "guided" | "single_page" {
  const identity = `anon_${createHash("sha256").update(`festiva:${anon}`).digest("hex").slice(0, 24)}`;
  return parseInt(createHash("sha256").update(`onboarding:${identity}`).digest("hex").slice(0, 8), 16) % 2 === 0 ? "guided" : "single_page";
}

export function anonFor(variant: "guided" | "single_page", salt = ""): string {
  for (let i = 0; ; i += 1) {
    const candidate = `e2eanon${salt}${i}`.padEnd(16, "x");
    if (localVariant(candidate) === variant) return candidate;
  }
}

export async function withAnon(page: Page, anon: string) {
  await page.addInitScript((value) => window.localStorage.setItem("festiva.anon", value), anon);
}

export const ADMIN_TOKEN = process.env.E2E_ADMIN_TOKEN ?? "e2e-admin-token-0123456789abcdef";

export async function noSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
}

/** Create a circle through the guided onboarding and return its id and invitation link. */
export async function createCircleGuided(page: Page, options: { organiser?: string; language?: string } = {}) {
  await page.goto("/circles/new");
  const form = page.getByTestId("onboarding");
  await expect(form).toHaveAttribute("data-variant", "guided");
  await page.getByLabel("Festival or occasion").selectOption("diwali");
  await page.getByLabel("Circle name (optional)").fill("Rao family Diwali");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Celebration date")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Total budget for the circle").fill("12000");
  await page.getByLabel("Spend per gift (optional)").fill("1500");
  await page.getByRole("button", { name: "Premium" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Your name").fill(options.organiser ?? "Shambhavi");
  if (options.language) await page.getByLabel("Your language").selectOption(options.language);
  await page.getByRole("button", { name: "Create the circle" }).click();
  await expect(page.getByTestId("organiser-circle-name")).toHaveText("Rao family Diwali");
  const id = page.url().split("/circles/")[1];
  await page.getByTestId("create-invite").click();
  const link = await page.getByTestId("invite-link").inputValue();
  expect(link).toContain(`/circles/join#c=${id}&t=`);
  return { id, link };
}

export async function join(browser: Browser, link: string, name: string, language = "hi-IN") {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(link);
  await expect(page.getByTestId("join-circle-name")).toBeVisible();
  // The token is removed from the address bar as soon as it has been read.
  await expect.poll(() => page.url()).not.toContain("#");
  await page.getByLabel("Your name, as the circle will see it").fill(name);
  await page.getByLabel("The language you would like to use").selectOption(language);
  await page.getByRole("button", { name: "Join the circle" }).click();
  await expect(page.getByTestId("participant-circle-name")).toBeVisible();
  return { context, page };
}

export async function circleKey(page: Page, circleId: string): Promise<string> {
  return page.evaluate((id) => JSON.parse(window.localStorage.getItem("festiva.circles") ?? "[]").find((c: { circleId: string }) => c.circleId === id)?.key, circleId);
}

export async function signInAdmin(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByTestId("admin-sign-in")).toBeVisible();
  await page.getByLabel("Admin token").fill(ADMIN_TOKEN);
  await page.getByRole("button", { name: "Sign in" }).click();
}
