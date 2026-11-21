import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { evaluateFlags, identityFor, localVariant, resetFlagsmithForTests, validateRemoteConfig } from "@/lib/integrations/flagsmith";
import { EVENTS_QUERY, listNudgeBeeEvents, nudgebeePrerequisites, sendEvent, validateEvent, webhookIssues, nudgebeeConfig, type NudgeBeeEvent } from "@/lib/integrations/nudgebee";
import { getSarvam, SarvamError, SarvamProvider, sniffAudio, wavDurationSeconds, type SarvamConfig } from "@/lib/integrations/sarvam";
import { resetStatusForTests, statusBook } from "@/lib/integrations/status";
import { parseServerEnv } from "@/lib/env.server";
import { DEFAULT_CONFIG } from "@/lib/flags/definitions";
import { resetMetricsForTests, samples } from "@/lib/ops/metrics";

const FIXTURE = path.join(__dirname, "../fixtures/flagsmith-environment.json");
let dir: string;

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), "festiva-int-"));
  process.env.FESTIVA_DATA_DIR = dir;
});
beforeEach(() => {
  resetStatusForTests();
  resetMetricsForTests();
});
afterEach(async () => {
  for (const key of Object.keys(process.env)) if (/^(SARVAM|FLAGSMITH|NUDGEBEE)_/.test(key)) delete process.env[key];
  await resetFlagsmithForTests();
});

/** A WAV header followed by `seconds` of silence at 16 kHz, 16-bit mono. */
function wav(seconds: number): Uint8Array {
  const rate = 16000;
  const data = Math.round(seconds * rate * 2);
  const buffer = Buffer.alloc(44 + data);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + data, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(data, 40);
  return new Uint8Array(buffer);
}

const CONFIG: SarvamConfig = { apiKey: "test-key", baseUrl: "https://api.sarvam.ai", sttModel: "saaras:v4", translateModel: "sarvam-translate:v1", chatModel: "sarvam-105b", timeoutMs: 2000 };

function fakeFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return handler(String(url), init ?? {});
  }) as typeof fetch;
  return { fn, calls };
}

describe("Sarvam provider (with a fake fetch; no network)", () => {
  test("is absent when SARVAM_API_KEY is missing", () => {
    expect(getSarvam(parseServerEnv({}))).toBeNull();
    expect(getSarvam(parseServerEnv({ SARVAM_API_KEY: "k" }))?.models).toEqual({ stt: "saaras:v4", translate: "sarvam-translate:v1", chat: "sarvam-105b" });
  });

  test("sends audio to /speech-to-text as multipart with the documented fields and the key in a header", async () => {
    const { fn, calls } = fakeFetch(() => Response.json({ request_id: "req-1", transcript: " ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ ", language_code: "kn-IN", language_probability: null }));
    const sarvam = new SarvamProvider(CONFIG, fn);
    const result = await sarvam.transcribe(new Blob([wav(1) as BlobPart], { type: "audio/wav" }), "p.wav", "kn-IN");
    expect(calls[0].url).toBe("https://api.sarvam.ai/speech-to-text");
    expect((calls[0].init.headers as Record<string, string>)["api-subscription-key"]).toBe("test-key");
    const form = calls[0].init.body as FormData;
    expect(form.get("model")).toBe("saaras:v4");
    expect(form.get("language_code")).toBe("kn-IN");
    expect(form.get("mode")).toBeNull();
    expect(form.get("file")).toBeInstanceOf(Blob);
    expect(result).toEqual({ transcript: "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ", languageTag: "kn-IN", languageProbability: null, requestId: "req-1", model: "saaras:v4" });
  });

  test("uses Sarvam's od-IN code for Odia, auto-detection for 'unknown', and mode=transcribe only on saaras:v3", async () => {
    const { fn, calls } = fakeFetch(() => Response.json({ request_id: null, transcript: "x", language_code: "od-IN", language_probability: 0.91 }));
    const v3 = new SarvamProvider({ ...CONFIG, sttModel: "saaras:v3" }, fn);
    expect((await v3.transcribe(new Blob(["a"]), "a.wav", "or-IN")).languageTag).toBe("or-IN");
    const auto = await v3.transcribe(new Blob(["a"]), "a.wav", "unknown");
    expect((calls[0].init.body as FormData).get("language_code")).toBe("od-IN");
    expect((calls[0].init.body as FormData).get("mode")).toBe("transcribe");
    expect((calls[1].init.body as FormData).get("language_code")).toBe("unknown");
    expect(auto.languageProbability).toBe(0.91);
  });

  test("refuses unsupported languages before calling Sarvam", async () => {
    const { fn, calls } = fakeFetch(() => Response.json({}));
    await expect(new SarvamProvider(CONFIG, fn).transcribe(new Blob(["a"]), "a.wav", "es-ES")).rejects.toMatchObject({ code: "unsupported_language" });
    await expect(new SarvamProvider(CONFIG, fn).translate("hola", "es-ES", "hi-IN")).rejects.toMatchObject({ code: "unsupported_language" });
    expect(calls).toHaveLength(0);
  });

  test("translates with sarvam-translate:v1 in formal mode and returns only the translation", async () => {
    const { fn, calls } = fakeFetch(() => Response.json({ request_id: "t-1", translated_text: "I like handmade gifts.", source_language_code: "kn-IN" }));
    const result = await new SarvamProvider(CONFIG, fn).translate("ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ", "kn-IN", "en-IN");
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ input: "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ", source_language_code: "kn-IN", target_language_code: "en-IN", model: "sarvam-translate:v1", mode: "formal" });
    expect(result).toEqual({ text: "I like handmade gifts.", requestId: "t-1", model: "sarvam-translate:v1" });
  });

  test("asks sarvam-105b for schema-constrained JSON and validates the reply", async () => {
    const content = JSON.stringify({ categories: ["cultural"], likes: ["handmade"], avoid: [], dietary: [], materials: ["cotton"], notes: "Likes handmade cotton. https://evil.example" });
    const { fn, calls } = fakeFetch(() => Response.json({ choices: [{ message: { content }, finish_reason: "stop" }] }));
    const structured = await new SarvamProvider(CONFIG, fn).structure("I like handmade cotton things");
    const body = JSON.parse(calls[0].init.body as string);
    expect(calls[0].url).toBe("https://api.sarvam.ai/v1/chat/completions");
    expect(body.model).toBe("sarvam-105b");
    expect(body.reasoning_effort).toBeNull();
    expect(body.response_format.type).toBe("json_schema");
    expect(body.response_format.json_schema.strict).toBe(true);
    expect(body.messages[1].content).toContain("<question>");
    expect(structured.categories).toEqual(["cultural"]);
    expect(structured.notes).not.toContain("http");
  });

  test.each([
    [403, "auth"],
    [429, "quota"],
    [503, "provider_unavailable"],
    [400, "bad_request"],
  ])("maps HTTP %i to %s and records the failure", async (status, code) => {
    const { fn } = fakeFetch(() => Response.json({ error: { message: "x", code: "y" } }, { status }));
    await expect(new SarvamProvider(CONFIG, fn).translate("hello", "en-IN", "hi-IN")).rejects.toMatchObject({ code, httpStatus: status });
    const book = await statusBook();
    expect(book.sarvam.translate.last?.ok).toBe(false);
    expect(book.sarvam.translate.lastSuccess).toBeNull();
    expect(samples(60_000).providers[0]).toMatchObject({ provider: "sarvam", capability: "translate", ok: false, code });
  });

  test("rejects a response that does not match the documented shape", async () => {
    const { fn } = fakeFetch(() => Response.json({ text: "wrong field" }));
    await expect(new SarvamProvider(CONFIG, fn).translate("hello", "en-IN", "hi-IN")).rejects.toMatchObject({ code: "invalid_response" });
    const { fn: badChat } = fakeFetch(() => Response.json({ choices: [{ message: { content: '{"categories":["weapons"]}' } }] }));
    await expect(new SarvamProvider(CONFIG, badChat).structure("x")).rejects.toMatchObject({ code: "invalid_response" });
  });

  test("times out instead of hanging", async () => {
    const hang = ((_: string, init: RequestInit) =>
      new Promise((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))))) as unknown as typeof fetch;
    await expect(new SarvamProvider({ ...CONFIG, timeoutMs: 50 }, hang).translate("hello", "en-IN", "hi-IN")).rejects.toMatchObject({ code: "timeout" });
  });

  test("records a success only after a genuine successful response", async () => {
    const { fn } = fakeFetch(() => Response.json({ request_id: null, translated_text: "नमस्ते", source_language_code: "en-IN" }));
    await new SarvamProvider(CONFIG, fn).translate("hello", "en-IN", "hi-IN");
    const book = await statusBook();
    expect(book.sarvam.translate.lastSuccess?.ok).toBe(true);
    expect(book.sarvam.translate.successes).toBe(1);
  });

  test("error objects carry no request content", () => {
    const error = new SarvamError("bad_request", "Sarvam could not process this request.", 400);
    expect(JSON.stringify({ ...error, message: error.message })).not.toContain("hello");
  });
});

describe("audio validation", () => {
  test("identifies audio by its bytes, not its claimed type", () => {
    expect(sniffAudio(wav(0.5))?.ext).toBe("wav");
    expect(sniffAudio(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]))?.type).toBe("audio/webm");
    expect(sniffAudio(new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0, 0, 0, 0, 0, 0, 0, 0]))?.type).toBe("audio/ogg");
    expect(sniffAudio(new TextEncoder().encode("<html><body>not audio</body></html>"))).toBeNull();
    expect(sniffAudio(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0, 0, 0, 0]))).toBeNull();
  });
  test("reads WAV duration from the header", () => {
    expect(wavDurationSeconds(wav(2.5))).toBeCloseTo(2.5, 2);
    expect(wavDurationSeconds(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]))).toBeNull();
  });
});

describe("Flagsmith (official SDK)", () => {
  test("without configuration, safe defaults are used and the reason is stated", async () => {
    const result = await evaluateFlags("visitor-1", parseServerEnv({}));
    expect(result.source).toBe("defaults");
    expect(result.reason).toMatch(/not configured/);
    expect(result.flags.gift_circle_enabled).toBe(true);
    expect(result.flags.premium_gifting_experience_enabled).toBe(false);
    expect(result.config).toEqual(DEFAULT_CONFIG);
    expect(result.onboarding.assignedBy).toBe("local-hash");
  });

  test("evaluates a real environment document with the SDK's own engine (offline mode)", async () => {
    const env = parseServerEnv({ FLAGSMITH_OFFLINE_ENVIRONMENT_FILE: FIXTURE });
    const result = await evaluateFlags("visitor-1", env);
    expect(result.source).toBe("offline-document");
    expect(result.flags.sarvam_voice_enabled).toBe(true);
    expect(result.config).toEqual({ max_participants: 12, max_recording_seconds: 20, recommendation_count: 3, invite_expiry_days: 7 });
    expect(result.onboarding.assignedBy).toBe("flagsmith");
  });

  test("a flag switched off in the environment turns the feature off", async () => {
    const doc = JSON.parse(readFileSync(FIXTURE, "utf8"));
    doc.feature_states.find((f: { feature: { name: string } }) => f.feature.name === "sarvam_voice_enabled").enabled = false;
    const file = path.join(dir, "env-voice-off.json");
    writeFileSync(file, JSON.stringify(doc));
    const result = await evaluateFlags("visitor-1", parseServerEnv({ FLAGSMITH_OFFLINE_ENVIRONMENT_FILE: file }));
    expect(result.flags.sarvam_voice_enabled).toBe(false);
    expect(result.flags.gift_circle_enabled).toBe(true);
  });

  test("the experiment's multivariate split is stable per visitor and divides visitors between both variants", async () => {
    const env = parseServerEnv({ FLAGSMITH_OFFLINE_ENVIRONMENT_FILE: FIXTURE });
    const counts = { guided: 0, single_page: 0 };
    for (let i = 0; i < 200; i += 1) counts[(await evaluateFlags(`visitor-${i}`, env)).onboarding.variant] += 1;
    expect(counts.guided).toBeGreaterThan(60);
    expect(counts.single_page).toBeGreaterThan(60);
    expect((await evaluateFlags("visitor-7", env)).onboarding.variant).toBe((await evaluateFlags("visitor-7", env)).onboarding.variant);
  });

  test("with the experiment flag off, everyone gets guided onboarding and nobody is enrolled", async () => {
    const doc = JSON.parse(readFileSync(FIXTURE, "utf8"));
    doc.feature_states.find((f: { feature: { name: string } }) => f.feature.name === "new_gift_circle_onboarding_enabled").enabled = false;
    const file = path.join(dir, "env-exp-off.json");
    writeFileSync(file, JSON.stringify(doc));
    const result = await evaluateFlags("visitor-1", parseServerEnv({ FLAGSMITH_OFFLINE_ENVIRONMENT_FILE: file }));
    expect(result.onboarding).toEqual({ variant: "guided", inExperiment: false, assignedBy: "none" });
  });

  test("falls back to defaults when Flagsmith cannot be reached, and records the failure", async () => {
    const env = parseServerEnv({ FLAGSMITH_ENVIRONMENT_KEY: "ser.festiva-unreachable", FLAGSMITH_API_URL: "http://127.0.0.1:9/api/v1/" });
    const result = await evaluateFlags("visitor-1", env);
    expect(result.source).toBe("defaults");
    expect(result.reason).toMatch(/could not be reached/);
    expect(result.flags.gift_circle_enabled).toBe(true);
    const book = await statusBook();
    expect(book.flagsmith.local_evaluation.last?.ok).toBe(false);
    expect(book.flagsmith.local_evaluation.lastSuccess).toBeNull();
  }, 30_000);

  test("identities sent to Flagsmith are one-way hashes", () => {
    expect(identityFor("abc")).toMatch(/^anon_[0-9a-f]{24}$/);
    expect(identityFor("abc")).not.toContain("abc");
    expect(["guided", "single_page"]).toContain(localVariant("x"));
  });

  test("remote configuration is validated field by field", () => {
    expect(validateRemoteConfig(null)).toEqual({ config: DEFAULT_CONFIG, issues: [] });
    expect(validateRemoteConfig("{not json").issues[0]).toMatch(/not valid JSON/);
    expect(validateRemoteConfig("[1,2]").issues[0]).toMatch(/must be a JSON object/);
    const mixed = validateRemoteConfig('{"max_participants": 5000, "recommendation_count": 6, "max_recording_seconds": 12.5, "api_key": "x"}');
    expect(mixed.config).toEqual({ ...DEFAULT_CONFIG, recommendation_count: 6 });
    expect(mixed.issues).toEqual(expect.arrayContaining([expect.stringMatching(/max_participants/), expect.stringMatching(/max_recording_seconds/), expect.stringMatching(/Unknown setting "api_key"/)]));
    // Sarvam's synchronous speech-to-text limit cannot be exceeded through remote configuration.
    expect(validateRemoteConfig({ max_recording_seconds: 60 }).config.max_recording_seconds).toBe(30);
  });
});

describe("NudgeBee Event Webhook (documented format; fake fetch, no network)", () => {
  const event: NudgeBeeEvent = {
    id: "evt-1",
    fingerprint: "festiva:voice_transcription_failing",
    status: "firing",
    title: "FESTIVA: Voice transcription is failing",
    rule_name: "voice_transcription_failing",
    severity: "high",
    starts_at: "2026-11-17T10:00:00.000Z",
    subject: { name: "festiva-web", type: "service" },
    source_tool: "FESTIVA",
    labels: { service: "festiva", controlled_test: "false" },
  };
  const env = parseServerEnv({ NUDGEBEE_EVENT_WEBHOOK_URL: "https://nudgebee.example/api/webhooks/event", NUDGEBEE_EVENT_WEBHOOK_TOKEN: "nb-token" });

  test("validates events against the documented rules", () => {
    expect(validateEvent(event)).toEqual([]);
    expect(validateEvent({ ...event, id: "" })).toEqual(expect.arrayContaining([expect.stringMatching(/id must be/)]));
    expect(validateEvent({ ...event, labels: { nb_internal: "x" } })).toEqual([expect.stringMatching(/reserved nb_ prefix/)]);
    expect(validateEvent({ ...event, ends_at: "2026-11-17T09:00:00.000Z" })).toEqual([expect.stringMatching(/ends_at/)]);
    expect(validateEvent({ ...event, rule_name: "bad\nname" })).toEqual([expect.stringMatching(/control characters/)]);
  });

  test("posts JSON with the token as a Bearer header, never in the URL", async () => {
    const { fn, calls } = fakeFetch(() => new Response("{}", { status: 200 }));
    const result = await sendEvent(event, false, env, fn);
    expect(result).toMatchObject({ attempted: true, ok: true, httpStatus: 200 });
    expect(calls[0].url).toBe("https://nudgebee.example/api/webhooks/event");
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Bearer nb-token");
    expect(JSON.parse(calls[0].init.body as string)).toEqual(event);
  });

  test("reports NudgeBee's validation errors and records the failure", async () => {
    const { fn } = fakeFetch(() => Response.json({ message: "invalid payload", errors: [{ index: 0, field: "status", reason: 'must be "firing" or "resolved"' }] }, { status: 400 }));
    const result = await sendEvent(event, false, env, fn);
    expect(result.ok).toBe(false);
    expect(result.detail).toMatch(/HTTP 400: invalid payload; status: must be/);
    expect((await statusBook()).nudgebee.event_webhook.last?.ok).toBe(false);
  });

  test("sends nothing when unconfigured or invalid", async () => {
    const { fn, calls } = fakeFetch(() => new Response("{}"));
    expect((await sendEvent(event, false, parseServerEnv({}), fn)).attempted).toBe(false);
    expect((await sendEvent({ ...event, title: "" }, false, env, fn)).attempted).toBe(false);
    expect(calls).toHaveLength(0);
  });

  test("flags a webhook URL that is not the documented Event Webhook path", () => {
    expect(webhookIssues(nudgebeeConfig(parseServerEnv({ NUDGEBEE_EVENT_WEBHOOK_URL: "https://x.example/api/webhooks/event_webhook", NUDGEBEE_EVENT_WEBHOOK_TOKEN: "t" })))[0]).toMatch(/\/api\/webhooks\/event/);
    expect(webhookIssues(nudgebeeConfig(env))).toEqual([]);
  });

  test("reads events back through the documented GraphQL action, read-only", async () => {
    const api = parseServerEnv({ NUDGEBEE_API_URL: "https://nudgebee.example", NUDGEBEE_API_TOKEN: "sk-nb-test" });
    const { fn, calls } = fakeFetch(() => Response.json({ data: { events_list: { rows: [{ id: "e1", title: "FESTIVA: Voice transcription is failing", status: "firing", priority: "High", nb_status: "open" }] } } }));
    const result = await listNudgeBeeEvents(api, fn);
    expect(calls[0].url).toBe("https://nudgebee.example/api/graphql");
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Bearer sk-nb-test");
    expect(JSON.parse(calls[0].init.body as string).query).toBe(EVENTS_QUERY);
    expect(EVENTS_QUERY).not.toMatch(/mutation/);
    expect(result.ok).toBe(true);
    expect(result.rows[0].nb_status).toBe("open");
    const { fn: failing } = fakeFetch(() => Response.json({ errors: [{ message: "Upstream unreachable for events_list" }] }));
    expect((await listNudgeBeeEvents(api, failing)).detail).toMatch(/Upstream unreachable/);
  });

  test("prerequisites describe exactly what is missing", () => {
    const list = nudgebeePrerequisites(parseServerEnv({}));
    expect(list.find((p) => p.label.startsWith("Event Webhook"))?.met).toBe(false);
    expect(list.find((p) => p.label.includes("Kubernetes"))?.met).toBe(Boolean(process.env.KUBERNETES_SERVICE_HOST));
  });
});

describe("environment validation", () => {
  test("rejects short admin tokens and non-https provider URLs", () => {
    expect(() => parseServerEnv({ FESTIVA_ADMIN_TOKEN: "short" })).toThrow(/at least 24/);
    expect(() => parseServerEnv({ SARVAM_API_URL: "http://api.sarvam.ai" })).toThrow(/https/);
    expect(parseServerEnv({ SARVAM_API_URL: "http://localhost:4010" }).SARVAM_API_URL).toBe("http://localhost:4010");
    expect(() => parseServerEnv({ SARVAM_STT_MODEL: "saarika:v1" })).toThrow();
  });
});

test("fixture is a copyable Flagsmith environment document", () => {
  const target = path.join(dir, "copy.json");
  copyFileSync(FIXTURE, target);
  expect(JSON.parse(readFileSync(target, "utf8")).feature_states).toHaveLength(11);
});
