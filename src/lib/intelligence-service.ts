import { z } from "zod";
import { findFestival, groundedAnswer, type GroundedAnswer } from "@/domain/intelligence";
import { looksLikeInjection, sanitiseUserText, stripUrls, UNTRUSTED_RULE, wrapUntrusted } from "./ai/guard";
import { AIError, generateStructured, logAI, type AIProvider } from "./ai/provider";

export const questionSchema = z.object({
  question: z.string().trim().min(2).max(500),
  /** Up to three earlier questions, used only to resolve "it" or "that festival". */
  context: z.array(z.string().max(500)).max(3).optional(),
});

const replySchema = z.object({
  answer: z.string().min(1).max(1400),
  grounded: z.boolean(),
});

export interface IntelligenceReply extends GroundedAnswer {
  /**
   * offline     – no AI provider configured; answered from FESTIVA's guide.
   * ai          – written by a model from FESTIVA's guide (facts listed below it).
   * ai-general  – nothing in the guide matched; the model answered from general knowledge. Unverified.
   * fallback    – a provider is configured but failed; answered from the guide.
   */
  mode: "offline" | "ai" | "ai-general" | "fallback";
  notice?: string;
}

const SYSTEM = [
  "You are FESTIVA Intelligence, a cultural assistant for festivals, traditions, food, attire, destinations, gifts, music and celebration planning.",
  "Answer the question in at most 120 words, in plain and respectful language.",
  "If <reference> contains relevant entries, answer only from them and set grounded to true.",
  "If <reference> is empty or irrelevant, you may answer briefly from general knowledge and must set grounded to false. Say when dates or customs vary by region. Never invent sources, prices, dates or statistics.",
  "Decline anything outside culture, festivals and celebration planning in one sentence.",
  'Return JSON: {"answer": string, "grounded": boolean}.',
  UNTRUSTED_RULE,
].join("\n");

/** Answer a question. Always succeeds: every failure path degrades to the grounded, non-AI answer. */
export async function answerQuestion(input: z.infer<typeof questionSchema>, provider: AIProvider | null, now: Date = new Date(), timeoutMs?: number): Promise<IntelligenceReply> {
  const question = sanitiseUserText(input.question, 500);
  // Resolve follow-ups ("and when is it?"): if the question names no festival but the
  // previous one did, retrieve with both. Only retrieval uses the earlier question.
  let grounded = groundedAnswer(question, now);
  const previous = input.context?.length ? sanitiseUserText(input.context[input.context.length - 1], 500) : "";
  const refersBack = /\b(it|its|that|this|there|they|them|then)\b/i.test(question);
  if (previous && refersBack && !findFestival(question) && findFestival(previous)) {
    grounded = groundedAnswer(`${previous} ${question}`, now);
  }

  if (!provider) {
    logAI({ route: "intelligence", outcome: "no_provider" });
    return { ...grounded, mode: "offline" };
  }

  const started = Date.now();
  const reference = grounded.facts.map((f, i) => `[${i + 1}] ${f.text}`).join("\n");
  const ask = () =>
    generateStructured(provider, {
      system: SYSTEM,
      user: `${wrapUntrusted("question", question)}\n${wrapUntrusted("reference", reference)}`,
      schema: replySchema,
      maxTokens: 500,
      timeoutMs,
    });
  try {
    // One retry for an unusable reply or a failed request. A timeout is not retried.
    const reply = await ask().catch((error: unknown) => {
      if (error instanceof AIError && error.code === "timeout") throw error;
      return ask();
    });
    logAI({ route: "intelligence", provider: provider.name, outcome: "ok", ms: Date.now() - started, flagged: looksLikeInjection(question) });
    const isGrounded = reply.grounded && grounded.facts.length > 0;
    return {
      ...grounded,
      answer: stripUrls(reply.answer),
      mode: isGrounded ? "ai" : "ai-general",
      notice: isGrounded ? undefined : "FESTIVA's guide has nothing on this, so this answer is the AI model's general knowledge. It has not been checked by FESTIVA.",
    };
  } catch (error) {
    const code = error instanceof AIError ? error.code : "provider_error";
    logAI({ route: "intelligence", provider: provider.name, outcome: code, ms: Date.now() - started });
    return { ...grounded, mode: "fallback", notice: "The AI service did not return a usable answer, so this reply comes straight from FESTIVA's guide." };
  }
}
