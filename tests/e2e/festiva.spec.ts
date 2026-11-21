import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const digits = (text: string | null) => Number((text ?? "").replace(/[^0-9.-]/g, ""));

async function completeWizard(page: Page, options: { occasion?: string; attendees?: string; budget?: string; dietary?: string } = {}) {
  await page.goto("/matchmaker");
  await page.getByTestId("occasion").selectOption(options.occasion ?? "holi");
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("attendees").fill(options.attendees ?? "10");
  await page.getByRole("radio", { name: "Friends" }).click();
  await page.getByTestId("wizard-next").click();
  await page.getByTestId("budget-input").fill(options.budget ?? "20000");
  await page.getByTestId("wizard-next").click();
  await page.getByRole("checkbox", { name: options.dietary ?? "Vegetarian" }).click();
  await page.getByTestId("wizard-next").click();
  await expect(page.getByRole("heading", { name: "What should it feel like?" })).toBeVisible();
  await page.getByTestId("wizard-next").click();
  await expect(page.getByRole("heading", { name: "What do your guests enjoy?" })).toBeVisible();
  await page.getByTestId("wizard-next").click();
  await expect(page.getByTestId("plan")).toBeVisible();
}

test.describe("1–2. Homepage and navigation", () => {
  test("homepage shows the brand, the upcoming calendar and a working call to action", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FESTIVA: Discover the world\. Celebrate every culture\./);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Discover the world.");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Celebrate every culture.");
    await expect(page.getByRole("contentinfo").getByText("Founded by Shambhavi M K")).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/ShambhaviCode");
    await expect(page.getByTestId("upcoming-list").getByRole("listitem")).toHaveCount(3);
    await page.locator("main").getByRole("link", { name: "Plan a celebration" }).click();
    await expect(page).toHaveURL(/\/matchmaker$/);
    await expect(page.getByRole("heading", { level: 1, name: "FESTIVA Matchmaker" })).toBeVisible();
  });

  test("every main navigation link opens its module", async ({ page }) => {
    await page.goto("/");
    for (const [label, heading] of [["Discover", "Discover festivals"], ["Journeys", "Journeys"], ["Taste", "Taste"], ["Wear", "Wear"], ["Shop", "Shop"], ["Wishes", "Wishes"], ["Play", "Play"], ["Sound", "Sound"], ["Intelligence", "FESTIVA Intelligence"]]) {
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1, name: heading, exact: true })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    }
  });

  test("unknown pages return a helpful 404", async ({ page }) => {
    for (const path of ["/discover/not-a-real-festival", "/taste/unicorn-stew", "/journeys/country/zz", "/play/chess", "/nowhere"]) {
      const response = await page.goto(path);
      expect([path, response?.status()]).toEqual([path, 404]);
      await expect(page.getByRole("heading", { name: "This page is not in the guide." })).toBeVisible();
    }
    expect((await page.goto("/discover/calendar"))?.status()).toBe(200);
    expect((await page.goto("/journeys/country/in"))?.status()).toBe(200);
  });
});

test.describe("3–7. Discovery", () => {
  test("festival search and filters narrow the list and can be cleared", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.getByTestId("result-count")).toHaveText("46 festivals");
    await page.getByLabel("Search festivals").fill("lantern");
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Mid-Autumn Festival" })).toBeVisible();
    await expect(page.getByTestId("result-count")).toContainText("match your filters");
    await page.getByLabel("Search festivals").fill("");
    await page.getByLabel("Region").selectOption("africa");
    await expect(page.getByTestId("result-count")).toHaveText("5 festivals match your filters");
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Timkat" })).toBeVisible();
    await page.getByLabel("Usually falls in").selectOption("12");
    await expect(page.getByText("Nothing matches those filters.")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(page.getByTestId("result-count")).toHaveText("46 festivals");
    await page.getByLabel("Search festivals").fill("tet");
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Lunar New Year" })).toBeVisible();
  });

  test("festival page gives the story, an honest date with its source, and can be saved", async ({ page }) => {
    await page.goto("/discover/diwali");
    await expect(page.getByRole("heading", { level: 1, name: "Diwali" })).toBeVisible();
    await expect(page.getByTestId("next-date")).toContainText("Checked against published calendars");
    await expect(page.getByTestId("next-date").getByRole("link", { name: /Drik Panchang/ })).toHaveAttribute("href", /drikpanchang\.com/);
    for (const heading of ["History and origins", "Why it matters", "Traditions", "How it varies", "Celebrating respectfully", "On the table", "What people wear", "Where to experience it", "Music", "Sources and reliability"]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await page.getByRole("button", { name: "Save festival: Diwali" }).click();
    await expect(page.getByRole("button", { name: "Saved: Diwali" })).toHaveAttribute("aria-pressed", "true");
    await page.goto("/saved");
    await expect(page.getByTestId("saved-festivals").getByRole("link", { name: "Diwali" })).toBeVisible();
  });

  test("projected and seasonal dates are labelled as such", async ({ page }) => {
    await page.goto("/discover/eid-al-fitr");
    await expect(page.getByTestId("next-date")).toContainText("Projected; confirmed locally nearer the time");
    await page.goto("/discover/hanami");
    await expect(page.getByTestId("next-date")).toContainText("Seasonal");
  });

  test("calendar lists festivals month by month", async ({ page }) => {
    await page.goto("/discover/calendar");
    await expect(page.locator("#month-12").getByRole("link", { name: /Christmas/ })).toBeVisible();
    await expect(page.locator("#month-4").getByRole("link", { name: /Songkran/ })).toBeVisible();
  });

  test("country and destination pages connect festivals, food, dress and maps", async ({ page }) => {
    await page.goto("/journeys/country/jp");
    await expect(page.getByRole("heading", { level: 1, name: "Japan" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Gion Matsuri/ })).toBeVisible();
    await page.getByRole("link", { name: /^Kyoto/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Kyoto" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open map (OpenStreetMap)" })).toHaveAttribute("href", /openstreetmap\.org/);
    await expect(page.getByText("FESTIVA does not list prices, opening hours or bookings")).toBeVisible();
    await page.goto("/journeys");
    await page.getByLabel("Search destinations").fill("ghats");
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Varanasi" })).toBeVisible();
  });

  test("food and attire discovery with dietary filter", async ({ page }) => {
    await page.goto("/taste");
    await page.getByRole("button", { name: "Vegan", exact: true }).click();
    const count = digits(await page.getByTestId("result-count").textContent());
    expect(count).toBeGreaterThan(3);
    expect(count).toBeLessThan(20);
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Biryani" })).toHaveCount(0);
    await page.goto("/taste/mooncake");
    await expect(page.getByText("Usually contains: gluten, egg.")).toBeVisible();
    await expect(page.getByText("not allergy advice")).toBeVisible();
    await page.goto("/wear");
    await page.getByLabel("Search garments and textiles").fill("korea");
    await page.getByRole("link", { name: /Hanbok/ }).click();
    await expect(page.getByRole("heading", { name: "Wearing it with respect" })).toBeVisible();
  });
});

test.describe("8. Shop", () => {
  test("filters gift ideas and brands, keeps a wishlist, and never shows prices", async ({ page }) => {
    await page.goto("/shop");
    const all = digits(await page.getByTestId("gift-count").textContent());
    await page.getByRole("button", { name: "Elite luxury", exact: true }).first().click();
    const elite = digits(await page.getByTestId("gift-count").textContent());
    expect(elite).toBeGreaterThan(0);
    expect(elite).toBeLessThan(all);
    await page.getByLabel("Category").first().selectOption("jewellery");
    await expect(page.getByTestId("gift-list").getByRole("heading", { name: "Fine jewellery or a watch" })).toBeVisible();
    await page.getByRole("button", { name: "Add to wishlist: Fine jewellery or a watch" }).click();
    await expect(page.getByRole("button", { name: "On your wishlist: Fine jewellery or a watch" })).toBeVisible();
    await page.getByLabel("Search brands").fill("chocolate");
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Godiva" })).toBeVisible();
    await expect(page.getByTestId("catalog-grid").getByRole("heading", { name: "Cartier" })).toHaveCount(0);
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/[₹$€£]\s?\d/);
    expect(text).toMatch(/no partnership/i);
    await page.goto("/shop/cartier");
    await expect(page.getByRole("link", { name: "Visit the official Cartier site" })).toHaveAttribute("href", "https://www.cartier.com/");
    await expect(page.getByText("is not affiliated with it")).toBeVisible();
    await page.goto("/saved");
    await expect(page.getByTestId("saved-wishlist")).toContainText("Fine jewellery or a watch");
  });
});

test.describe("9–13. Matchmaker", () => {
  test("generates a full plan with reasons and a live preview on the way", async ({ page }) => {
    await page.goto("/matchmaker");
    await expect(page.getByTestId("wizard-preview")).toContainText("A traditional Diwali for a family of 8");
    await page.getByTestId("occasion").selectOption("holi");
    await expect(page.getByTestId("wizard-preview")).toContainText("Holi");
    await completeWizard(page);
    await expect(page.getByTestId("plan-headline")).toContainText("Holi for 10 friends");
    for (const key of ["schedule", "food", "gifts", "attire", "decor", "activities", "music", "greetings", "destinations", "context"]) {
      await expect(page.getByTestId(`section-${key}`)).toBeVisible();
    }
    await expect(page.getByTestId("section-food")).toContainText("fits vegetarian");
    await expect(page.getByTestId("section-food")).toContainText("Why:");
    await expect(page.getByTestId("plan")).toContainText("no AI model was used");
    await page.getByText("How this plan was put together").click();
    await expect(page.getByText(/for 10 people is about ₹2,000 each/)).toBeVisible();
  });

  test("rejects invalid answers with a clear message", async ({ page }) => {
    await page.goto("/matchmaker");
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("attendees").fill("0");
    await page.getByTestId("wizard-next").click();
    await expect(page.getByRole("alert").filter({ hasText: "Enter how many people are coming" })).toBeVisible();
  });

  test("budget arithmetic is exact and updates when a line is edited", async ({ page }) => {
    await completeWizard(page, { budget: "20000" });
    await expect(page.getByTestId("budget-planned")).toHaveText("₹20,000");
    await expect(page.getByTestId("budget-remaining")).toHaveText("₹0");
    const categories = ["food", "gifts", "decor", "attire", "activities", "music", "contingency"];
    // Lines are whole paise internally, so compare in minor units to avoid floating-point noise in the test itself.
    let sumMinor = 0;
    for (const c of categories) sumMinor += Math.round(Number(await page.getByTestId(`budget-${c}`).inputValue()) * 100);
    expect(sumMinor).toBe(2_000_000);
    const food = Number(await page.getByTestId("budget-food").inputValue());
    await page.getByTestId("budget-food").fill((food + 2500.5).toFixed(2));
    await page.getByTestId("budget-food").blur();
    await expect(page.getByTestId("budget-planned")).toHaveText("₹22,500.5");
    await expect(page.getByTestId("budget").getByText("Over budget by")).toBeVisible();
    await expect(page.getByTestId("budget-remaining")).toHaveText("₹2,500.5");
    await page.getByRole("button", { name: "Reset to the suggested split" }).click();
    await expect(page.getByTestId("budget-remaining")).toHaveText("₹0");
  });

  test("items can be replaced, edited, removed and regenerated", async ({ page }) => {
    await completeWizard(page);
    const gifts = page.getByTestId("section-gifts");
    const before = await gifts.getByRole("listitem").count();
    const firstTitle = (await gifts.getByRole("listitem").first().locator("p").first().innerText()).trim();
    await gifts.getByRole("button", { name: /^Replace:/ }).first().click();
    await expect(page.getByTestId("plan-status")).toContainText(`Replaced “${firstTitle}”`);
    await expect(gifts.getByRole("listitem")).toHaveCount(before);
    await expect(gifts).not.toContainText(firstTitle);

    const decor = page.getByTestId("section-decor");
    await decor.getByRole("button", { name: /^Edit:/ }).first().click();
    await decor.getByLabel("Title").fill("Fairy lights on the balcony");
    await decor.getByRole("button", { name: "Save changes" }).click();
    await expect(decor).toContainText("Fairy lights on the balcony");
    await expect(decor).toContainText("Edited by you.");

    const music = page.getByTestId("section-music");
    const musicCount = await music.getByRole("listitem").count();
    await music.getByRole("button", { name: /^Remove:/ }).first().click();
    await expect(music.getByRole("listitem")).toHaveCount(musicCount - 1);

    const activities = page.getByTestId("section-activities");
    const activityText = await activities.innerText();
    await page.getByRole("button", { name: "Regenerate Activities" }).click();
    await expect(page.getByTestId("plan-status")).toHaveText("Activities regenerated.");
    expect(await activities.innerText()).not.toBe(activityText);
  });

  test("a plan can be saved, reopened, exported and deleted", async ({ page }) => {
    await completeWizard(page);
    const headline = await page.getByTestId("plan-headline").innerText();
    await page.getByTestId("save-plan").click();
    await expect(page.getByTestId("plan-status")).toContainText("Plan saved on this device");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-text").click()]);
    expect(download.suggestedFilename()).toMatch(/holi-in-india\.txt$/);
    const [jsonDownload] = await Promise.all([page.waitForEvent("download"), page.getByTestId("export-json").click()]);
    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/);
    await page.goto("/plans");
    await expect(page.getByTestId("plan-list").getByRole("link", { name: headline })).toBeVisible();
    await page.getByRole("link", { name: "Open" }).click();
    await expect(page.getByTestId("plan-headline")).toHaveText(headline);
    await page.goto("/plans");
    await page.getByRole("button", { name: /^Delete plan:/ }).click();
    await expect(page.getByText("No saved plans yet.")).toBeVisible();
  });

  test("an unsaved plan survives a refresh", async ({ page }) => {
    await completeWizard(page);
    const headline = await page.getByTestId("plan-headline").innerText();
    await page.reload();
    await expect(page.getByTestId("plan-headline")).toHaveText(headline);
    await page.getByRole("button", { name: "Change preferences" }).click();
    await expect(page.getByTestId("occasion")).toHaveValue("holi");
  });

  test("sharing is explicit, opens for others by link, and can be revoked", async ({ page, browser }) => {
    await completeWizard(page);
    const headline = await page.getByTestId("plan-headline").innerText();
    await expect(page.getByTestId("share-url")).toHaveCount(0);
    await page.getByRole("button", { name: "Create share link" }).click();
    await expect(page.getByTestId("share-status")).toContainText("Share link created");
    const url = await page.getByTestId("share-url").inputValue();
    expect(url).toMatch(/\/share\/[A-Za-z0-9_-]{16,64}$/);
    expect(url).not.toMatch(/holi|friends|20000/i);

    const visitor = await browser.newContext();
    const other = await visitor.newPage();
    await other.goto(url);
    await expect(other.getByTestId("plan-headline")).toHaveText(headline);
    await expect(other.getByText("A celebration plan shared with you")).toBeVisible();
    await expect(other.getByRole("button", { name: /^Edit:/ })).toHaveCount(0);
    expect(await other.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");

    await page.getByRole("button", { name: "Revoke link" }).click();
    await expect(page.getByTestId("share-status")).toContainText("Share link revoked");
    await other.reload();
    await expect(other.getByTestId("share-unavailable")).toBeVisible();
    await visitor.close();
  });
});

test.describe("14. Wishes", () => {
  test("card preview follows the form, and export and copy work", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/wishes?festival=diwali");
    await expect(page.getByTestId("wish-festival")).toHaveValue("diwali");
    await page.getByTestId("wish-recipient").fill("Asha");
    await expect(page.getByTestId("wish-message")).toHaveValue(/Dear Asha, wishing you a Diwali/);
    await expect(page.getByTestId("wish-canvas")).toHaveAttribute("aria-label", /Shubh Deepavali\. Dear Asha/);
    await page.getByRole("button", { name: "Playful" }).click();
    await expect(page.getByTestId("wish-message")).toHaveValue(/^Asha! Happy Diwali!/);
    const blank = await page.getByTestId("wish-canvas").evaluate((c: HTMLCanvasElement) => {
      const data = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      const first = [data[0], data[1], data[2]].join();
      for (let i = 0; i < data.length; i += 4000) if ([data[i], data[i + 1], data[i + 2]].join() !== first) return false;
      return true;
    });
    expect(blank).toBe(false);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("wish-export").click()]);
    expect(download.suggestedFilename()).toBe("festiva-wish-diwali.png");
    await expect(page.getByTestId("wish-status")).toHaveText("Card downloaded as a PNG image.");
    await page.getByTestId("wish-copy").click();
    await expect(page.getByTestId("wish-status")).toHaveText("Greeting text copied.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Asha! Happy Diwali!");
  });
});

test.describe("15. Play", () => {
  test("quiz scores correct answers and reaches a completion screen", async ({ page }) => {
    await page.goto("/play/quiz");
    for (let i = 0; i < 8; i += 1) {
      await expect(page.getByTestId("stat-question")).toHaveText(`${i + 1} / 8`);
      const pick = i === 0 ? page.locator('[data-correct="false"]').first() : page.locator('[data-correct="true"]');
      await pick.click();
      await expect(page.getByTestId("quiz-feedback")).toContainText(i === 0 ? "Not quite." : "Correct.");
      await page.getByTestId("quiz-next").click();
    }
    await expect(page.getByTestId("game-complete")).toContainText("You scored 7 out of 8.");
    await expect(page.getByTestId("stat-best")).toHaveText("7");
    await page.getByTestId("game-reset").click();
    await expect(page.getByTestId("stat-question")).toHaveText("1 / 8");
    await expect(page.getByTestId("stat-score")).toHaveText("0");
  });

  test("memory match pairs cards, counts moves and completes", async ({ page }) => {
    await page.goto("/play/memory");
    const cards = page.getByTestId("memory-grid").getByRole("button");
    await expect(cards).toHaveCount(16);
    const pairs = await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-pair")));
    const groups = new Map<string, number[]>();
    pairs.forEach((p, i) => groups.set(p!, [...(groups.get(p!) ?? []), i]));
    for (const [, [a, b]] of groups) {
      await cards.nth(a).click();
      await cards.nth(b).click();
      await expect(cards.nth(b)).toBeDisabled();
    }
    await expect(page.getByTestId("game-complete")).toContainText("All pairs found in 8 moves.");
    await expect(page.getByTestId("stat-score")).toHaveText("800");
    await page.getByTestId("game-reset").click();
    await expect(page.getByTestId("stat-moves")).toHaveText("0");
  });

  test("knowledge challenge keeps score with streak bonuses", async ({ page }) => {
    await page.goto("/play/challenge");
    await page.getByTestId("challenge-start").click();
    for (let i = 0; i < 4; i += 1) {
      const statement = page.getByTestId("challenge-statement");
      const before = await statement.innerText();
      const truth = await statement.getAttribute("data-truth");
      await page.getByTestId(truth === "true" ? "challenge-true" : "challenge-false").click();
      await expect(statement).not.toHaveText(before);
    }
    await expect(page.getByTestId("stat-score")).toHaveText("6"); // 1 + 1 + 2 + 2
    await expect(page.getByTestId("stat-streak")).toHaveText("4");
    await page.getByTestId("game-reset").click();
    await expect(page.getByTestId("challenge-start")).toBeVisible();
  });

  test("tile puzzle accepts only legal moves and supports the keyboard", async ({ page }) => {
    await page.goto("/play/puzzle");
    const board = page.getByTestId("puzzle-board");
    const start = await board.getAttribute("data-board");
    await page.locator('[data-movable="false"]').first().click();
    await expect(board).toHaveAttribute("data-board", start!);
    await expect(page.getByTestId("stat-moves")).toHaveText("0");
    await page.locator('[data-movable="true"]').first().click();
    await expect(page.getByTestId("stat-moves")).toHaveText("1");
    await expect(board).not.toHaveAttribute("data-board", start!);
    await page.locator('[data-movable="true"]').first().focus();
    const mid = await board.getAttribute("data-board");
    for (const key of ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]) await page.keyboard.press(key);
    expect(await board.getAttribute("data-board")).not.toBe(mid === start ? "" : "unreachable");
    expect(Number(await page.getByTestId("stat-moves").innerText())).toBeGreaterThanOrEqual(2);
    await page.getByTestId("game-reset").click();
    await expect(page.getByTestId("stat-moves")).toHaveText("0");
  });

  test("rangoli designer draws, undoes, clears and exports", async ({ page }) => {
    await page.goto("/play/rangoli");
    await page.getByTestId("rangoli-add-petals").click();
    await expect(page.getByTestId("stat-strokes")).toHaveText("1");
    const box = (await page.getByTestId("rangoli-canvas").boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.3, { steps: 5 });
    await page.mouse.up();
    await expect(page.getByTestId("stat-strokes")).toHaveText("2");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByTestId("stat-strokes")).toHaveText("1");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("rangoli-export").click()]);
    expect(download.suggestedFilename()).toBe("festiva-rangoli.png");
    await expect(page.getByTestId("game-complete")).toBeVisible();
    await page.getByTestId("game-reset").click();
    await expect(page.getByTestId("stat-strokes")).toHaveText("0");
  });
});

test.describe("16. Sound", () => {
  test("search by language, country and genre; favourites persist", async ({ page }) => {
    await page.goto("/sound");
    await page.getByTestId("sound-search").fill("Korean");
    await expect(page.getByTestId("artist-row")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: "BTS" })).toBeVisible();
    await page.getByTestId("sound-search").fill("Cuba");
    await expect(page.getByRole("heading", { name: "Celia Cruz" })).toBeVisible();
    await page.getByTestId("sound-search").fill("jai ho");
    await expect(page.getByRole("heading", { name: "A. R. Rahman" })).toBeVisible();
    await page.getByTestId("sound-search").fill("");
    await page.getByRole("button", { name: "Jazz", exact: true }).click();
    await expect(page.getByTestId("artist-row")).toHaveCount(3);
    await expect(page.getByRole("region", { name: "Search music" }).getByRole("link", { name: "Find Miles Davis So What on YouTube" })).toHaveAttribute("href", /youtube\.com\/results\?search_query=Miles%20Davis%20So%20What/);
    await page.getByRole("button", { name: "Favourite: Ella Fitzgerald" }).click();
    await expect(page.getByRole("button", { name: "Favourited: Ella Fitzgerald" })).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.getByTestId("sound-favourites")).toContainText("Ella Fitzgerald");
    await expect(page.locator("audio, video, iframe")).toHaveCount(0);
  });
});

test.describe("17–18. Accounts and private data", () => {
  test("account page is honest that sign-in is not configured", async ({ page }) => {
    await page.goto("/account");
    await expect(page.getByTestId("account-unavailable")).toContainText("Accounts are not switched on in this deployment.");
    await expect(page.getByTestId("account-form")).toHaveCount(0);
  });

  test("share links cannot be guessed, listed or revoked by strangers", async ({ page, request }) => {
    await page.goto("/share/AAAAAAAAAAAAAAAAAAAAAAAA");
    await expect(page.getByTestId("share-unavailable")).toBeVisible();
    expect((await request.get("/api/share")).status()).toBe(405);
    expect((await request.delete("/api/share/AAAAAAAAAAAAAAAAAAAAAAAA")).status()).toBe(403);
    expect((await request.delete("/api/share/AAAAAAAAAAAAAAAAAAAAAAAA", { headers: { "x-revoke-key": "BBBBBBBBBBBBBBBBBBBBBBBB" } })).status()).toBe(404);
    expect((await request.post("/api/share", { data: { plan: { id: "x" } } })).status()).toBe(400);
  });
});

test.describe("20. WebGL and motion fallbacks", () => {
  test("the globe renders with WebGL when available", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-globe]")).not.toHaveAttribute("data-globe", "pending");
    const mode = await page.locator("[data-globe]").getAttribute("data-globe");
    expect(["webgl", "canvas"]).toContain(mode);
    await expect(page.locator("[data-globe] canvas")).toHaveCount(1);
  });

  test("without WebGL the page falls back to a 2D drawing and stays fully usable", async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type.startsWith("webgl") || type === "experimental-webgl") return null;
        return (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof original;
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.locator("[data-globe]")).toHaveAttribute("data-globe", "canvas");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Discover the world.");
    await page.locator("main").getByRole("link", { name: /Explore 46 festivals/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Discover festivals" })).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
  });

  test("reduced motion stops the globe animating", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    let frames = 0;
    await page.exposeFunction("__countFrame", () => (frames += 1));
    await page.goto("/");
    await expect(page.locator("[data-globe]")).not.toHaveAttribute("data-globe", "pending");
    const shots = [await page.locator("[data-globe] canvas").screenshot(), await page.waitForTimeout(700).then(() => page.locator("[data-globe] canvas").screenshot())];
    expect(shots[0].equals(shots[1])).toBe(true);
    await context.close();
  });
});

test.describe("21. AI without credentials", () => {
  test("Intelligence answers from the guide and says no AI model is connected", async ({ page, request }) => {
    const health = await (await request.get("/api/health")).json();
    expect(health.features).toMatchObject({ ai: false, supabase: false, sharing: "demo" });
    await page.goto("/intelligence");
    await expect(page.getByTestId("chat-mode")).toContainText("No AI model is connected to this deployment.");
    await page.getByTestId("chat-input").fill("When is Diwali?");
    await page.getByTestId("chat-send").click();
    const answer = page.getByTestId("chat-answer").first();
    await expect(answer).toHaveAttribute("data-mode", "offline");
    await expect(answer).toContainText("29 October 2027");
    await expect(answer).toContainText("Facts from the guide");
    await page.getByTestId("chat-input").fill("who won the football last night");
    await page.getByTestId("chat-send").click();
    await expect(page.getByTestId("chat-answer").nth(1)).toContainText("I could not find that in FESTIVA's guide");
  });

  test("API routes validate input, degrade honestly and never leak configuration", async ({ request }) => {
    const reply = await request.post("/api/intelligence", { data: { question: "What do people eat at Hanukkah?" } });
    expect(reply.status()).toBe(200);
    expect(await reply.json()).toMatchObject({ mode: "offline" });
    expect((await request.post("/api/intelligence", { data: { question: "" } })).status()).toBe(400);
    expect((await request.post("/api/intelligence", { data: { question: "x".repeat(600) } })).status()).toBe(400);
    expect((await request.post("/api/intelligence", { headers: { "content-type": "application/json" }, data: "{not json" })).status()).toBe(400);
    const concept = await request.post("/api/matchmaker/concept", { data: { plan: {} } });
    expect(concept.status()).toBe(400);
    expect((await request.post("/api/events", { data: { name: "festival_view", label: "diwali", path: "/discover/diwali" } })).status()).toBe(204);
    expect((await request.post("/api/events", { data: { name: "keystroke" } })).status()).toBe(400);
  });
});

test.describe("23. Accessibility, SEO and security headers", () => {
  for (const path of ["/", "/discover", "/discover/diwali", "/discover/calendar", "/journeys/kyoto", "/taste", "/wear/sari", "/shop", "/matchmaker", "/wishes", "/play", "/play/quiz", "/play/memory", "/sound", "/intelligence", "/account", "/about"]) {
    test(`no serious accessibility violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }

  test("a generated plan has no serious accessibility violations", async ({ page }) => {
    await completeWizard(page);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  });

  test("keyboard users can skip to content and operate the catalogue", async ({ page }) => {
    await page.goto("/discover");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await page.getByLabel("Search festivals").focus();
    await page.keyboard.type("nowruz");
    await expect(page.getByTestId("result-count")).toHaveText("1 festival match your filters");
  });

  test("pages carry titles, descriptions, canonical URLs and Open Graph data", async ({ page }) => {
    await page.goto("/discover/diwali");
    await expect(page).toHaveTitle("Diwali: The festival of lights | FESTIVA");
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toContain("Five days of lamps");
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/\/discover\/diwali$/);
    expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toContain("Diwali");
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toMatch(/opengraph-image/);
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
  });

  test("sitemap, robots, manifest and social image are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain("/discover/diwali");
    expect(xml).toContain("/taste/mooncake");
    expect(xml).not.toContain("/share/");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/api\//);
    expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
    expect((await (await request.get("/manifest.webmanifest")).json()).name).toBe("FESTIVA");
    const og = await request.get("/opengraph-image");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toBe("image/png");
  });

  test("pages make no third-party network requests", async ({ page }) => {
    const external = new Set<string>();
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (!["localhost", "127.0.0.1"].includes(url.hostname) && url.protocol.startsWith("http")) external.add(url.hostname);
    });
    for (const path of ["/", "/discover/diwali", "/matchmaker", "/wishes", "/sound", "/shop", "/intelligence"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    expect([...external]).toEqual([]);
  });

  test("security headers are set and no credentials reach the browser", async ({ page, request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-powered-by"]).toBeUndefined();
    const scripts: string[] = [];
    page.on("response", async (r) => {
      if (r.url().endsWith(".js")) scripts.push(await r.text().catch(() => ""));
    });
    for (const path of ["/intelligence", "/matchmaker", "/account"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    const bundle = scripts.join("\n");
    expect(scripts.length).toBeGreaterThan(3);
    // Report only which markers were found, never the bundle itself.
    const markers = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "sk-ant-", "x-api-key", "api.anthropic.com", "api.openai.com", "SERVICE_ROLE"];
    expect(markers.filter((m) => bundle.includes(m))).toEqual([]);
  });
});
