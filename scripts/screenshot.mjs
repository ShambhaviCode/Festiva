// Dev helper: node scripts/screenshot.mjs <baseUrl> <outDir> <path>[,<path>…]
import { chromium } from "@playwright/test";
const [base = "http://localhost:3100", out = "/tmp/shots", paths = "/"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const path of paths.split(",")) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const file = `${out}/${name}${path.replace(/[\/?=&]/g, "_") || "_home"}.png`;
    await page.screenshot({ path: file, fullPage: process.env.FULL === "1" });
    console.log(file);
  }
  await context.close();
}
await browser.close();
