import { z } from "zod";

/**
 * Server-only environment: AI provider credentials and settings.
 * Import this only from route handlers, server components and server
 * libraries. It is kept apart from env.ts so that not even the *names* of
 * secret variables are shipped in browser bundles.
 */
const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const int = (min: number, max: number) =>
  optional.transform((v) => (v === undefined ? undefined : Number(v))).pipe(z.number().int().min(min).max(max).optional());

const bool = optional.pipe(z.enum(["true", "false", "1", "0"]).optional()).transform((v) => (v === undefined ? undefined : v === "true" || v === "1"));

/** https everywhere, except plain http on localhost for local stacks and tests. */
const serviceUrl = optional.pipe(
  z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname));
    }, "must be https (http is allowed only for localhost)")
    .optional(),
);

const secret = (min: number) => optional.pipe(z.string().min(min, `must be at least ${min} characters`).optional());

const serverSchema = z.object({
  AI_PROVIDER: optional.pipe(z.enum(["anthropic", "openai"]).optional()),
  AI_MODEL: optional,
  ANTHROPIC_API_KEY: optional,
  OPENAI_API_KEY: optional,
  AI_TIMEOUT_MS: int(1000, 60000),

  // --- FESTIVA server -------------------------------------------------------
  FESTIVA_DATA_DIR: optional,
  FESTIVA_CIRCLE_STORE: optional.pipe(z.enum(["file", "supabase"]).optional()),
  SUPABASE_SERVICE_ROLE_KEY: optional,
  FESTIVA_ADMIN_TOKEN: secret(24),
  FESTIVA_METRICS_TOKEN: secret(24),
  FESTIVA_OPS_WEBHOOK_TOKEN: secret(24),

  // --- Sarvam AI ------------------------------------------------------------
  SARVAM_API_KEY: optional,
  SARVAM_API_URL: serviceUrl,
  SARVAM_STT_MODEL: optional.pipe(z.enum(["saaras:v4", "saaras:v3"]).optional()),
  SARVAM_TRANSLATE_MODEL: optional.pipe(z.enum(["sarvam-translate:v1"]).optional()),
  SARVAM_CHAT_MODEL: optional.pipe(z.enum(["sarvam-105b"]).optional()),
  SARVAM_TIMEOUT_MS: int(2000, 60000),

  // --- Flagsmith ------------------------------------------------------------
  FLAGSMITH_ENVIRONMENT_KEY: optional,
  FLAGSMITH_API_URL: serviceUrl,
  FLAGSMITH_REFRESH_SECONDS: int(5, 600),
  FLAGSMITH_ENABLE_EVENTS: bool,
  FLAGSMITH_OFFLINE_ENVIRONMENT_FILE: optional,

  // --- NudgeBee -------------------------------------------------------------
  NUDGEBEE_EVENT_WEBHOOK_URL: serviceUrl,
  NUDGEBEE_EVENT_WEBHOOK_TOKEN: optional,
  NUDGEBEE_API_URL: serviceUrl,
  NUDGEBEE_API_TOKEN: optional,
  NUDGEBEE_APP_URL: serviceUrl,
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid server environment: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  return result.data;
}

export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") throw new Error("serverEnv() must not be called in the browser");
  return parseServerEnv(process.env);
}

export function aiStatus(env: ServerEnv = serverEnv()): { configured: boolean; provider?: "anthropic" | "openai" | "sarvam"; model?: string } {
  const provider = env.AI_PROVIDER ?? (env.ANTHROPIC_API_KEY ? "anthropic" : env.OPENAI_API_KEY ? "openai" : undefined);
  if (provider === "anthropic" && env.ANTHROPIC_API_KEY) return { configured: true, provider, model: env.AI_MODEL ?? "claude-haiku-5-5" };
  if (provider === "openai" && env.OPENAI_API_KEY) return { configured: true, provider, model: env.AI_MODEL ?? "gpt-4o-mini" };
  // Fallback: Sarvam's chat model, when a Sarvam key is set (see integrations/sarvam).
  if (env.SARVAM_API_KEY) return { configured: true, provider: "sarvam", model: env.SARVAM_CHAT_MODEL ?? "sarvam-105b" };
  return { configured: false };
}
