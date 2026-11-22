import { z } from "zod";
import { aiStatus, serverEnv, type ServerEnv } from "../env.server";
import { getSarvam, type SarvamProvider } from "../integrations/sarvam";

/** Provider abstraction: add a provider by implementing `complete`. */
export interface CompletionRequest {
  system: string;
  user: string;
  maxTokens: number;
  signal: AbortSignal;
}

export interface AIProvider {
  name: string;
  model: string;
  complete(request: CompletionRequest): Promise<string>;
}

export type AIErrorCode = "timeout" | "provider_error" | "invalid_output";

export class AIError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AIError";
  }
}

export function anthropicProvider(apiKey: string, model: string, fetchImpl: typeof fetch = fetch): AIProvider {
  return {
    name: "anthropic",
    model,
    async complete({ system, user, maxTokens, signal }) {
      const response = await fetchImpl("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal,
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
      });
      if (!response.ok) throw new AIError("provider_error", `Anthropic responded ${response.status}`);
      const data = (await response.json()) as { content?: { type: string; text?: string }[] };
      return data.content?.find((part) => part.type === "text")?.text ?? "";
    },
  };
}

export function openAIProvider(apiKey: string, model: string, fetchImpl: typeof fetch = fetch): AIProvider {
  return {
    name: "openai",
    model,
    async complete({ system, user, maxTokens, signal }) {
      const response = await fetchImpl("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!response.ok) throw new AIError("provider_error", `OpenAI responded ${response.status}`);
      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? "";
    },
  };
}

/** Sarvam's chat model behind the generic provider interface. The HTTP call stays in integrations/sarvam. */
export function sarvamAIProvider(sarvam: SarvamProvider): AIProvider {
  return {
    name: "sarvam",
    model: sarvam.models.chat,
    complete: ({ system, user, maxTokens, signal }) => sarvam.complete(system, user, maxTokens, signal),
  };
}

/**
 * Anthropic or OpenAI when configured; otherwise Sarvam's chat model when a
 * Sarvam key is set. Returns null when nothing is configured, and callers
 * then use their non-AI path.
 */
export function getProvider(env: ServerEnv = serverEnv()): AIProvider | null {
  const status = aiStatus(env);
  if (!status.configured || !status.model) return null;
  if (status.provider === "anthropic") return anthropicProvider(env.ANTHROPIC_API_KEY!, status.model);
  if (status.provider === "openai") return openAIProvider(env.OPENAI_API_KEY!, status.model);
  const sarvam = status.provider === "sarvam" ? getSarvam(env) : null;
  return sarvam ? sarvamAIProvider(sarvam) : null;
}

/** Pull the first JSON object out of a model reply, tolerating code fences and surrounding prose. */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new AIError("invalid_output", "Model reply contained no JSON object");
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    throw new AIError("invalid_output", "Model reply was not valid JSON");
  }
}

export interface StructuredOptions<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  maxTokens?: number;
  timeoutMs?: number;
}

/** Call a provider with a timeout and validate its reply against a Zod schema. */
export async function generateStructured<T>(provider: AIProvider, options: StructuredOptions<T>): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 12000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let raw: string;
  try {
    raw = await provider.complete({
      system: `${options.system}\nReply with a single JSON object and nothing else.`,
      user: options.user,
      maxTokens: options.maxTokens ?? 700,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) throw new AIError("timeout", `AI provider did not answer within ${timeoutMs} ms`);
    if (error instanceof AIError) throw error;
    throw new AIError("provider_error", "AI provider request failed");
  } finally {
    clearTimeout(timer);
  }
  const parsed = options.schema.safeParse(extractJson(raw));
  if (!parsed.success) throw new AIError("invalid_output", "Model reply did not match the expected shape");
  return parsed.data;
}

/** Privacy-conscious logging: metadata only, never the person's text or the model's reply. */
export function logAI(event: { route: string; provider?: string; outcome: "ok" | AIErrorCode | "no_provider" | "rate_limited"; ms?: number; flagged?: boolean }): void {
  if (process.env.NODE_ENV === "test") return;
  console.info(JSON.stringify({ scope: "festiva.ai", ...event }));
}
