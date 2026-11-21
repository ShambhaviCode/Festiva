import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { adminFromRequest, createAdminSession, sameOrigin, verifyAdminSession } from "@/lib/admin-auth";
import { summarise, type ExperimentEvent } from "@/lib/circles/experiment";
import { evaluateRules, opsState, runAlertCycle } from "@/lib/ops/alerts";
import { auditLog } from "@/lib/ops/audit";
import { getControls } from "@/lib/ops/controls";
import { recordProcessing, recordProviderCall, recordRequest, renderPrometheus, resetMetricsForTests } from "@/lib/ops/metrics";
import { ApprovalError, decide, propose, proposals } from "@/lib/ops/runbooks";

const TOKEN = "admin-token-for-unit-tests-000001";

beforeAll(() => {
  process.env.FESTIVA_DATA_DIR = mkdtempSync(path.join(tmpdir(), "festiva-ops-"));
  process.env.FESTIVA_ADMIN_TOKEN = TOKEN;
});
beforeEach(() => resetMetricsForTests());

const recheck = async () => "Storage healthy.";

describe("alert rules use real samples", () => {
  test("nothing fires without data", async () => {
    const results = await evaluateRules();
    expect(results.gift_circle_api_latency_high.firing).toBe(false);
    expect(results.gift_circle_api_latency_high.sufficientData).toBe(false);
    expect(results.storage_unhealthy.firing).toBe(false);
  });

  test("Gift Circle latency fires on p95 above 1.5 s and says when samples came from a controlled test", async () => {
    for (let i = 0; i < 6; i += 1) recordRequest({ route: "/api/circles/[id]", method: "GET", status: 200, ms: 1900, controlledTest: true });
    const result = (await evaluateRules()).gift_circle_api_latency_high;
    expect(result.firing).toBe(true);
    expect(result.controlledTest).toBe(true);
    expect(result.evidence.p95_ms).toBe(1900);
    expect(result.findings.join(" ")).toMatch(/controlled latency test/);
  });

  test("voice transcription fires on repeated failures and names the failure codes", async () => {
    for (const code of ["quota", "quota", "provider_unavailable"]) recordProviderCall({ provider: "sarvam", capability: "speech_to_text", ok: false, code, ms: 300, controlledTest: false });
    recordProviderCall({ provider: "sarvam", capability: "speech_to_text", ok: true, code: "ok", ms: 800, controlledTest: false });
    const result = (await evaluateRules()).voice_transcription_failing;
    expect(result.firing).toBe(true);
    expect(result.evidence.failure_codes).toBe("quota: 2, provider_unavailable: 1");
    expect(result.findings.join(" ")).toMatch(/rate limit or quota/);
  });

  test("error rate needs volume as well as a high ratio", async () => {
    for (let i = 0; i < 10; i += 1) recordRequest({ route: "/api/circles", method: "POST", status: 500, ms: 10, controlledTest: false });
    expect((await evaluateRules()).api_error_rate_high.firing).toBe(false);
    for (let i = 0; i < 15; i += 1) recordRequest({ route: "/api/flags", method: "GET", status: 200, ms: 5, controlledTest: false });
    expect((await evaluateRules()).api_error_rate_high.firing).toBe(true);
  });

  test("preference processing fires after three failed structuring steps", async () => {
    for (let i = 0; i < 3; i += 1) recordProcessing({ job: "structure_preference", ok: false, code: "invalid_response" });
    expect((await evaluateRules()).preference_processing_failing.firing).toBe(true);
  });

  test("a firing rule opens one event, proposes its runbooks, then resolves when samples stop", async () => {
    for (let i = 0; i < 6; i += 1) recordRequest({ route: "/api/circles/[id]", method: "GET", status: 200, ms: 2500, controlledTest: false });
    const first = await runAlertCycle();
    const id = first.active.gift_circle_api_latency_high;
    expect(id).toBeDefined();
    await runAlertCycle();
    expect((await opsState()).events.filter((e) => e.rule === "gift_circle_api_latency_high")).toHaveLength(1);
    expect((await proposals()).some((p) => p.runbook === "pause_ai_structuring" && p.status === "pending" && p.alertEventId === id)).toBe(true);
    const event = (await opsState()).events.find((e) => e.id === id)!;
    expect(event.deliveries[0]).toMatchObject({ attempted: false, detail: "NudgeBee Event Webhook is not configured" });
    resetMetricsForTests();
    const after = await runAlertCycle();
    expect(after.active.gift_circle_api_latency_high).toBeUndefined();
    expect((await opsState()).events.find((e) => e.id === id)?.status).toBe("resolved");
  });
});

describe("approval-gated runbooks", () => {
  test("nothing runs until an administrator approves with a reason; every step is audited", async () => {
    const proposal = await propose({ runbook: "pause_voice_capture", reason: "Sarvam returning 503s", proposedBy: "nudgebee-workflow" });
    expect(proposal.status).toBe("pending");
    expect((await getControls(Date.now() + 5000)).voicePaused).toBeNull();
    await expect(decide(proposal.id, true, "ok", "admin:test", recheck)).rejects.toBeInstanceOf(ApprovalError);
    const done = await decide(proposal.id, true, "Confirmed provider outage", "admin:test", recheck);
    expect(done.status).toBe("executed");
    expect(done.decision).toMatchObject({ by: "admin:test", approved: true });
    expect((await getControls(Date.now() + 5000)).voicePaused?.by).toBe("admin:test");
    await expect(decide(proposal.id, true, "Second approval", "admin:test", recheck)).rejects.toThrow(/already been decided/);
    const actions = (await auditLog()).map((a) => a.action);
    expect(actions).toEqual(expect.arrayContaining(["runbook.proposed", "runbook.approved", "runbook.executed"]));
  });

  test("a rejected proposal changes nothing", async () => {
    const before = await getControls(Date.now() + 5000);
    const proposal = await propose({ runbook: "pause_ai_structuring", reason: "test", proposedBy: "admin:test" });
    const rejected = await decide(proposal.id, false, "Not needed after all", "admin:test", recheck);
    expect(rejected.status).toBe("rejected");
    expect((await getControls(Date.now() + 10_000)).aiStructuringPaused).toEqual(before.aiStructuringPaused);
  });

  test("duplicate proposals for the same runbook return the open one", async () => {
    const a = await propose({ runbook: "recheck_storage", reason: "first", proposedBy: "x" });
    const b = await propose({ runbook: "recheck_storage", reason: "second", proposedBy: "y" });
    expect(b.id).toBe(a.id);
  });
});

describe("Prometheus exposition", () => {
  test("renders counters and histograms without personal content", () => {
    recordRequest({ route: "/api/circles/[id]/voice", method: "POST", status: 200, ms: 1200, controlledTest: false });
    recordProviderCall({ provider: "sarvam", capability: "speech_to_text", ok: true, code: "ok", ms: 1100, controlledTest: false });
    const text = renderPrometheus();
    expect(text).toContain('festiva_http_requests_total{route="/api/circles/[id]/voice",method="POST",status="2xx"} 1');
    expect(text).toContain('festiva_http_request_duration_seconds_bucket{route="/api/circles/[id]/voice",method="POST",le="2"} 1');
    expect(text).toContain('festiva_provider_requests_total{provider="sarvam",capability="speech_to_text",outcome="success",code="ok"} 1');
    expect(text).toMatch(/# TYPE festiva_http_request_duration_seconds histogram/);
  });
});

describe("experiment summary", () => {
  const e = (name: ExperimentEvent["name"], variant: ExperimentEvent["variant"], identity: string, circleId: string | null = null, ms: number | null = null): ExperimentEvent => ({
    at: "2026-11-17T10:00:00Z",
    name,
    variant,
    assignedBy: "flagsmith",
    identity,
    circleId,
    ms,
  });
  test("counts what happened and refuses to compare small samples", () => {
    const events = [
      e("onboarding_started", "guided", "a"),
      e("circle_created", "guided", "a", "c1", 40_000),
      e("onboarding_started", "guided", "b"),
      e("onboarding_started", "single_page", "c"),
      e("circle_created", "single_page", "c", "c2", 20_000),
      e("invite_created", "single_page", "c", "c2"),
      e("invite_opened", "single_page", "d", "c2"),
      e("invite_opened", "single_page", "e", "c2"),
      e("participant_joined", "single_page", "d", "c2"),
      e("preference_submitted", "single_page", "d", "c2"),
    ];
    const summary = summarise(events);
    const [guided, single] = summary.variants;
    expect(guided).toMatchObject({ started: 2, created: 1, completionRate: 0.5, medianMsToCreate: 40_000 });
    expect(single).toMatchObject({ started: 1, created: 1, circlesWithInvite: 1, invitesOpened: 2, joins: 1, joinConversion: 0.5, participantsWithPreference: 1, preferenceCompletion: 1 });
    expect(summary.sufficient).toBe(false);
    expect(summary.completionTest).toBeNull();
  });
  test("runs a two-proportion test only with enough data", () => {
    const events: ExperimentEvent[] = [];
    for (let i = 0; i < 40; i += 1) {
      events.push(e("onboarding_started", "guided", `g${i}`));
      if (i < 30) events.push(e("circle_created", "guided", `g${i}`, `cg${i}`, 1000));
      events.push(e("onboarding_started", "single_page", `s${i}`));
      if (i < 20) events.push(e("circle_created", "single_page", `s${i}`, `cs${i}`, 1000));
    }
    const summary = summarise(events);
    expect(summary.sufficient).toBe(true);
    // p1 = 0.75, p2 = 0.5, pooled 0.625: z = 0.25 / sqrt(0.625 × 0.375 × (1/40 + 1/40)) = 2.309, p ≈ 0.021
    expect(summary.completionTest!.z).toBeCloseTo(2.309, 2);
    expect(summary.completionTest!.pValue).toBeCloseTo(0.0209, 3);
    expect(summary.completionTest!.pValue).toBeLessThan(0.05);
  });
});

describe("administrator access", () => {
  test("sessions are signed, expire, and cannot be forged", () => {
    const { value } = createAdminSession();
    expect(verifyAdminSession(value)).toBeTruthy();
    expect(verifyAdminSession(value.replace(/.$/, (c) => (c === "A" ? "B" : "A")))).toBeNull();
    expect(verifyAdminSession(value, Date.now() + 9 * 60 * 60 * 1000)).toBeNull();
    expect(verifyAdminSession("v1.9999999999.abc.forged")).toBeNull();
  });
  test("accepts the bearer token or a valid cookie, and nothing else", () => {
    const { value } = createAdminSession();
    expect(adminFromRequest(new Request("https://f.example/api/admin/ops", { headers: { authorization: `Bearer ${TOKEN}` } }))?.kind).toBe("token");
    expect(adminFromRequest(new Request("https://f.example/api/admin/ops", { headers: { cookie: `festiva_admin=${value}` } }))?.kind).toBe("session");
    expect(adminFromRequest(new Request("https://f.example/api/admin/ops", { headers: { authorization: "Bearer participant-key-xxxxxxxxxxxxxxxx" } }))).toBeNull();
  });
  test("cross-site writes are refused", () => {
    expect(sameOrigin(new Request("https://f.example/x", { headers: { origin: "https://evil.example", host: "f.example" } }))).toBe(false);
    expect(sameOrigin(new Request("https://f.example/x", { headers: { origin: "https://f.example", host: "f.example" } }))).toBe(true);
  });
});
