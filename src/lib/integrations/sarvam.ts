import { z } from "zod";
import { fromSarvamCode, languageByTag, supportsSpeech, supportsTranslation, toSarvamCode } from "@/domain/languages";
import { GIFT_CATEGORIES, structuredPreferenceSchema, type StructuredPreference } from "@/domain/circle/schema";
import { sanitiseUserText, stripUrls, UNTRUSTED_RULE, wrapUntrusted } from "../ai/guard";
import { serverEnv, type ServerEnv } from "../env.server";
import { recordProviderCall } from "../ops/metrics";
import { recordAttempt } from "./status";

/**
 * SarvamProvider: the only module that talks to Sarvam AI.
 *
 * Endpoints and models follow Sarvam's API reference (checked 17 November 2026):
 *   POST /speech-to-text         multipart; model saaras:v4 (default) or saaras:v3; ≤ 30 s of audio
 *   POST /translate              JSON; model sarvam-translate:v1; formal mode; ≤ 2,000 characters
 *   POST /v1/chat/completions    JSON; model sarvam-105b; response_format json_schema
 * Authentication: the `api-subscription-key` header, sent from the server only.
 *
 * Audio is forwarded to Sarvam and then dropped; it is never written to disk
 * or logged. Logs and metrics record outcome, status code and duration only.
 */

export type SarvamErrorCode =
  | "not_configured"
  | "unsupported_language"
  | "timeout"
  | "network"
  | "bad_request"
  | "auth"
  | "quota"
  | "provider_unavailable"
  | "invalid_response"
  | "controlled_test";

export class SarvamError extends Error {
  constructor(
    public code: SarvamErrorCode,
    message: string,
    public httpStatus: number | null = null,
  ) {
    super(message);
    this.name = "SarvamError";
  }
}

export interface SarvamConfig {
  apiKey: string;
  baseUrl: string;
  sttModel: "saaras:v4" | "saaras:v3";
  translateModel: "sarvam-translate:v1";
  chatModel: "sarvam-105b";
  timeoutMs: number;
}

export function sarvamConfig(env: ServerEnv = serverEnv()): SarvamConfig | null {
  if (!env.SARVAM_API_KEY) return null;
  return {
    apiKey: env.SARVAM_API_KEY,
    baseUrl: (env.SARVAM_API_URL ?? "https://api.sarvam.ai").replace(/\/$/, ""),
    sttModel: env.SARVAM_STT_MODEL ?? "saaras:v4",
    translateModel: env.SARVAM_TRANSLATE_MODEL ?? "sarvam-translate:v1",
    chatModel: env.SARVAM_CHAT_MODEL ?? "sarvam-105b",
    timeoutMs: env.SARVAM_TIMEOUT_MS ?? 20000,
  };
}

const sttResponse = z.object({
  request_id: z.string().nullable().optional(),
  transcript: z.string(),
  language_code: z.string().nullable().optional(),
  language_probability: z.number().min(0).max(1).nullable().optional(),
});

const translateResponse = z.object({
  request_id: z.string().nullable().optional(),
  translated_text: z.string(),
  source_language_code: z.string().nullable().optional(),
});

const chatResponse = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }), finish_reason: z.string().nullable().optional() })).min(1),
});

export interface Transcription {
  transcript: string;
  languageTag: string | null;
  languageProbability: number | null;
  requestId: string | null;
  model: string;
}

export interface Translation {
  text: string;
  requestId: string | null;
  model: string;
}

export interface CulturalSuggestion {
  kind: "gift" | "greeting" | "etiquette";
  text: string;
}

function mapStatus(status: number): SarvamErrorCode {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "quota";
  if (status >= 500) return "provider_unavailable";
  return "bad_request";
}

const MESSAGES: Record<SarvamErrorCode, string> = {
  not_configured: "Sarvam is not configured on this server.",
  unsupported_language: "Sarvam does not support this language for that capability.",
  timeout: "Sarvam did not answer in time.",
  network: "Sarvam could not be reached.",
  bad_request: "Sarvam could not process this request.",
  auth: "Sarvam rejected the API key.",
  quota: "Sarvam's rate limit or quota was reached.",
  provider_unavailable: "Sarvam is temporarily unavailable.",
  invalid_response: "Sarvam returned a response FESTIVA could not read.",
  controlled_test: "Controlled test: this voice request was failed on purpose before reaching Sarvam.",
};

export function sarvamMessage(code: SarvamErrorCode): string {
  return MESSAGES[code];
}

export class SarvamProvider {
  constructor(
    private config: SarvamConfig,
    private fetchImpl: typeof fetch = fetch,
  ) {}

  get models() {
    return { stt: this.config.sttModel, translate: this.config.translateModel, chat: this.config.chatModel };
  }

  private async call<T>(capability: "speech_to_text" | "translate" | "chat", model: string, path: string, init: RequestInit, schema: z.ZodType<T>, outerSignal?: AbortSignal): Promise<{ data: T; ms: number }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    if (outerSignal) {
      if (outerSignal.aborted) controller.abort();
      else outerSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    const started = performance.now();
    let status: number | null = null;
    const finish = async (ok: boolean, code: string) => {
      const ms = Math.round(performance.now() - started);
      recordProviderCall({ provider: "sarvam", capability, ok, code, ms, controlledTest: false });
      await recordAttempt("sarvam", capability, { ok, detail: ok ? `HTTP ${status}` : code, httpStatus: status, ms, model });
      return ms;
    };
    try {
      const response = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { ...(init.headers as Record<string, string> | undefined), "api-subscription-key": this.config.apiKey },
      });
      status = response.status;
      if (!response.ok) {
        const code = mapStatus(response.status);
        await finish(false, code);
        throw new SarvamError(code, MESSAGES[code], response.status);
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        await finish(false, "invalid_response");
        throw new SarvamError("invalid_response", MESSAGES.invalid_response, status);
      }
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        await finish(false, "invalid_response");
        throw new SarvamError("invalid_response", MESSAGES.invalid_response, status);
      }
      const ms = await finish(true, "ok");
      return { data: parsed.data, ms };
    } catch (error) {
      if (error instanceof SarvamError) throw error;
      const code: SarvamErrorCode = controller.signal.aborted ? "timeout" : "network";
      await finish(false, code);
      throw new SarvamError(code, MESSAGES[code]);
    } finally {
      clearTimeout(timer);
    }
  }

  /** Speech to text in the spoken language. `languageTag` may be "unknown" for Sarvam's auto-detection. */
  async transcribe(audio: Blob, filename: string, languageTag: string): Promise<Transcription> {
    if (languageTag !== "unknown" && !supportsSpeech(languageTag)) throw new SarvamError("unsupported_language", MESSAGES.unsupported_language);
    const form = new FormData();
    form.append("file", audio, filename);
    form.append("model", this.config.sttModel);
    if (this.config.sttModel === "saaras:v3") form.append("mode", "transcribe");
    form.append("language_code", languageTag === "unknown" ? "unknown" : toSarvamCode(languageTag)!);
    const { data } = await this.call("speech_to_text", this.config.sttModel, "/speech-to-text", { method: "POST", body: form }, sttResponse);
    return {
      transcript: data.transcript.trim(),
      languageTag: fromSarvamCode(data.language_code ?? null) ?? (languageTag === "unknown" ? null : languageTag),
      languageProbability: data.language_probability ?? null,
      requestId: data.request_id ?? null,
      model: this.config.sttModel,
    };
  }

  async translate(text: string, fromTag: string, toTag: string): Promise<Translation> {
    if (!supportsTranslation(fromTag, toTag)) throw new SarvamError("unsupported_language", MESSAGES.unsupported_language);
    const input = text.normalize("NFC").slice(0, 2000);
    const { data } = await this.call(
      "translate",
      this.config.translateModel,
      "/translate",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          input,
          source_language_code: toSarvamCode(fromTag),
          target_language_code: toSarvamCode(toTag),
          model: this.config.translateModel,
          mode: "formal",
        }),
      },
      translateResponse,
    );
    return { text: data.translated_text.trim(), requestId: data.request_id ?? null, model: this.config.translateModel };
  }

  private async chatJson<T>(system: string, user: string, schemaName: string, jsonSchema: object, schema: z.ZodType<T>, maxTokens: number): Promise<T> {
    const { data } = await this.call(
      "chat",
      this.config.chatModel,
      "/v1/chat/completions",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.config.chatModel,
          temperature: 0.2,
          max_tokens: maxTokens,
          reasoning_effort: null,
          response_format: { type: "json_schema", json_schema: { name: schemaName, strict: true, schema: jsonSchema } },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      },
      chatResponse,
    );
    const content = data.choices[0].message.content;
    let parsed: unknown;
    try {
      parsed = JSON.parse(content ?? "");
    } catch {
      throw new SarvamError("invalid_response", MESSAGES.invalid_response);
    }
    const result = schema.safeParse(parsed);
    if (!result.success) throw new SarvamError("invalid_response", MESSAGES.invalid_response);
    return result.data;
  }

  /**
   * Plain chat completion for FESTIVA Intelligence. Returns the model's text;
   * the caller (generateStructured) extracts and validates the JSON reply.
   */
  async complete(system: string, user: string, maxTokens: number, signal?: AbortSignal): Promise<string> {
    const { data } = await this.call(
      "chat",
      this.config.chatModel,
      "/v1/chat/completions",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: this.config.chatModel,
          temperature: 0.2,
          max_tokens: maxTokens,
          reasoning_effort: null,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      },
      chatResponse,
      signal,
    );
    return data.choices[0].message.content ?? "";
  }

  /**
   * Read a celebration brief written in English or an Indian language into Matchmaker answers.
   * Only stated facts are returned ("", 0 or [] otherwise); the caller validates every field and
   * FESTIVA's engine builds the plan and does all budget arithmetic.
   */
  async readCelebrationBrief(text: string, occasionIds: string[]): Promise<Record<string, unknown> & { language: string; english: string }> {
    const strList = (items: readonly string[]) => ({ type: "array", items: { type: "string", enum: [...items] }, maxItems: items.length });
    const jsonSchema = {
      type: "object",
      additionalProperties: false,
      required: ["occasion", "attendees", "audience", "budget", "currency", "city", "countryCode", "duration", "style", "dietary", "interests", "language", "english"],
      properties: {
        occasion: { type: "string", enum: ["", ...occasionIds] },
        attendees: { type: "integer", minimum: 0, maximum: 5000 },
        audience: { type: "string", enum: ["", "family", "friends", "partner", "colleagues", "children", "community", "solo"] },
        budget: { type: "number", minimum: 0 },
        currency: { type: "string", enum: ["", "INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "JPY"] },
        city: { type: "string", maxLength: 80 },
        countryCode: { type: "string", maxLength: 2 },
        duration: { type: "string", enum: ["", "two-hours", "half-day", "full-day", "weekend"] },
        style: { type: "string", enum: ["", "traditional", "modern", "intimate", "grand", "eco", "playful"] },
        dietary: strList(["vegetarian", "vegan", "gluten-free", "nut-free", "dairy-free", "egg-free", "no-pork", "no-alcohol"]),
        interests: strList(["food", "music", "crafts", "games", "storytelling", "fashion", "gifting", "reflection", "outdoors", "travel"]),
        language: { type: "string", maxLength: 40 },
        english: { type: "string", maxLength: 300 },
      },
    };
    const system = [
      "You read a short description of a celebration someone wants to plan. It may be written in English or in any Indian language.",
      "Return only what the person actually stated. Use an empty string, 0 or an empty list for anything they did not say; never guess.",
      "occasion must be one of the allowed ids (for example diwali, holi, onam, pongal, birthday) or empty. attendees counts everyone, including the person writing when they say 'with N friends'.",
      "budget is the number they wrote, converted from words to digits but not otherwise changed; currency is its ISO code (₹ or rupees is INR).",
      "city is the place they named, spelled in English (Delhi, Mysuru, Bengaluru). countryCode is the ISO 3166 two-letter code of that place, if any. duration: two days or a weekend is 'weekend'.",
      "language is the name of the language the text is written in. english is a one-sentence English restatement of the request.",
      UNTRUSTED_RULE,
    ].join(" ");
    const schema = z.object({ language: z.string(), english: z.string() }).passthrough();
    const result = await this.chatJson(system, wrapUntrusted("question", sanitiseUserText(text, 600)), "celebration_brief", jsonSchema, schema, 500);
    return { ...result, language: stripUrls(result.language).slice(0, 40), english: stripUrls(result.english).slice(0, 300) };
  }

  /** Propose structured wishlist fields from an approved preference (English text). The person reviews them before saving. */
  async structure(englishText: string): Promise<StructuredPreference> {
    const text = sanitiseUserText(englishText, 1500);
    const listOf = (max: number) => ({ type: "array", items: { type: "string", maxLength: 60 }, maxItems: max });
    const jsonSchema = {
      type: "object",
      additionalProperties: false,
      required: ["categories", "likes", "avoid", "dietary", "materials", "notes"],
      properties: {
        categories: { type: "array", items: { type: "string", enum: [...GIFT_CATEGORIES] }, maxItems: 6 },
        likes: listOf(8),
        avoid: listOf(8),
        dietary: listOf(6),
        materials: listOf(6),
        notes: { type: "string", maxLength: 280 },
      },
    };
    const system = [
      "You turn one person's gift preference into structured fields for a group gift exchange.",
      "Only record what the person actually said. Do not infer religion, caste, age, gender or health beyond what they stated.",
      "Use short English phrases. categories must come from the allowed list. notes is a one-sentence summary.",
      UNTRUSTED_RULE,
    ].join(" ");
    const result = await this.chatJson(system, wrapUntrusted("question", text), "gift_preference", jsonSchema, structuredPreferenceSchema, 600);
    return {
      categories: result.categories,
      likes: result.likes.map(stripUrls).filter(Boolean),
      avoid: result.avoid.map(stripUrls).filter(Boolean),
      dietary: result.dietary.map(stripUrls).filter(Boolean),
      materials: result.materials.map(stripUrls).filter(Boolean),
      notes: stripUrls(result.notes),
    };
  }

  /**
   * Short cultural suggestions grounded in FESTIVA's guide entry for the festival.
   * These are AI suggestions and are always presented as such, never as facts.
   */
  async culturalSuggestions(reference: string, occasion: string, languageTag: string): Promise<CulturalSuggestion[]> {
    const language = languageByTag.get(languageTag)?.name ?? "English";
    const schema = z.object({
      suggestions: z.array(z.object({ kind: z.enum(["gift", "greeting", "etiquette"]), text: z.string().trim().min(1).max(240) })).max(4),
    });
    const jsonSchema = {
      type: "object",
      additionalProperties: false,
      required: ["suggestions"],
      properties: {
        suggestions: {
          type: "array",
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["kind", "text"],
            properties: { kind: { type: "string", enum: ["gift", "greeting", "etiquette"] }, text: { type: "string", maxLength: 240 } },
          },
        },
      },
    };
    const system = [
      `You help a family organise a gift exchange for ${sanitiseUserText(occasion, 80)}.`,
      `Write up to four short, practical suggestions in ${language}: gift ideas, greeting wording, or etiquette.`,
      "Base them only on the reference notes. If the notes do not support a suggestion, leave it out. Never state rules as universal; customs vary by family and region.",
      UNTRUSTED_RULE,
    ].join(" ");
    const result = await this.chatJson(system, wrapUntrusted("reference", sanitiseUserText(reference, 3000)), "cultural_suggestions", jsonSchema, schema, 700);
    return result.suggestions.map((s) => ({ kind: s.kind, text: stripUrls(s.text) })).filter((s) => s.text);
  }
}

export function getSarvam(env: ServerEnv = serverEnv()): SarvamProvider | null {
  const config = sarvamConfig(env);
  return config ? new SarvamProvider(config) : null;
}

/* ------------------------------------------------------------------ */
/* Audio validation, done before anything leaves the server.           */
/* ------------------------------------------------------------------ */

export const AUDIO_MAX_BYTES = 2 * 1024 * 1024;

const AUDIO_SIGNATURES: { type: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { type: "audio/webm", ext: "webm", test: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
  { type: "audio/ogg", ext: "ogg", test: (b) => b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53 },
  { type: "audio/wav", ext: "wav", test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x41 && b[10] === 0x56 && b[11] === 0x45 },
  { type: "audio/mpeg", ext: "mp3", test: (b) => (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
  { type: "audio/mp4", ext: "m4a", test: (b) => b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 },
  { type: "audio/flac", ext: "flac", test: (b) => b[0] === 0x66 && b[1] === 0x4c && b[2] === 0x61 && b[3] === 0x43 },
];

/** Identify audio by its first bytes, not by the name or type the browser claims. */
export function sniffAudio(bytes: Uint8Array): { type: string; ext: string } | null {
  if (bytes.length < 12) return null;
  const match = AUDIO_SIGNATURES.find((s) => s.test(bytes));
  return match ? { type: match.type, ext: match.ext } : null;
}

/** Duration of a PCM WAV file from its header, when it can be read. Other formats are bounded by size and the recorder's own limit. */
export function wavDurationSeconds(bytes: Uint8Array): number | null {
  if (sniffAudio(bytes)?.ext !== "wav" || bytes.length < 44) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let byteRate = 0;
  while (offset + 8 <= bytes.length) {
    const id = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt " && offset + 16 <= bytes.length) byteRate = view.getUint32(offset + 16, true);
    if (id === "data") return byteRate > 0 ? size / byteRate : null;
    offset += 8 + size + (size % 2);
  }
  return null;
}
