// Visual audit: full-page screenshots of every major page at 1440, 768 and 390 px.
//
//   node scripts/visual-audit.mjs <baseUrl> <outDir> [width,width,...] [path-filter]
//
// Seeds one Gift Circle through the public API (organiser plus three participants,
// a preference, a wish, a contribution and a Secret Santa draw) so the circle
// pages show real states, and signs in to the admin pages when E2E_ADMIN_TOKEN
// (or the test default) is accepted. Also reports layout shift and horizontal
// overflow per page.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const [base = "http://localhost:3000", out = "/tmp/visual", widthArg = "1440,768,390", filter = ""] = process.argv.slice(2);
const WIDTHS = widthArg.split(",").map(Number);
const ADMIN = process.env.E2E_ADMIN_TOKEN ?? "e2e-admin-token-0123456789abcdef";
mkdirSync(out, { recursive: true });

async function api(path, init = {}) {
  const response = await fetch(base + path, { ...init, headers: { "content-type": "application/json", "x-festiva-anon": "visualauditanon0001", ...(init.headers ?? {}) } });
  return response.status === 204 ? null : response.json();
}

async function seedCircle() {
  const created = await api("/api/circles", {
    method: "POST",
    body: JSON.stringify({
      elapsedMs: 30000,
      circle: { name: "The Rao family Diwali exchange", organiserName: "Shambhavi", festivalSlug: "diwali", occasionLabel: "Diwali", celebrationDate: "2027-10-29", contributionDeadline: "2027-10-20", currency: "INR", totalBudget: 12000, perPersonBudget: 1500, giftTier: "premium", maxParticipants: 8, organiserLanguage: "hi-IN", onboardingVariant: "guided" },
    }),
  });
  const id = created.circle.id;
  const organiser = { circleId: id, role: "organiser", key: created.organiserKey, participantId: created.participantId, name: created.circle.name, savedAt: new Date().toISOString() };
  const invite = await api(`/api/circles/${id}/invite`, { method: "POST", headers: { authorization: `Bearer ${organiser.key}` } });
  const people = [];
  for (const [name, language] of [["Asha", "kn-IN"], ["Ravi", "ta-IN"], ["Imran", "ur-IN"]]) {
    const joined = await api(`/api/circles/${id}/join`, { method: "POST", body: JSON.stringify({ token: invite.token, name, language }) });
    people.push({ circleId: id, role: "participant", key: joined.participantKey, participantId: joined.participantId, name: created.circle.name, savedAt: new Date().toISOString() });
  }
  const asha = people[0];
  const auth = { authorization: `Bearer ${asha.key}` };
  await api(`/api/circles/${id}/preferences`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      source: "text",
      originalText: "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ. ಹತ್ತಿಯ ಶಾಲು ಇದ್ದರೆ ಚೆನ್ನ.",
      originalLanguage: "kn-IN",
      // No translation: this server has no Sarvam key, and screenshots must not show a translation Sarvam never made.
      translation: null,
      transcript: null,
      structured: { categories: ["cultural", "fashion"], likes: ["handmade"], avoid: ["sweets"], dietary: [], materials: ["cotton"], notes: "" },
      structuredBy: "person",
    }),
  });
  await api(`/api/circles/${id}/preferences`, {
    method: "POST",
    headers: { authorization: `Bearer ${people[2].key}` },
    body: JSON.stringify({ source: "text", originalText: "مجھے کتابیں اور اچھی چائے پسند ہے۔ مٹھائی نہیں، براہ کرم۔", originalLanguage: "ur-IN", translation: null, transcript: null, structured: { categories: [], likes: ["books", "tea"], avoid: ["sweets"], dietary: [], materials: [], notes: "" }, structuredBy: "person" }),
  });
  await api(`/api/circles/${id}/wishlist`, { method: "POST", headers: auth, body: JSON.stringify({ title: "Block-printed cotton stole", category: "fashion", note: "Indigo or madder red", link: null, estimate: 1800, origin: "manual" }) });
  await api(`/api/circles/${id}/contribution`, { method: "PUT", headers: auth, body: JSON.stringify({ amount: 3000, status: "pledged" }) });
  await api(`/api/circles/${id}/contribution`, { method: "PUT", headers: { authorization: `Bearer ${people[1].key}` }, body: JSON.stringify({ amount: 2500, status: "paid-offline" }) });
  await api(`/api/circles/${id}/secret-santa`, { method: "POST", headers: { authorization: `Bearer ${organiser.key}` } });
  return { id, organiser, asha };
}

const circle = await seedCircle();
const PAGES = [
  ["home", "/"],
  ["discover", "/discover"],
  ["festival", "/discover/diwali"],
  ["calendar", "/discover/calendar"],
  ["journeys", "/journeys"],
  ["destination", "/journeys/varanasi"],
  ["country", "/journeys/country/in"],
  ["taste", "/taste"],
  ["dish", "/taste/gulab-jamun"],
  ["wear", "/wear"],
  ["garment", "/wear/sari"],
  ["shop", "/shop"],
  ["brand", "/shop/fabindia"],
  ["wishes", "/wishes"],
  ["play", "/play"],
  ["quiz", "/play/quiz"],
  ["memory", "/play/memory"],
  ["sound", "/sound"],
  ["intelligence", "/intelligence"],
  ["matchmaker", "/matchmaker"],
  ["about", "/about"],
  ["notfound", "/discover/not-a-festival"],
  ["circles", "/circles", "organiser"],
  ["circle-new", "/circles/new"],
  ["circle-organiser", `/circles/${circle.id}`, "organiser"],
  ["circle-participant", `/circles/${circle.id}/me`, "asha"],
  ["circle-summary", `/circles/${circle.id}/summary`, "organiser"],
  ["admin-integrations", "/admin/integrations", "admin"],
  ["admin-operations", "/admin/operations", "admin"],
].filter(([name]) => !filter || filter.split(",").includes(name));

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const report = [];
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: width >= 1024 ? 900 : width >= 700 ? 1024 : 844 }, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 1024 });
  await context.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  const admin = await context.request.post(base + "/api/admin/session", { headers: { origin: base }, data: { token: ADMIN } });
  if (!admin.ok()) console.warn("admin sign-in failed", admin.status());
  for (const [name, path, as] of PAGES) {
    const page = await context.newPage();
    const held = as === "asha" ? [circle.asha] : as === "organiser" ? [circle.organiser] : [];
    await page.addInitScript((value) => window.localStorage.setItem("festiva.circles", value), JSON.stringify(held));
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const metrics = await page.evaluate(() => ({ cls: window.__cls, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, height: document.documentElement.scrollHeight }));
    await page.screenshot({ path: `${out}/${width}-${name}.png`, fullPage: true });
    report.push({ width, name, ...metrics, cls: Math.round(metrics.cls * 1000) / 1000 });
    await page.close();
  }
  await context.close();
}
await browser.close();
console.table(report);
