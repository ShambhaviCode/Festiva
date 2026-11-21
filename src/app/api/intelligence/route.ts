import { getProvider } from "@/lib/ai/provider";
import { serverEnv } from "@/lib/env.server";
import { json, readJson } from "@/lib/http";
import { answerQuestion, questionSchema } from "@/lib/intelligence-service";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "intelligence"), 30, 5 * 60_000);
  if (!limit.ok) return json({ error: "You are asking faster than FESTIVA can answer. Try again in a moment." }, 429, { "retry-after": String(limit.retryAfterSeconds) });
  const body = await readJson(request, questionSchema, 8_000);
  if ("response" in body) return body.response;
  const reply = await answerQuestion(body.data, getProvider(), new Date(), serverEnv().AI_TIMEOUT_MS);
  return json(reply);
}
