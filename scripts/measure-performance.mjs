// Lab measurements against a running production server.
//   npm run build && npm run start   (in one terminal)
//   npm run perf                     (in another)   [BASE_URL=http://localhost:3000]
//
// Reports Core Web Vitals observed in a single headless Chrome load per page,
// transfer sizes, globe frame rate, API latency and a WebGL leak check.
// These are lab numbers from this machine, not field data, and not Lighthouse scores.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;
const browser = await chromium.launch({ channel, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--enable-precise-memory-info", "--js-flags=--expose-gc"] });

async function vitals(path, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__v = { lcp: 0, cls: 0, fcp: 0, longTasks: 0, maxEvent: 0 };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__v.fcp = e.startTime; }).observe({ type: "paint", buffered: true });
    new PerformanceObserver((l) => { window.__v.longTasks += l.getEntries().length; }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.maxEvent = Math.max(window.__v.maxEvent, e.duration); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
  });
  // Encoded (on-the-wire) sizes from the DevTools protocol, so compression is accounted for.
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  const kinds = new Map();
  let bytes = 0;
  let jsBytes = 0;
  cdp.on("Network.responseReceived", (e) => kinds.set(e.requestId, e.response.mimeType));
  cdp.on("Network.loadingFinished", (e) => {
    bytes += e.encodedDataLength;
    if ((kinds.get(e.requestId) ?? "").includes("javascript")) jsBytes += e.encodedDataLength;
  });
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  // One representative interaction for an INP-style reading.
  const target = page.getByRole("link", { name: /Discover/ }).first();
  await target.hover().catch(() => {});
  await page.mouse.click(5, 300);
  await page.waitForTimeout(400);
  const v = await page.evaluate(() => window.__v);
  await context.close();
  return { path, viewport: `${viewport.width}x${viewport.height}`, fcpMs: Math.round(v.fcp), lcpMs: Math.round(v.lcp), cls: Number(v.cls.toFixed(4)), longTasks: v.longTasks, slowestInteractionMs: Math.round(v.maxEvent), transferKB: Math.round(bytes / 1024), jsKB: Math.round(jsBytes / 1024) };
}

const pages = [];
for (const path of ["/", "/discover", "/discover/diwali", "/matchmaker", "/wishes", "/sound"]) {
  pages.push(await vitals(path, { width: 1366, height: 900 }));
}
pages.push(await vitals("/", { width: 390, height: 844 }));

// Globe frame rate (software GL in headless Chrome, so a floor rather than a typical figure).
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await context.newPage();
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForFunction(() => document.querySelector("[data-globe]")?.getAttribute("data-globe") !== "pending");
const fps = await page.evaluate(() => new Promise((resolve) => { let n = 0; const start = performance.now(); const tick = () => { n += 1; if (performance.now() - start < 3000) requestAnimationFrame(tick); else resolve(Math.round((n * 1000) / (performance.now() - start))); }; requestAnimationFrame(tick); }));
const mode = await page.locator("[data-globe]").getAttribute("data-globe");

// Leak check: mount and unmount the globe 15 times through client-side navigation.
const heap = async () => page.evaluate(() => { globalThis.gc?.(); return performance.memory.usedJSHeapSize; });
const canvases = () => page.evaluate(() => document.querySelectorAll("canvas").length);
for (let i = 0; i < 3; i += 1) { await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Discover", exact: true }).click(); await page.waitForURL("**/discover"); await page.getByRole("link", { name: "FESTIVA home" }).click(); await page.waitForURL(base + "/"); await page.waitForTimeout(700); }
const before = await heap();
for (let i = 0; i < 15; i += 1) { await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Discover", exact: true }).click(); await page.waitForURL("**/discover"); await page.getByRole("link", { name: "FESTIVA home" }).click(); await page.waitForURL(base + "/"); await page.waitForTimeout(700); }
const after = await heap();
const leak = { cycles: 15, heapBeforeMB: Number((before / 1048576).toFixed(1)), heapAfterMB: Number((after / 1048576).toFixed(1)), growthMB: Number(((after - before) / 1048576).toFixed(1)), canvasesOnHome: await canvases() };
await context.close();

// API latency (no AI provider configured: this is the grounded, in-process path).
const timings = [];
for (let i = 0; i < 20; i += 1) { const t = performance.now(); await fetch(base + "/api/intelligence", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${i}` }, body: JSON.stringify({ question: "When is Diwali?" }) }); timings.push(performance.now() - t); }
timings.sort((a, b) => a - b);
const api = { route: "POST /api/intelligence (no AI provider)", samples: timings.length, medianMs: Math.round(timings[10]), p95Ms: Math.round(timings[18]) };

await browser.close();
const report = { measuredAt: new Date().toISOString(), base, pages, globe: { mode, framesPerSecond: fps }, leak, api };
writeFileSync(new URL("../docs/performance-results.json", import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
