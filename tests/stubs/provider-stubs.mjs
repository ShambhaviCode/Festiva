// LOCAL TEST DOUBLES for Sarvam, Flagsmith and NudgeBee. NOT the real services.
//
// Used only by the integration end-to-end suite (playwright.integrations.config.ts)
// to exercise FESTIVA's real provider code paths (request shapes, auth headers,
// error handling, flag refresh, alert delivery) when the real APIs cannot be
// reached. Every response here is canned. FESTIVA's admin page labels any
// provider URL on localhost as "Local test double, not the real service".
//
// Shapes follow the providers' public documentation (checked 17 November 2026):
//   Sarvam    POST /speech-to-text, POST /translate, POST /v1/chat/completions
//   Flagsmith GET  /api/v1/environment-document/  (server-side SDK, local evaluation)
//   NudgeBee  POST /api/webhooks/event, POST /api/graphql (events_list)
//
// Control endpoints (test-only): /__stub/*
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const PORT = Number(process.env.STUB_PORT ?? 4010);
const SARVAM_KEY = "stub-sarvam-key";
const FLAGSMITH_KEY = "ser.stub-flagsmith-key";
const NUDGEBEE_TOKEN = "stub-nudgebee-token";

const environment = JSON.parse(readFileSync(new URL("../fixtures/flagsmith-environment.json", import.meta.url), "utf8"));
const state = { sarvamFailures: 0, sarvamCalls: [], nudgebeeEvents: [], flagsmithFetches: 0 };

// Canned transcripts, clearly marked so they can never be mistaken for real output.
const TRANSCRIPTS = {
  "kn-IN": "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ, ಹತ್ತಿಯ ಶಾಲು ಇದ್ದರೆ ಚೆನ್ನ",
  "hi-IN": "मुझे हाथ से बनी चीज़ें पसंद हैं",
  unknown: "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ, ಹತ್ತಿಯ ಶಾಲು ಇದ್ದರೆ ಚೆನ್ನ",
};
const TRANSLATIONS = {
  "en-IN": "I like handmade gifts; a cotton shawl would be lovely.",
  "hi-IN": "मुझे हाथ से बने उपहार पसंद हैं; सूती शॉल हो तो अच्छा रहेगा।",
  "kn-IN": "ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ವಸ್ತುಗಳು ಇಷ್ಟ",
};

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "content-type": type });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const body = await readBody(req);

  // ---- control -------------------------------------------------------------
  if (url.pathname === "/__stub/health") return send(res, 200, { ok: true });
  if (url.pathname === "/__stub/state") return send(res, 200, { ...state, flags: Object.fromEntries(environment.feature_states.map((f) => [f.feature.name, f.enabled])) });
  if (url.pathname === "/__stub/flag" && req.method === "POST") {
    const { name, enabled } = JSON.parse(body.toString());
    const feature = environment.feature_states.find((f) => f.feature.name === name);
    if (!feature) return send(res, 404, { error: "unknown flag" });
    feature.enabled = Boolean(enabled);
    return send(res, 200, { name, enabled: feature.enabled });
  }
  if (url.pathname === "/__stub/sarvam/fail" && req.method === "POST") {
    state.sarvamFailures = Number(JSON.parse(body.toString()).count ?? 1);
    return send(res, 200, { failures: state.sarvamFailures });
  }

  // ---- Sarvam --------------------------------------------------------------
  if (["/speech-to-text", "/translate", "/v1/chat/completions"].includes(url.pathname)) {
    if (req.headers["api-subscription-key"] !== SARVAM_KEY) return send(res, 403, { error: { request_id: null, message: "Invalid API key", code: "invalid_api_key_error" } });
    if (state.sarvamFailures > 0) {
      state.sarvamFailures -= 1;
      return send(res, 503, { error: { request_id: null, message: "Service overloaded (stub)", code: "internal_server_error" } });
    }
    if (url.pathname === "/speech-to-text") {
      const form = await new Request("http://stub", { method: "POST", headers: { "content-type": req.headers["content-type"] }, body }).formData();
      const file = form.get("file");
      const model = form.get("model");
      const language = String(form.get("language_code") ?? "unknown");
      state.sarvamCalls.push({ path: url.pathname, model, language, bytes: file?.size ?? 0 });
      if (!(file instanceof Blob) || file.size === 0 || !["saaras:v4", "saaras:v3"].includes(String(model))) return send(res, 400, { error: { message: "bad request", code: "invalid_request_error" } });
      return send(res, 200, {
        request_id: `stub-stt-${state.sarvamCalls.length}`,
        transcript: TRANSCRIPTS[language] ?? TRANSCRIPTS.unknown,
        language_code: language === "unknown" ? "kn-IN" : language,
        language_probability: language === "unknown" ? 0.87 : null,
      });
    }
    const json = JSON.parse(body.toString());
    state.sarvamCalls.push({ path: url.pathname, model: json.model });
    if (url.pathname === "/translate") {
      if (json.mode !== "formal" || json.model !== "sarvam-translate:v1") return send(res, 400, { error: { message: "bad request", code: "invalid_request_error" } });
      return send(res, 200, { request_id: `stub-tr-${state.sarvamCalls.length}`, translated_text: TRANSLATIONS[json.target_language_code] ?? `[stub translation into ${json.target_language_code}]`, source_language_code: json.source_language_code });
    }
    // chat completions
    const name = json.response_format?.json_schema?.name;
    const content =
      name === "gift_preference"
        ? { categories: ["cultural", "fashion"], likes: ["handmade"], avoid: [], dietary: [], materials: ["cotton"], notes: "Likes handmade gifts, especially a cotton shawl." }
        : { suggestions: [{ kind: "greeting", text: "[Stub AI suggestion] Wish everyone with a simple greeting card." }] };
    return send(res, 200, { id: "stub", object: "chat.completion", created: 0, model: json.model, choices: [{ index: 0, message: { role: "assistant", content: JSON.stringify(content) }, finish_reason: "stop" }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } });
  }

  // ---- Flagsmith -----------------------------------------------------------
  if (url.pathname === "/api/v1/environment-document/") {
    if (req.headers["x-environment-key"] !== FLAGSMITH_KEY) return send(res, 403, { detail: "Invalid key" });
    state.flagsmithFetches += 1;
    return send(res, 200, environment);
  }
  if (url.pathname.startsWith("/api/v1/analytics/")) return send(res, 200, {});

  // ---- NudgeBee ------------------------------------------------------------
  if (url.pathname === "/api/webhooks/event" && req.method === "POST") {
    if (req.headers.authorization !== `Bearer ${NUDGEBEE_TOKEN}`) return send(res, 400, { message: "webhook validation failed" });
    const event = JSON.parse(body.toString());
    const errors = [];
    for (const field of ["id", "fingerprint", "status", "title", "rule_name"]) if (!event[field]) errors.push({ index: -1, field, reason: "required" });
    if (!["firing", "resolved"].includes(event.status)) errors.push({ index: -1, field: "status", reason: 'must be "firing" or "resolved"' });
    if (errors.length) return send(res, 400, { message: "invalid payload", errors });
    state.nudgebeeEvents.push(event);
    return send(res, 200, {});
  }
  if (url.pathname === "/api/graphql" && req.method === "POST") {
    if (req.headers.authorization !== "Bearer sk-nb-stub") return send(res, 200, { errors: [{ message: "Unauthorized" }] });
    const rows = state.nudgebeeEvents.map((e, i) => ({ id: `nb-${i}`, title: e.title, status: e.status, priority: e.severity === "high" ? "High" : "Medium", nb_status: "open", created_at: e.starts_at ?? null, starts_at: e.starts_at ?? null, ends_at: e.ends_at ?? null, fingerprint: e.fingerprint, evidences: null }));
    return send(res, 200, { data: { events_list: { rows: rows.reverse().slice(0, 20) } } });
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, () => console.log(`provider test doubles listening on ${PORT}`));
