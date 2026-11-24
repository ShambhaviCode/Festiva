import { z } from "zod";
import { fail, flagsFor, limit, requireFlag } from "@/lib/circles/service";
import { json, readJson } from "@/lib/http";
import { canSpeak, getSarvam, SarvamError, SPOKEN_REPLY_MAX } from "@/lib/integrations/sarvam";
import { getControls } from "@/lib/ops/controls";
import { instrument } from "@/lib/ops/telemetry";

const bodySchema = z.object({
  text: z.string().trim().min(1).max(SPOKEN_REPLY_MAX),
  language: z.string().trim().min(2).max(12),
});

/**
 * POST /api/speak: read a short FESTIVA reply aloud in the person's language with Sarvam text-to-speech.
 * Switched on by the Flagsmith flag sarvam_voice_enabled (enforced here, not only in the UI), paused with
 * voice input by the same approved operations runbook, rate limited, and never stores the audio.
 */
export const POST = instrument("/api/speak", async (request: Request) => {
  const off = requireFlag(await flagsFor(request), "sarvam_voice_enabled");
  if (off) return off;
  const limited = limit(request, "speak", 20, 5 * 60_000);
  if (limited) return limited;
  const body = await readJson(request, bodySchema, 4_000);
  if ("response" in body) return body.response;
  const { text, language } = body.data;
  if (!canSpeak(language)) return fail(422, "unsupported_language", "Spoken replies are available in English and 10 Indian languages.");
  if ((await getControls()).voicePaused) return fail(503, "voice_paused", "Voice is paused by an administrator. The reply is still shown as text.");
  const sarvam = getSarvam();
  if (!sarvam) return fail(503, "not_configured", "Spoken replies need Sarvam, which is not configured on this server.");
  try {
    const { audio, model, requestId } = await sarvam.speak(text, language);
    return new Response(audio as BodyInit, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "private, no-store",
        "x-festiva-voice-model": model,
        ...(requestId ? { "x-sarvam-request-id": requestId } : {}),
      },
    });
  } catch (error) {
    if (error instanceof SarvamError) {
      const status = error.code === "timeout" ? 504 : error.code === "quota" ? 429 : error.code === "bad_request" || error.code === "unsupported_language" ? 422 : 502;
      return json({ error: `${error.message} The reply is still shown as text.`, code: error.code }, status);
    }
    throw error;
  }
});
