import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Integration end-to-end suite: FESTIVA's real Sarvam, Flagsmith and NudgeBee
 * code paths, run against LOCAL TEST DOUBLES (tests/stubs/provider-stubs.mjs).
 *
 * This proves request shapes, authentication headers, error handling, flag
 * refresh without redeploy, alert delivery and the approval workflow. It does
 * NOT prove that the real services accept FESTIVA's requests: that needs real
 * credentials and `npm run integrations:check` (see docs/SPONSORS.md).
 */
const PORT = Number(process.env.E2E_INT_PORT ?? 3220);
const STUB = 4010;
const DATA_DIR = path.join(tmpdir(), `festiva-int-${PORT}`);
// Cross-platform: no rm, test or inline environment assignments, so this also runs from cmd.exe and PowerShell.
const CLEAN = `node -e "require('fs').rmSync(process.argv[1],{recursive:true,force:true})" "${DATA_DIR}"`;
const BUILD = existsSync(".next/BUILD_ID") ? "" : "npm run build && ";
const channel = process.env.PLAYWRIGHT_CHANNEL || undefined;

export default defineConfig({
  testDir: "./tests/e2e-integrations",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure", locale: "en-GB", timezoneId: "Asia/Kolkata" },
  projects: [{ name: "integrations", use: { ...devices["Desktop Chrome"], channel, viewport: { width: 1366, height: 900 } } }],
  webServer: [
    { command: "node tests/stubs/provider-stubs.mjs", env: { STUB_PORT: String(STUB) }, url: `http://localhost:${STUB}/__stub/health`, reuseExistingServer: false, timeout: 20_000 },
    {
      command: `${CLEAN} && ${BUILD}npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: false,
      timeout: 240_000,
      env: {
        FESTIVA_DATA_DIR: DATA_DIR,
        FESTIVA_ADMIN_TOKEN: "e2e-admin-token-0123456789abcdef",
        FESTIVA_METRICS_TOKEN: "e2e-metrics-token-0123456789abcdef",
        FESTIVA_OPS_WEBHOOK_TOKEN: "e2e-ops-webhook-token-0123456789",
        SARVAM_API_KEY: "stub-sarvam-key",
        SARVAM_API_URL: `http://localhost:${STUB}`,
        FLAGSMITH_ENVIRONMENT_KEY: "ser.stub-flagsmith-key",
        FLAGSMITH_API_URL: `http://localhost:${STUB}/api/v1/`,
        FLAGSMITH_REFRESH_SECONDS: "5",
        NUDGEBEE_EVENT_WEBHOOK_URL: `http://localhost:${STUB}/api/webhooks/event`,
        NUDGEBEE_EVENT_WEBHOOK_TOKEN: "stub-nudgebee-token",
        NUDGEBEE_API_URL: `http://localhost:${STUB}`,
        NUDGEBEE_API_TOKEN: "sk-nb-stub",
      },
    },
  ],
});
