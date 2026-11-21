import { supportsSpeech } from "@/domain/languages";
import { authorise, fail, flagsFor, limit, requireFlag } from "@/lib/circles/service";
import { AUDIO_MAX_BYTES, getSarvam, SarvamError, sarvamMessage, sniffAudio, wavDurationSeconds } from "@/lib/integrations/sarvam";
import { recordAttempt } from "@/lib/integrations/status";
import { json } from "@/lib/http";
import { getControls, takeInjectedVoiceFailure } from "@/lib/ops/controls";
import { recordProviderCall } from "@/lib/ops/metrics";
import { instrument } from "@/lib/ops/telemetry";
import { issueReceipt, sha256 } from "@/lib/circles/receipts";

type Ctx = { params: Promise<{ id: string }> };

async function readCapped(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes + 64 * 1024) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes + 64 * 1024) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/**
 * Transcribe one short voice preference with Sarvam speech-to-text.
 *
 * The recording is checked (consent, size, real audio format, duration where
 * readable), sent to Sarvam, and then discarded: it is never written to disk
 * or logged. The transcript is returned for the participant to review and
 * correct; nothing is saved until they approve it.
 */
export const POST = instrument("/api/circles/[id]/voice", async (request: Request, { params }: Ctx) => {
  const { id } = await params;
  const flags = await flagsFor(request);
  const off = requireFlag(flags, "gift_circle_enabled") ?? requireFlag(flags, "sarvam_voice_enabled");
  if (off) return off;
  const caller = await authorise(request, id);
  if (caller instanceof Response) return caller;
  const limited = limit(request, `voice:${caller.participant.id}`, 6, 60_000) ?? limit(request, "voice", 30, 60 * 60_000);
  if (limited) return limited;

  const controls = await getControls();
  if (controls.voicePaused) return fail(503, "voice_paused", "Voice input is paused by an administrator. You can still type your preference.");
  const sarvam = getSarvam();
  if (!sarvam) return fail(503, "not_configured", "Voice input needs Sarvam, which is not configured on this server. You can type instead.");

  const raw = await readCapped(request, AUDIO_MAX_BYTES);
  if (!raw) return fail(413, "too_large", "That recording is too large. Keep it under 30 seconds.");
  let form: FormData;
  try {
    form = await new Response(new Blob([raw as BlobPart]), { headers: { "content-type": request.headers.get("content-type") ?? "" } }).formData();
  } catch {
    return fail(400, "invalid", "Send the recording as multipart form data.");
  }
  if (form.get("consent") !== "true") return fail(400, "consent_required", "Confirm that FESTIVA may send this recording to Sarvam for transcription.");
  const language = String(form.get("language") ?? "unknown");
  if (language !== "unknown" && !supportsSpeech(language)) return fail(400, "unsupported_language", "Sarvam does not support speech input in that language. Type your preference instead.");
  const file = form.get("audio");
  if (!(file instanceof Blob) || file.size === 0) return fail(400, "invalid", "No recording was received.");
  if (file.size > AUDIO_MAX_BYTES) return fail(413, "too_large", "That recording is too large. Keep it under 30 seconds.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffAudio(bytes);
  if (!kind) return fail(415, "unsupported_format", "That file is not a supported audio format (WebM, Ogg, WAV, MP3, M4A or FLAC).");
  const seconds = wavDurationSeconds(bytes);
  if (seconds !== null && seconds > flags.config.max_recording_seconds + 0.5) {
    return fail(400, "too_long", `Recordings can be up to ${flags.config.max_recording_seconds} seconds long.`);
  }

  if (await takeInjectedVoiceFailure()) {
    // Controlled test scenario: fail before contacting Sarvam, and label it everywhere.
    recordProviderCall({ provider: "sarvam", capability: "speech_to_text", ok: false, code: "controlled_test", ms: 0, controlledTest: true });
    await recordAttempt("sarvam", "speech_to_text", { ok: false, detail: "controlled_test", httpStatus: null, ms: 0, model: sarvam.models.stt, controlledTest: true });
    return fail(502, "controlled_test", sarvamMessage("controlled_test"));
  }

  try {
    const result = await sarvam.transcribe(new Blob([bytes as BlobPart], { type: kind.type }), `preference.${kind.ext}`, language);
    if (!result.transcript) return fail(422, "empty_transcript", "Sarvam could not hear any speech in that recording. Try again a little closer to the microphone, or type instead.");
    // Signed here, checked on save: only this response can put Sarvam's name on a transcript.
    const receipt = issueReceipt({ kind: "transcript", circleId: id, participantId: caller.participant.id, model: result.model, requestId: result.requestId, language: result.languageTag, languageProbability: result.languageProbability, inputHash: null, outputHash: sha256(result.transcript.trim()) });
    return json({
      receipt,
      transcript: result.transcript,
      language: result.languageTag,
      languageProbability: result.languageProbability,
      requestId: result.requestId,
      model: result.model,
      provider: "sarvam",
    });
  } catch (error) {
    if (error instanceof SarvamError) {
      const status = error.code === "timeout" ? 504 : error.code === "quota" ? 429 : error.code === "bad_request" ? 422 : 502;
      return fail(status, error.code, `${error.message} You can type your preference instead.`);
    }
    throw error;
  }
});
