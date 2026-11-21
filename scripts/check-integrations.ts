/**
 * Live connection check for the three sponsor integrations.
 *
 *   npm run integrations:check            # reads .env.local, then the environment
 *
 * Makes a few small, real requests with the credentials in your environment,
 * through the same provider code the app uses, and prints PASS / FAIL / SKIP.
 * Run it on a machine that can reach the providers. It never prints a secret.
 *
 * Requests made (all small):
 *   Sarvam    one translation (en-IN → hi-IN, ~40 characters) and one
 *             speech-to-text call on one second of generated silence
 *   Flagsmith one flag evaluation for a throwaway anonymous identity
 *   NudgeBee  one test event (firing, then resolved), labelled as a test,
 *             and one read-only GraphQL query, if the API token is set
 *
 * Evidence mode (for judges and the README):
 *
 *   npm run integrations:evidence
 *       writes evidence/integration-evidence-<time>.md and .json
 *   npm run integrations:evidence -- --watch-flag sarvam_voice_enabled
 *       also watches one Flagsmith flag for 3 minutes while you switch it
 *       in the Flagsmith dashboard, recording each change it sees
 *
 * Each result is labelled LIVE SERVICE, LOCAL TEST DOUBLE, OFFLINE DOCUMENT or
 * NOT CONFIGURED, so a stand-in can never be mistaken for the real service.
 * Every secret value from the environment is replaced with [redacted] before
 * anything is printed or written.
 */
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import os from "node:os";

const args = process.argv.slice(2);
const EVIDENCE = args.includes("--evidence");
const watchIndex = args.indexOf("--watch-flag");
const WATCH_FLAG = watchIndex >= 0 ? args[watchIndex + 1] : undefined;
const SECRET_NAMES = ["SARVAM_API_KEY", "FLAGSMITH_ENVIRONMENT_KEY", "NUDGEBEE_EVENT_WEBHOOK_TOKEN", "NUDGEBEE_API_TOKEN", "FESTIVA_ADMIN_TOKEN", "FESTIVA_METRICS_TOKEN", "FESTIVA_OPS_WEBHOOK_TOKEN", "SUPABASE_SERVICE_ROLE_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"];

/** Replace every configured secret value, and anything that looks like a bearer token, before output. */
function redact(text: string): string {
  let out = text;
  for (const name of SECRET_NAMES) {
    const value = process.env[name];
    if (value && value.length >= 6) out = out.split(value).join("[redacted]");
  }
  return out.replace(/(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/g, "$1[redacted]").replace(/([?&](?:token|key|api_key)=)[^&\s]+/gi, "$1[redacted]");
}

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}
process.env.FESTIVA_DATA_DIR ??= ".festiva-data";

type Outcome = "PASS" | "FAIL" | "SKIP";
type Target = "LIVE SERVICE" | "LOCAL TEST DOUBLE" | "OFFLINE DOCUMENT" | "NOT CONFIGURED" | "LOCAL CHECK";
const results: { name: string; outcome: Outcome; target: Target; host: string | null; detail: string; at: string }[] = [];
let stubbed = new Set<string>();
const hosts: Record<string, string | null> = {};
const report = (name: string, outcome: Outcome, detail: string, target?: Target) => {
  const isStub = [...stubbed].some((prefix) => name.startsWith(prefix));
  const resolved: Target = target ?? (outcome === "SKIP" ? "NOT CONFIGURED" : isStub ? "LOCAL TEST DOUBLE" : "LIVE SERVICE");
  const host = resolved === "LOCAL CHECK" ? null : (Object.entries(hosts).find(([prefix]) => name.startsWith(prefix))?.[1] ?? null);
  const clean = redact(detail);
  results.push({ name, outcome, target: resolved, host, detail: clean, at: new Date().toISOString() });
  console.log(`${outcome.padEnd(4)}  ${name} [${resolved}${host ? `, ${host}` : ""}]: ${clean}`);
};
const hostOf = (url?: string, fallback?: string): string | null => {
  try {
    return new URL(url ?? fallback ?? "").host;
  } catch {
    return null;
  }
};

function silentWav(seconds: number): Uint8Array {
  const rate = 16000;
  const data = seconds * rate * 2;
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
  return new Uint8Array(b);
}

async function main() {
  const { serverEnv } = await import("../src/lib/env.server");
  const env = serverEnv();
  const local = (url?: string) => Boolean(url && /^http:\/\/(localhost|127\.0\.0\.1)/.test(url));
  stubbed = new Set(
    [local(env.SARVAM_API_URL) && "Sarvam", local(env.FLAGSMITH_API_URL) && "Flagsmith", local(env.NUDGEBEE_EVENT_WEBHOOK_URL) && "NudgeBee Event", local(env.NUDGEBEE_API_URL) && "NudgeBee GraphQL"].filter(Boolean) as string[],
  );
  hosts.Sarvam = hostOf(env.SARVAM_API_URL, "https://api.sarvam.ai");
  hosts.Flagsmith = hostOf(env.FLAGSMITH_API_URL, "https://edge.api.flagsmith.com/api/v1/");
  hosts["NudgeBee Event"] = hostOf(env.NUDGEBEE_EVENT_WEBHOOK_URL);
  hosts["NudgeBee GraphQL"] = hostOf(env.NUDGEBEE_API_URL);

  // ---- Sarvam -------------------------------------------------------------
  const { getSarvam, SarvamError } = await import("../src/lib/integrations/sarvam");
  const sarvam = getSarvam(env);
  if (!sarvam) report("Sarvam", "SKIP", "SARVAM_API_KEY is not set");
  else {
    try {
      const t = await sarvam.translate("Happy Diwali to everyone in the family.", "en-IN", "hi-IN");
      report("Sarvam translate", "PASS", `${t.model} answered (request ${t.requestId ?? "n/a"})`);
    } catch (error) {
      report("Sarvam translate", "FAIL", error instanceof SarvamError ? `${error.code}${error.httpStatus ? ` (HTTP ${error.httpStatus})` : ""}: ${error.message}` : String(error));
    }
    try {
      const s = await sarvam.transcribe(new Blob([silentWav(1) as BlobPart], { type: "audio/wav" }), "silence.wav", "hi-IN");
      report("Sarvam speech-to-text", "PASS", `${s.model} answered (request ${s.requestId ?? "n/a"}; transcript of silence is ${s.transcript ? `"${s.transcript.slice(0, 30)}"` : "empty, as expected"})`);
    } catch (error) {
      report("Sarvam speech-to-text", "FAIL", error instanceof SarvamError ? `${error.code}${error.httpStatus ? ` (HTTP ${error.httpStatus})` : ""}: ${error.message}` : String(error));
    }
  }

  // ---- Flagsmith ----------------------------------------------------------
  const { evaluateFlags, flagsmithMode, resetFlagsmithForTests } = await import("../src/lib/integrations/flagsmith");
  const mode = flagsmithMode(env);
  if (!mode) report("Flagsmith", "SKIP", "FLAGSMITH_ENVIRONMENT_KEY is not set");
  else {
    const result = await evaluateFlags(`check-${randomUUID()}`, env);
    if (result.source === "flagsmith") {
      const on = Object.entries(result.flags).filter(([, v]) => v).length;
      report("Flagsmith", "PASS", `${mode} evaluation; ${on} of ${Object.keys(result.flags).length} FESTIVA flags on; onboarding variant ${result.onboarding.variant} (${result.onboarding.assignedBy})${result.configIssues.length ? `; config issues: ${result.configIssues.join("; ")}` : ""}`);
    } else if (result.source === "offline-document") report("Flagsmith", "SKIP", "FLAGSMITH_OFFLINE_ENVIRONMENT_FILE is set: offline document, not a live connection", "OFFLINE DOCUMENT");
    else report("Flagsmith", "FAIL", result.reason ?? "defaults in use");
    if (WATCH_FLAG && result.source === "flagsmith") {
      // Remote-change evidence: a person switches the flag in the Flagsmith dashboard while this watches.
      console.log(`      Watching "${WATCH_FLAG}" for 3 minutes. Switch it in the Flagsmith dashboard now.`);
      const identity = `watch-${randomUUID()}`;
      let previous: boolean | undefined;
      const changes: string[] = [];
      const until = Date.now() + 180_000;
      while (Date.now() < until && changes.length < 2) {
        await resetFlagsmithForTests();
        const now = await evaluateFlags(identity, env);
        const value = (now.flags as Record<string, boolean>)[WATCH_FLAG];
        if (previous !== undefined && value !== previous) {
          changes.push(`${new Date().toISOString()}: ${previous ? "on" : "off"} to ${value ? "on" : "off"}`);
          console.log(`      change seen: ${changes[changes.length - 1]}`);
        }
        previous = value;
        await new Promise((r) => setTimeout(r, 5_000));
      }
      report(`Flagsmith remote change (${WATCH_FLAG})`, changes.length > 0 ? "PASS" : "FAIL", changes.length > 0 ? `changes seen without a redeploy: ${changes.join("; ")}` : "no change seen in 3 minutes");
    }
    await resetFlagsmithForTests();
  }

  // ---- NudgeBee -----------------------------------------------------------
  const { listNudgeBeeEvents, nudgebeeConfig, sendEvent, webhookIssues } = await import("../src/lib/integrations/nudgebee");
  const nb = nudgebeeConfig(env);
  if (!nb.eventWebhookUrl) report("NudgeBee Event Webhook", "SKIP", "NUDGEBEE_EVENT_WEBHOOK_URL is not set");
  else {
    for (const issue of webhookIssues(nb)) console.log(`      note: ${issue}`);
    const id = `festiva-check-${randomUUID()}`;
    const base = { id, fingerprint: "festiva:integration_check", title: "FESTIVA: [Controlled test] Integration check", rule_name: "festiva_integration_check", severity: "info" as const, subject: { name: "festiva-web", type: "service" }, source_tool: "FESTIVA", labels: { service: "festiva", controlled_test: "true" } };
    const firing = await sendEvent({ ...base, status: "firing", starts_at: new Date().toISOString(), description: "Sent by npm run integrations:check. Safe to ignore." }, true, env);
    const resolved = firing.ok ? await sendEvent({ ...base, status: "resolved", ends_at: new Date().toISOString() }, true, env) : null;
    report("NudgeBee Event Webhook", firing.ok && resolved?.ok ? "PASS" : "FAIL", [firing.detail, resolved?.detail].filter(Boolean).join("; then "));
  }
  if (!nb.apiUrl || !nb.apiToken) report("NudgeBee GraphQL (read-only)", "SKIP", "NUDGEBEE_API_URL or NUDGEBEE_API_TOKEN is not set");
  else {
    const list = await listNudgeBeeEvents(env);
    report("NudgeBee GraphQL (read-only)", list.ok ? "PASS" : "FAIL", list.detail);
  }

  // ---- Provider receipts (server-side attribution) ------------------------
  if (sarvam) {
    const { issueReceipt, verifyReceipt, sha256 } = await import("../src/lib/circles/receipts");
    const who = { circleId: "evidence", participantId: "evidence" };
    const receipt = issueReceipt({ kind: "translation", ...who, model: "sarvam-translate:v1", requestId: null, language: "hi-IN", languageProbability: null, inputHash: sha256("a"), outputHash: sha256("b") });
    const ok = verifyReceipt(receipt, { kind: "translation", ...who }) !== null;
    const tampered = receipt.slice(0, -1) + (receipt.endsWith("A") ? "B" : "A");
    const forged = verifyReceipt(tampered, { kind: "translation", ...who }) !== null;
    report("Sarvam attribution receipts", ok && !forged ? "PASS" : "FAIL", ok && !forged ? "a receipt signed with a key derived from SARVAM_API_KEY verifies, and a tampered one is refused" : "receipt verification did not behave as expected", "LOCAL CHECK");
  }

  const failed = results.filter((r) => r.outcome === "FAIL").length;
  if (EVIDENCE) writeEvidence();
  console.log(`\n${results.filter((r) => r.outcome === "PASS").length} passed, ${failed} failed, ${results.filter((r) => r.outcome === "SKIP").length} skipped.`);
  console.log("Results are also recorded on /admin/integrations once the app reads the same data directory.");
  process.exit(failed ? 1 : 0);
}

function writeEvidence() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  let commit = "unknown";
  try {
    commit = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    // Not a git checkout.
  }
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
  const meta = { festivaVersion: pkg.version, commit, generatedAt: new Date().toISOString(), node: process.version, platform: `${os.platform()} ${os.release()}` };
  mkdirSync("evidence", { recursive: true });
  const base = `evidence/integration-evidence-${stamp}`;
  writeFileSync(`${base}.json`, redact(JSON.stringify({ ...meta, results }, null, 2)));
  const live = results.filter((r) => r.target === "LIVE SERVICE" && r.outcome === "PASS");
  const md = [
    "# FESTIVA integration evidence",
    "",
    `Generated ${meta.generatedAt} by \`npm run integrations:evidence\`, FESTIVA ${meta.festivaVersion} (commit ${meta.commit}), Node ${meta.node}, ${meta.platform}.`,
    "",
    "Every secret value was replaced with [redacted] before this file was written. A result marked LOCAL TEST DOUBLE, OFFLINE DOCUMENT or LOCAL CHECK is not evidence of a live connection.",
    "",
    `**Checks that reached a live service and passed: ${live.length}.**`,
    "",
    "| Check | Result | Target | Host | Detail | Time (UTC) |",
    "| --- | --- | --- | --- | --- | --- |",
    ...results.map((r) => `| ${r.name} | ${r.outcome} | ${r.target} | ${r.host ?? ""} | ${r.detail.replace(/\|/g, "/")} | ${r.at} |`),
    "",
  ].join("\n");
  writeFileSync(`${base}.md`, redact(md));
  console.log(`\nEvidence written to ${base}.md and ${base}.json (secrets redacted).`);
}

main().catch((error) => {
  console.error("Integration check crashed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
