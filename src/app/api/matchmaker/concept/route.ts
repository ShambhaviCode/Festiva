import { z } from "zod";
import { SECTION_META } from "@/domain/matchmaker/engine";
import { planSchema } from "@/domain/matchmaker/schema";
import { stripUrls, UNTRUSTED_RULE, wrapUntrusted, sanitiseUserText } from "@/lib/ai/guard";
import { AIError, generateStructured, getProvider, logAI } from "@/lib/ai/provider";
import { serverEnv } from "@/lib/env.server";
import { json, readJson } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({ plan: planSchema });
const replySchema = z.object({ headline: z.string().min(8).max(140), narrative: z.string().min(40).max(700) });

const SYSTEM = [
  "You write a short, warm introduction for a celebration plan made by FESTIVA.",
  "Use only what is in the plan. Do not add dishes, gifts, prices, dates, facts or claims that are not in it.",
  'Return JSON: {"headline": string (max 120 characters), "narrative": string (2 or 3 sentences)}.',
  UNTRUSTED_RULE,
].join("\n");

/** Optional AI rewrite of the plan introduction. Items, schedule and budget are never touched by a model. */
export async function POST(request: Request) {
  const started = Date.now();
  const limit = rateLimit(clientKey(request, "concept"), 10, 10 * 60_000);
  if (!limit.ok) {
    logAI({ route: "concept", outcome: "rate_limited" });
    return json({ mode: "rules", message: "You have used AI rewriting several times. Try again in a few minutes." }, 429, { "retry-after": String(limit.retryAfterSeconds) });
  }
  const body = await readJson(request, bodySchema);
  if ("response" in body) return body.response;

  const provider = getProvider();
  if (!provider) {
    logAI({ route: "concept", outcome: "no_provider" });
    return json({ mode: "rules", message: "AI writing is not configured in this deployment. Your plan is complete without it." });
  }

  const { plan } = body.data;
  const digest = [
    `Occasion: ${sanitiseUserText(plan.title, 200)}`,
    `Style: ${plan.input.style}; audience: ${plan.input.audience}; people: ${plan.input.attendees}; time: ${plan.input.duration}`,
    ...plan.sections
      .filter((s) => ["food", "activities", "decor", "music"].includes(s.key))
      .map((s) => `${SECTION_META[s.key].title}: ${s.items.map((i) => sanitiseUserText(i.title, 120)).join("; ")}`),
  ].join("\n");

  try {
    const reply = await generateStructured(provider, { system: SYSTEM, user: wrapUntrusted("plan", digest), schema: replySchema, maxTokens: 400, timeoutMs: serverEnv().AI_TIMEOUT_MS });
    logAI({ route: "concept", provider: provider.name, outcome: "ok", ms: Date.now() - started });
    return json({ mode: "ai", headline: stripUrls(reply.headline), narrative: stripUrls(reply.narrative) });
  } catch (error) {
    const code = error instanceof AIError ? error.code : "provider_error";
    logAI({ route: "concept", provider: provider.name, outcome: code, ms: Date.now() - started });
    return json({ mode: "rules", message: "The AI service did not return a usable answer, so the introduction is unchanged." });
  }
}
