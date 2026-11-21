import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import path from "node:path";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const DATA_DIR = path.join(tmpdir(), `festiva-e2e-${PORT}`);
// Cross-platform clean-up of the previous run's data (works in cmd.exe, PowerShell and bash).
const CLEAN = `node -e "require('fs').rmSync(process.argv[1],{recursive:true,force:true})" "${DATA_DIR}"`;
// Set PLAYWRIGHT_CHANNEL=chrome to use an installed Google Chrome instead of Playwright's bundled Chromium.
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;
const launchOptions = { args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] };

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "en-GB",
    timezoneId: "Asia/Kolkata",
  },
  projects: [
    { name: "desktop", testIgnore: /mobile\.spec\.ts/, use: { ...devices["Desktop Chrome"], channel, launchOptions, viewport: { width: 1366, height: 900 } } },
    { name: "mobile", testMatch: /mobile\.spec\.ts/, use: { ...devices["Pixel 7"], channel, launchOptions } },
  ],
  // End-to-end tests always run against the production build.
  webServer: {
    // Demo mode: no Sarvam, Flagsmith or NudgeBee. Admin pages and metrics are enabled with test-only tokens,
    // and Gift Circle data goes to a fresh temporary directory.
    command: `${CLEAN} && npm run build && npx next start -p ${PORT}`,
    env: {
      FESTIVA_DATA_DIR: DATA_DIR,
      FESTIVA_ADMIN_TOKEN: process.env.E2E_ADMIN_TOKEN ?? "e2e-admin-token-0123456789abcdef",
      FESTIVA_METRICS_TOKEN: "e2e-metrics-token-0123456789abcdef",
    },
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
