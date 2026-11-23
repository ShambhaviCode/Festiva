import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Sarvam, Flagsmith and NudgeBee code paths against LOCAL TEST DOUBLES.
 * See playwright.integrations.config.ts for what this does and does not prove.
 */

const STUB = "http://localhost:4010";
const ADMIN = { authorization: "Bearer e2e-admin-token-0123456789abcdef" };

function wav(seconds: number): Buffer {
  const rate = 16000;
  const data = Math.round(seconds * rate * 2);
  const b = Buffer.alloc(44 + data);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + data, 4);
  b.write("WAVE", 8);
  b.write("fmt ", 12);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(data, 40);
  return b;
}

async function setFlag(page: Page, name: string, enabled: boolean) {
  const response = await page.request.post(`${STUB}/__stub/flag`, { data: { name, enabled } });
  expect(response.ok()).toBe(true);
}

/** Create a circle with whichever onboarding variant Flagsmith assigned. */
async function createCircle(page: Page, organiserLanguage: string) {
  await page.goto("/circles/new");
  const form = page.getByTestId("onboarding");
  await expect(form).toBeVisible();
  const variant = await form.getAttribute("data-variant");
  if (variant === "guided") {
    for (let i = 0; i < 3; i += 1) await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByLabel("Your name").fill("Shambhavi");
  await page.getByLabel("Your language").selectOption(organiserLanguage);
  await page.getByRole("button", { name: "Create the circle" }).click();
  await expect(page.getByTestId("organiser-circle-name")).toBeVisible();
  const id = page.url().split("/circles/")[1];
  await page.getByTestId("create-invite").click();
  return { id, link: await page.getByTestId("invite-link").inputValue(), variant };
}

async function join(browser: Browser, link: string, name: string, language: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(link);
  await page.getByLabel("Your name, as the circle will see it").fill(name);
  await page.getByLabel("The language you would like to use").selectOption(language);
  await page.getByRole("button", { name: "Join the circle" }).click();
  await expect(page.getByTestId("participant-circle-name")).toBeVisible();
  const key: string = await page.evaluate(() => JSON.parse(window.localStorage.getItem("festiva.circles") ?? "[]")[0].key);
  return { context, page, key };
}

test.beforeEach(async ({ page }) => {
  for (const name of ["gift_circle_enabled", "sarvam_voice_enabled"]) await setFlag(page, name, true);
  // FESTIVA re-reads the Flagsmith environment every 5 seconds in this suite: wait until it has.
  await expect
    .poll(async () => {
      const flags = (await (await page.request.get("/api/flags")).json()).flags;
      return flags.gift_circle_enabled && flags.sarvam_voice_enabled;
    }, { timeout: 20_000 })
    .toBe(true);
});

test("admin status labels every provider as a local test double, never as connected", async ({ page }) => {
  const status = await (await page.request.get("/api/admin/integrations", { headers: ADMIN })).json();
  expect(status.sarvam.state).toBe("test_stub");
  expect(status.flagsmith.state).toBe("test_stub");
  expect(status.nudgebee.state).toBe("test_stub");
  expect(status.flagsmith.evaluation.source).toBe("flagsmith");
  // Remote configuration from the environment document, validated.
  expect(status.flagsmith.evaluation.config).toEqual({ max_participants: 12, max_recording_seconds: 20, recommendation_count: 3, invite_expiry_days: 7 });
  expect(status.flagsmith.evaluation.onboarding.assignedBy).toBe("flagsmith");
  expect(JSON.stringify(status)).not.toContain("stub-sarvam-key");
  expect(JSON.stringify(status)).not.toContain("stub-nudgebee-token");
});

test("voice preference in Kannada: transcribe, correct, translate, structure and save, original kept apart", async ({ page, browser }) => {
  const { id, link } = await createCircle(page, "hi-IN");
  const asha = await join(browser, link, "Asha", "kn-IN");
  const p = asha.page;

  await p.getByTestId("mode-voice").click();
  await expect(p.getByTestId("voice-panel")).toContainText("Up to 20 seconds");
  await p.getByTestId("voice-consent").check();
  await p.getByTestId("voice-upload").setInputFiles({ name: "preference.wav", mimeType: "audio/wav", buffer: wav(2) });
  await p.getByTestId("transcribe").click();
  const transcript = p.getByLabel("Check the transcript and correct anything Sarvam misheard");
  await expect(transcript).toHaveValue(/ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ/);
  await expect(transcript).toHaveAttribute("lang", "kn-IN");
  await expect(p.getByTestId("transcript-meta")).toContainText("Transcribed by Sarvam saaras:v4");
  await transcript.fill(`${await transcript.inputValue()}.`);
  await p.getByTestId("translate").click();
  await expect(p.getByTestId("translation-editor")).toContainText("Translation into Hindi");
  await p.getByRole("button", { name: "Review details" }).click();
  await expect(p.getByTestId("preference-review")).toContainText("Suggested by Sarvam's model");
  await p.getByRole("button", { name: "Save preference" }).click();

  const card = p.getByTestId("preference-card");
  await expect(card.locator("blockquote")).toHaveAttribute("lang", "kn-IN");
  await expect(card.locator("blockquote")).toContainText("ಉಡುಗೊರೆಗಳು");
  await expect(card).toContainText("then corrected by the participant");
  await expect(card.getByTestId("preference-translation")).toContainText("मुझे हाथ से बने उपहार पसंद हैं");
  await expect(card).toContainText("The original above is what they said.");

  const stub = await (await page.request.get(`${STUB}/__stub/state`)).json();
  const stt = stub.sarvamCalls.find((c: { path: string }) => c.path === "/speech-to-text");
  expect(stt).toMatchObject({ model: "saaras:v4", language: "kn-IN" });
  expect(stt.bytes).toBeGreaterThan(44);

  // The organiser sees the original first and the translation beneath it.
  await page.goto(`/circles/${id}`);
  await expect(page.getByTestId("all-preferences")).toContainText("ಉಡುಗೊರೆಗಳು");
  await expect(page.getByTestId("all-preferences").getByTestId("preference-translation")).toBeVisible();
  await asha.context.close();
});

test("Sarvam's name cannot be forged: provider details come from server-signed receipts", async ({ page, browser }) => {
  const { id, link } = await createCircle(page, "hi-IN");
  const guest = await join(browser, link, "Kiran", "kn-IN");
  const auth = { authorization: `Bearer ${guest.key}` };
  const original = "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ";
  const structured = { categories: [], likes: ["handmade gifts"], avoid: [], dietary: [], materials: [], notes: "" };
  const save = (extra: Record<string, unknown>) =>
    guest.page.request.post(`/api/circles/${id}/preferences`, {
      headers: auth,
      data: { source: "text", originalText: original, originalLanguage: "kn-IN", translation: null, transcript: null, structured, structuredBy: "person", ...extra },
    });

  // A translation the browser made up, with no receipt or a forged one, is refused.
  const madeUp = { text: "मुझे हाथ से बने उपहार पसंद हैं", language: "hi-IN", model: "sarvam-translate:v1", edited: false };
  expect((await save({ translation: madeUp })).status()).toBe(400);
  expect((await save({ translation: { ...madeUp, receipt: "eyJ2IjoxfQ.forged" } })).status()).toBe(400);

  // A real receipt from this server's Sarvam call is accepted; model and "edited" are worked out on the server.
  const translated = await (await guest.page.request.post(`/api/circles/${id}/translate`, { headers: auth, data: { text: original, from: "kn-IN", to: "hi-IN" } })).json();
  expect(typeof translated.receipt).toBe("string");
  const ok = await save({ translation: { text: translated.text, language: "hi-IN", model: "made-up-model", edited: true, receipt: translated.receipt } });
  expect(ok.status()).toBe(201);
  expect((await ok.json()).preference.translation).toMatchObject({ provider: "sarvam", model: "sarvam-translate:v1", edited: false });

  // The same receipt cannot vouch for a different original.
  const stale = await save({ originalText: "ನನಗೆ ಹೂವುಗಳು ಇಷ್ಟ", translation: { text: translated.text, language: "hi-IN", model: "x", edited: false, receipt: translated.receipt } });
  expect(stale.status()).toBe(400);
  expect((await stale.json()).code).toBe("stale_translation");

  // Another participant's receipt is not valid for this one.
  const other = await join(browser, link, "Dev", "kn-IN");
  const borrowed = await other.page.request.post(`/api/circles/${id}/preferences`, {
    headers: { authorization: `Bearer ${other.key}` },
    data: { source: "text", originalText: original, originalLanguage: "kn-IN", translation: { text: translated.text, language: "hi-IN", model: "x", edited: false, receipt: translated.receipt }, transcript: null, structured, structuredBy: "person" },
  });
  expect(borrowed.status()).toBe(400);

  // A voice transcript without a Sarvam receipt is refused.
  const fakeVoice = await save({ source: "voice", transcript: { model: "saaras:v4", requestId: "fake", detectedLanguage: "kn-IN", languageProbability: 0.99, edited: false } });
  expect(fakeVoice.status()).toBe(400);
  expect((await fakeVoice.json()).code).toBe("unverified_transcript");

  // Fields claimed as Sarvam's without its receipt are saved as the participant's own.
  const claimed = await save({ structuredBy: "sarvam" });
  expect(claimed.status()).toBe(201);
  expect((await claimed.json()).preference.structuredBy).toBe("person");

  await guest.context.close();
  await other.context.close();
});

test("voice requests are validated: consent, real audio, length from remote config, rate limit", async ({ page, browser }) => {
  const { id, link } = await createCircle(page, "hi-IN");
  const guest = await join(browser, link, "Ravi", "kn-IN");
  const post = (fields: Record<string, string>, audio: Buffer, name = "a.wav") =>
    guest.page.request.post(`/api/circles/${id}/voice`, { headers: { authorization: `Bearer ${guest.key}` }, multipart: { ...fields, audio: { name, mimeType: "audio/wav", buffer: audio } } });
  expect((await post({ consent: "false", language: "kn-IN" }, wav(1))).status()).toBe(400);
  expect((await post({ consent: "true", language: "kn-IN" }, Buffer.from("%PDF-1.4 not audio at all"))).status()).toBe(415);
  expect((await post({ consent: "true", language: "es-ES" }, wav(1))).status()).toBe(400);
  const tooLong = await post({ consent: "true", language: "kn-IN" }, wav(25));
  expect(tooLong.status()).toBe(400);
  expect((await tooLong.json()).error).toContain("20 seconds");
  const statuses: number[] = [];
  for (let i = 0; i < 7; i += 1) statuses.push((await post({ consent: "true", language: "kn-IN" }, wav(0.5))).status());
  expect(statuses).toContain(429);
  await guest.context.close();
});

test("a Flagsmith flag change switches voice off and on without a redeploy; typing stays", async ({ page, browser }) => {
  test.setTimeout(120_000);
  const { id, link } = await createCircle(page, "hi-IN");
  const guest = await join(browser, link, "Meera", "kn-IN");
  await expect(guest.page.getByTestId("mode-voice")).toBeEnabled();

  await setFlag(page, "sarvam_voice_enabled", false);
  // Server refresh (5 s here) plus the browser's 10 s re-check.
  await expect(guest.page.getByTestId("mode-voice")).toBeDisabled({ timeout: 30_000 });
  await expect(guest.page.getByTestId("voice-unavailable")).toContainText("switched off");
  await expect(guest.page.getByLabel(/What would you love to receive/)).toBeVisible();
  const refused = await guest.page.request.post(`/api/circles/${id}/voice`, { headers: { authorization: `Bearer ${guest.key}` }, multipart: { consent: "true", language: "kn-IN", audio: { name: "a.wav", mimeType: "audio/wav", buffer: wav(1) } } });
  expect(refused.status()).toBe(403);
  expect((await refused.json()).code).toBe("feature_disabled");

  await setFlag(page, "sarvam_voice_enabled", true);
  await expect(guest.page.getByTestId("mode-voice")).toBeEnabled({ timeout: 30_000 });

  // The whole Gift Circle entry point follows its flag too.
  await setFlag(page, "gift_circle_enabled", false);
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gift Circle" })).toHaveCount(0, { timeout: 30_000 });
  await page.goto("/circles");
  await expect(page.getByTestId("gift-circle-off")).toBeVisible({ timeout: 20_000 });
  expect((await page.request.get(`/api/circles/${id}`, { headers: { authorization: `Bearer ${guest.key}` } })).status()).toBe(403);
  await setFlag(page, "gift_circle_enabled", true);
  await guest.context.close();
});

test("each Gift Circle feature flag switches its feature off on the server, and back on", async ({ page }) => {
  test.setTimeout(180_000);
  const { id } = await createCircle(page, "hi-IN");
  const key: string = await page.evaluate(() => JSON.parse(window.localStorage.getItem("festiva.circles") ?? "[]")[0].key);
  const auth = { authorization: `Bearer ${key}` };
  const flagIs = (name: string, on: boolean) => expect.poll(async () => (await (await page.request.get("/api/flags")).json()).flags[name], { timeout: 20_000 }).toBe(on);
  const checks: { flag: string; probe: () => Promise<boolean> }[] = [
    { flag: "secret_santa_enabled", probe: async () => (await page.request.post(`/api/circles/${id}/secret-santa`, { headers: auth, data: {} })).status() !== 403 },
    { flag: "gift_recommendations_enabled", probe: async () => (await page.request.get(`/api/circles/${id}/suggestions`, { headers: auth })).status() !== 403 },
    { flag: "cultural_context_enabled", probe: async () => (await page.request.post(`/api/circles/${id}/cultural`, { headers: auth, data: {} })).status() !== 403 },
    { flag: "group_budget_insights_enabled", probe: async () => (await (await page.request.get(`/api/circles/${id}`, { headers: auth })).json()).insights !== null },
  ];
  try {
    for (const { flag, probe } of checks) {
      await setFlag(page, flag, false);
      await flagIs(flag, false);
      expect(await probe(), `${flag} off`).toBe(false);
      await setFlag(page, flag, true);
      await flagIs(flag, true);
      expect(await probe(), `${flag} on`).toBe(true);
    }
  } finally {
    for (const { flag } of checks) await setFlag(page, flag, true);
  }
});

test("Sarvam failures raise an alert that reaches NudgeBee; pausing voice runs only after approval", async ({ page, browser }) => {
  test.setTimeout(120_000);
  const { id, link } = await createCircle(page, "hi-IN");
  const guest = await join(browser, link, "Kiran", "kn-IN");
  const second = await join(browser, link, "Lata", "kn-IN");
  // The rule needs at least 3 failures making up half of the attempts in 10 minutes;
  // earlier tests in this run made successful calls, so fail enough to cross that line.
  await page.request.post(`${STUB}/__stub/sarvam/fail`, { data: { count: 8 } });
  for (const who of [guest, second]) {
    for (let i = 0; i < 4; i += 1) {
      const r = await who.page.request.post(`/api/circles/${id}/voice`, { headers: { authorization: `Bearer ${who.key}` }, multipart: { consent: "true", language: "kn-IN", audio: { name: "a.wav", mimeType: "audio/wav", buffer: wav(0.5) } } });
      expect(r.status()).toBe(502);
    }
  }
  await second.context.close();
  await page.request.post("/api/admin/ops", { headers: ADMIN, data: { action: "evaluate" } });

  // NudgeBee (test double) received the event in its documented format.
  const stub = await (await page.request.get(`${STUB}/__stub/state`)).json();
  const event = stub.nudgebeeEvents.find((e: { rule_name: string; status: string }) => e.rule_name === "voice_transcription_failing" && e.status === "firing");
  expect(event).toMatchObject({ title: "FESTIVA: Voice transcription is failing", fingerprint: "festiva:voice_transcription_failing", severity: "high", source_tool: "FESTIVA", subject: { name: "festiva-web", type: "service" } });
  expect(event.description).toContain("provider_unavailable");
  expect(event.labels.controlled_test).toBe("false");

  // The operations centre shows the delivery and NudgeBee's copy of the event.
  await page.goto("/admin/operations");
  await page.getByLabel("Admin token").fill("e2e-admin-token-0123456789abcdef");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("alert-events")).toContainText("Accepted by NudgeBee (HTTP 200)");
  const listed = await (await page.request.post("/api/admin/integrations", { headers: { ...ADMIN, origin: "http://localhost:3220" }, data: { action: "list_nudgebee_events" } })).json();
  expect(listed.ok).toBe(true);
  expect(JSON.stringify(listed.data)).toContain("FESTIVA: Voice transcription is failing");

  // Proposed, not executed: voice still works until a human approves.
  const proposal = page.getByTestId("pending-proposals").getByRole("listitem").filter({ hasText: "Pause voice capture" });
  await expect(proposal).toBeVisible();
  await guest.page.reload();
  await expect(guest.page.getByTestId("mode-voice")).toBeEnabled();
  await proposal.getByTestId("approval-note").fill("Sarvam returning 503s; pausing voice, typing stays");
  await proposal.getByTestId("approve").click();
  await page.getByTestId("confirm-dialog").getByRole("button", { name: "Approve and run" }).click();
  await expect(page.getByTestId("decided-proposals")).toContainText("Pause voice capture: executed");
  await guest.page.reload();
  await expect(guest.page.getByTestId("voice-unavailable")).toContainText("paused by an administrator");
  const paused = await guest.page.request.post(`/api/circles/${id}/voice`, { headers: { authorization: `Bearer ${guest.key}` }, multipart: { consent: "true", language: "kn-IN", audio: { name: "a.wav", mimeType: "audio/wav", buffer: wav(0.5) } } });
  expect((await paused.json()).code).toBe("voice_paused");

  // A NudgeBee workflow may propose the reversal, but cannot run it.
  const proposed = await page.request.post("/api/ops/runbook-proposals", { headers: { authorization: "Bearer e2e-ops-webhook-token-0123456789" }, data: { runbook: "resume_voice_capture", reason: "Sarvam healthy again", nudgebee_event_id: "nb-1" } });
  expect(proposed.status()).toBe(202);
  expect((await page.request.post("/api/ops/runbook-proposals", { headers: { authorization: "Bearer wrong-token-wrong-token-wrong" }, data: { runbook: "resume_voice_capture", reason: "x".repeat(10) } })).status()).toBe(401);
  await page.reload();
  const resume = page.getByTestId("pending-proposals").getByRole("listitem").filter({ hasText: "Resume voice capture" });
  await expect(resume).toContainText("nudgebee-workflow");
  await resume.getByTestId("approval-note").fill("Confirmed recovery in NudgeBee");
  await resume.getByTestId("approve").click();
  await page.getByTestId("confirm-dialog").getByRole("button", { name: "Approve and run" }).click();
  await expect(page.getByTestId("decided-proposals")).toContainText("Resume voice capture: executed");
  await expect(page.getByTestId("audit-log")).toContainText("nudgebee.event_sent");
  await guest.context.close();
});
