import { expect, test } from "@playwright/test";
import { ADMIN_TOKEN, anonFor, circleKey, createCircleGuided, join, noSeriousViolations, signInAdmin, withAnon } from "./helpers";

/**
 * Gift Circle in demo mode: no Sarvam, Flagsmith or NudgeBee configured.
 * Flags use FESTIVA's defaults, voice and translation are honestly unavailable,
 * and everything else works end to end. The provider-backed paths are covered
 * by tests/e2e-integrations against local test doubles.
 */

test.describe("Gift Circle: the connected journey without providers", () => {
  test("create, invite, join, share preferences, organise, draw Secret Santa and summarise", async ({ page, browser }) => {
    test.setTimeout(120_000);
    await withAnon(page, anonFor("guided"));
    await page.goto("/circles");
    await expect(page.getByRole("heading", { level: 1, name: "Gift Circle" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gift Circle" })).toBeVisible();

    const { id, link } = await createCircleGuided(page, { language: "kn-IN" });

    const asha = await join(browser, link, "Asha", "hi-IN");
    const ravi = await join(browser, link, "Ravi", "ta-IN");

    // Voice and translation say plainly that Sarvam is not configured; typing works.
    await expect(asha.page.getByTestId("voice-unavailable")).toContainText("Sarvam, which is not configured");
    await expect(asha.page.getByTestId("mode-voice")).toBeDisabled();
    await asha.page.getByLabel(/What would you love to receive/).fill("I love handmade things, especially block-printed cotton stoles. No sweets please.");
    await expect(asha.page.getByText("Translation needs Sarvam, which is not configured on this server.")).toBeVisible();
    await asha.page.getByRole("button", { name: "Review details" }).click();
    const review = asha.page.getByTestId("preference-review");
    await expect(review.getByRole("button", { name: "Craft and culture" })).toHaveAttribute("aria-pressed", "true");
    await expect(review.getByText(/FESTIVA's rules filled in the fields/)).toBeVisible();
    await expect(review.getByLabel("Things to avoid")).toHaveValue("sweets");
    await review.getByRole("button", { name: "Save preference" }).click();
    const card = asha.page.getByTestId("preference-card");
    await expect(card).toContainText("block-printed cotton stoles");
    await expect(card).toContainText("Details suggested by FESTIVA's rules");

    // Wishlist, with an item above the per-gift budget, and a contribution.
    await asha.page.getByLabel("Add something you would like").fill("Block-printed cotton stole");
    await asha.page.getByLabel(/Rough cost/).fill("2000");
    await asha.page.getByRole("button", { name: "Add to wishlist" }).click();
    await expect(asha.page.getByTestId("wishlist")).toContainText("above the per-gift budget");
    await asha.page.getByLabel(/How much will you put in/).fill("3000");
    await asha.page.getByRole("button", { name: "Save my commitment" }).click();
    await expect(asha.page.getByText("Your commitment is recorded.")).toBeVisible();

    // The organiser sees everyone, the preference in Asha's words, and budget insights.
    await page.reload();
    await expect(page.getByTestId("participants").getByRole("listitem")).toHaveCount(3);
    await expect(page.getByTestId("all-preferences")).toContainText("block-printed cotton stoles");
    await expect(page.getByTestId("budget-insights")).toContainText("₹3,000");
    await expect(page.getByTestId("suggestions")).toBeVisible();

    // Secret Santa: the organiser draws, sees only a count; each participant sees their own match.
    await page.getByTestId("draw-names").click();
    await expect(page.getByTestId("santa-panel")).toContainText("for 3 people");
    await asha.page.reload();
    // The match stays wrapped until the participant chooses to open it, then stays open on this device.
    await expect(asha.page.getByTestId("santa-gift")).toBeVisible();
    await expect(asha.page.getByTestId("my-recipient")).toHaveCount(0);
    await asha.page.getByRole("button", { name: "Unwrap your match" }).click();
    await expect(asha.page.getByTestId("my-recipient")).toContainText("You are giving to");
    await asha.page.reload();
    await expect(asha.page.getByTestId("my-recipient")).toBeVisible();
    const recipient = (await asha.page.getByTestId("my-recipient").locator("p").first().textContent()) ?? "";
    expect(recipient).not.toContain("Asha.");

    // Participants cannot do organiser things, or read the circle with a made-up key.
    const ashaKey = await circleKey(asha.page, id);
    expect((await asha.page.request.post(`/api/circles/${id}/secret-santa`, { headers: { authorization: `Bearer ${ashaKey}` } })).status()).toBe(403);
    expect((await asha.page.request.get(`/api/circles/${id}`, { headers: { authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" } })).status()).toBe(401);
    const organiserJson = await (await page.request.get(`/api/circles/${id}`, { headers: { authorization: `Bearer ${await circleKey(page, id)}` } })).json();
    expect(JSON.stringify(organiserJson)).not.toContain("receiverId");

    // Summary.
    await page.goto(`/circles/${id}/summary`);
    await expect(page.getByTestId("circle-summary")).toContainText("Everyone, in their own words");
    await expect(page.getByTestId("circle-summary")).toContainText("block-printed cotton stoles");
    await expect(page.getByRole("link", { name: "Plan the celebration in the Matchmaker" })).toHaveAttribute("href", /occasion=diwali/);

    // A participant can delete their own preference.
    await asha.page.getByTestId("preference-card").getByRole("button", { name: "Delete" }).click();
    await expect(asha.page.getByTestId("preference-card")).toHaveCount(0);

    await asha.context.close();
    await ravi.context.close();
  });

  test("the single-page onboarding variant creates a circle too", async ({ page }) => {
    await withAnon(page, anonFor("single_page"));
    await page.goto("/circles/new");
    await expect(page.getByTestId("onboarding")).toHaveAttribute("data-variant", "single_page");
    for (const legend of ["Occasion", "Dates", "Budget", "You"]) await expect(page.getByRole("group", { name: legend })).toBeVisible();
    await page.getByLabel("Your name").fill("Meera");
    await page.getByRole("button", { name: "Create the circle" }).click();
    await expect(page.getByTestId("organiser-circle-name")).toHaveText("Diwali gift circle");
  });

  test("onboarding validates dates in the browser and on the server", async ({ page }) => {
    await withAnon(page, anonFor("single_page"));
    await page.goto("/circles/new");
    await page.getByLabel("Celebration date").fill("2027-01-10");
    await page.getByLabel("Contribution deadline").fill("2027-01-20");
    await page.getByLabel("Your name").fill("Meera");
    await page.getByRole("button", { name: "Create the circle" }).click();
    await expect(page.getByTestId("onboarding-error")).toContainText("on or before the celebration date");
    const bad = await page.request.post("/api/circles", { data: { elapsedMs: null, circle: { name: "x", organiserName: "x", festivalSlug: null, occasionLabel: "x", celebrationDate: "2027-01-10", contributionDeadline: "2027-01-20", currency: "INR", totalBudget: 1, perPersonBudget: null, giftTier: "everyday", maxParticipants: 5, organiserLanguage: "en-IN", onboardingVariant: "guided" } } });
    expect(bad.status()).toBe(400);
  });

  test("revoked and malformed invitations cannot be used", async ({ page, browser }) => {
    await withAnon(page, anonFor("guided", "r"));
    const { link } = await createCircleGuided(page);
    await page.getByRole("button", { name: "Revoke the link" }).click();
    const context = await browser.newContext();
    const other = await context.newPage();
    await other.goto(link);
    await expect(other.getByTestId("join-problem")).toContainText("cannot be used");
    await other.goto("/circles/join#c=nope&t=short");
    await expect(other.getByTestId("join-problem")).toContainText("incomplete");
    await context.close();
  });

  test("voice API rejects requests without Sarvam, consent or real audio", async ({ page }) => {
    await withAnon(page, anonFor("guided", "v"));
    const { id } = await createCircleGuided(page);
    const key = await circleKey(page, id);
    const response = await page.request.post(`/api/circles/${id}/voice`, { headers: { authorization: `Bearer ${key}` }, multipart: { consent: "true", language: "hi-IN", audio: { name: "a.wav", mimeType: "audio/wav", buffer: Buffer.from("RIFF") } } });
    expect(response.status()).toBe(503);
    expect((await response.json()).code).toBe("not_configured");
  });

  test("Gift Circle pages have no serious accessibility violations", async ({ page, browser }) => {
    test.setTimeout(90_000);
    await withAnon(page, anonFor("guided", "a"));
    for (const path of ["/circles", "/circles/new"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await noSeriousViolations(page);
    }
    const { link } = await createCircleGuided(page);
    await page.waitForLoadState("networkidle");
    await noSeriousViolations(page);
    const guest = await join(browser, link, "Asha");
    await guest.page.waitForLoadState("networkidle");
    await noSeriousViolations(guest.page);
    await guest.context.close();
  });
});

test.describe("Administration: integration status and operations", () => {
  test("admin pages are closed without the token, and a participant key is not an admin key", async ({ page, request }) => {
    expect((await request.get("/api/admin/integrations")).status()).toBe(401);
    expect((await request.get("/api/admin/ops")).status()).toBe(401);
    expect((await request.get("/api/admin/ops", { headers: { authorization: "Bearer not-the-admin-token-000000" } })).status()).toBe(401);
    expect((await request.get("/api/ops/metrics")).status()).toBe(401);
    await page.goto("/admin/integrations");
    await page.getByLabel("Admin token").fill("wrong-token-wrong-token-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByTestId("admin-error")).toContainText("not correct");
  });

  test("integration status says Not configured and shows the setup guides", async ({ page }) => {
    await signInAdmin(page, "/admin/integrations");
    for (const id of ["sarvam", "flagsmith", "nudgebee"]) await expect(page.getByTestId(`integration-${id}`).getByTestId("state-badge")).toHaveAttribute("data-state", "not_configured");
    await expect(page.getByTestId("sarvam-setup")).toBeVisible();
    await expect(page.getByTestId("flagsmith-setup")).toBeVisible();
    await expect(page.getByTestId("flag-source")).toHaveText("defaults");
    await expect(page.getByTestId("flag-gift_circle_enabled")).toHaveText("On");
    await expect(page.getByTestId("experiment-verdict")).toContainText("Not enough data to compare");
    await page.getByTestId("test-test_sarvam").click();
    await expect(page.getByTestId("result-test_sarvam")).toContainText("Sarvam is not configured");
    await expect(page.getByTestId("integration-sarvam").getByTestId("state-badge")).toHaveAttribute("data-state", "not_configured");
    await expect(page.getByTestId("nudgebee-prerequisites")).toContainText("not running in Kubernetes");
  });

  test("a controlled latency test fires an alert; a runbook runs only after approval; everything is audited", async ({ page }) => {
    test.setTimeout(120_000);
    await signInAdmin(page, "/admin/operations");
    await expect(page.getByTestId("telemetry")).toBeVisible();
    await page.getByTestId("start-latency-test").click();
    await page.getByTestId("confirm-dialog").getByRole("button", { name: "Start test" }).click();
    await expect(page.getByTestId("controls")).toContainText("adding 1800 ms");

    // Real requests to the Gift Circle API, slowed by the controlled test.
    for (let i = 0; i < 6; i += 1) await page.request.get("/api/circles/00000000-0000-4000-8000-000000000000");
    await page.getByTestId("evaluate-rules").click();
    const alert = page.getByTestId("alert-events").getByRole("listitem").first();
    await expect(alert).toContainText("[Controlled test] Gift Circle API latency is high");
    await expect(alert).toContainText("ran during a controlled latency test");
    await expect(alert).toContainText("NudgeBee: not sent, because the Event Webhook is not configured");

    const pending = page.getByTestId("pending-proposals").getByRole("listitem").filter({ hasText: "End controlled tests" });
    await expect(pending).toBeVisible();
    await expect(pending.getByTestId("approve")).toBeDisabled();
    await pending.getByTestId("approval-note").fill("The latency came from our own controlled test");
    await pending.getByTestId("approve").click();
    await page.getByTestId("confirm-dialog").getByRole("button", { name: "Approve and run" }).click();
    await expect(page.getByTestId("decided-proposals")).toContainText("End controlled tests: executed");
    await expect(page.getByTestId("controls")).toContainText("Latency test: off");
    await expect(page.getByTestId("audit-log")).toContainText("runbook.approved");
    await expect(page.getByTestId("audit-log")).toContainText("controlled_test.started");

    const metrics = await page.request.get("/api/ops/metrics", { headers: { authorization: `Bearer ${ADMIN_TOKEN}` } });
    expect(metrics.status()).toBe(200);
    expect(await metrics.text()).toContain('festiva_http_requests_total{route="/api/circles/[id]"');
    await noSeriousViolations(page);
  });

  test("no sponsor secrets, secret names or provider endpoints reach browser bundles", async ({ page }) => {
    const collect = async (paths: string[]) => {
      const scripts: string[] = [];
      const listener = async (r: import("@playwright/test").Response) => {
        if (r.url().endsWith(".js")) scripts.push(await r.text().catch(() => ""));
      };
      page.on("response", listener);
      for (const path of paths) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
      }
      page.off("response", listener);
      return scripts.join("\n");
    };
    await withAnon(page, anonFor("guided", "b"));
    // Provider code and endpoints are server-only everywhere.
    const providerMarkers = ["api-subscription-key", "api.sarvam.ai", "edge.api.flagsmith.com", "/api/webhooks/event", "SERVICE_ROLE", "sk-nb-", "ser.stub"];
    // Public Gift Circle pages must not even name the secret variables.
    const publicBundle = await collect(["/circles", "/circles/new", "/circles/join"]);
    expect([...providerMarkers, "SARVAM_API_KEY", "FLAGSMITH_ENVIRONMENT_KEY", "NUDGEBEE_EVENT_WEBHOOK_TOKEN", "NUDGEBEE_API_TOKEN", "FESTIVA_ADMIN_TOKEN", "FESTIVA_METRICS_TOKEN"].filter((m) => publicBundle.includes(m))).toEqual([]);
    // Admin pages name variables in their setup instructions, but carry no provider code.
    const adminBundle = await collect(["/admin/integrations", "/admin/operations"]);
    expect(providerMarkers.filter((m) => adminBundle.includes(m))).toEqual([]);
  });

  test("the microphone is allowed for this site only", async ({ request }) => {
    const response = await request.get("/circles");
    expect(response.headers()["permissions-policy"]).toContain("microphone=(self)");
    expect(response.headers()["content-security-policy"]).toContain("media-src 'self' blob:");
  });
});
