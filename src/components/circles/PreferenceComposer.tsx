"use client";

import { useEffect, useRef, useState } from "react";
import {
  EMPTY_STRUCTURE,
  GIFT_CATEGORIES,
  GIFT_CATEGORY_LABELS,
  type StructuredPreference,
} from "@/domain/circle/schema";
import {
  LANGUAGES,
  languageByTag,
  supportsSpeech,
  supportsTranslation,
} from "@/domain/languages";
import { api, ApiError } from "@/lib/client/circles";
import type { Capabilities } from "./useCircle";
import { LangText, Notice } from "./ui";

/**
 * Add one gift preference, by typing or speaking.
 *
 * Voice: the participant agrees to send the recording to Sarvam, records (or
 * uploads) up to the configured length, and gets back a transcript in their
 * own language. They can correct it. An optional translation into the
 * organiser's language is stored beside the original, never instead of it.
 * Finally they review the structured details and save.
 */

type Stage = "compose" | "review";

interface Transcript {
  model: string;
  requestId: string | null;
  detectedLanguage: string | null;
  languageProbability: number | null;
  original: string;
  receipt: string;
}

const RECORDER_TYPES = [
  "audio/webm;codecs=opus",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/webm",
];
const list = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

function Recorder({
  maxSeconds,
  disabled,
  onAudio,
}: {
  maxSeconds: number;
  disabled: boolean;
  onAudio: (blob: Blob, label: string) => void;
}) {
  const [state, setState] = useState<
    "idle" | "recording" | "unsupported" | "denied"
  >(() =>
    typeof window !== "undefined" &&
    (typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia)
      ? "unsupported"
      : "idle",
  );
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      recorder.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = RECORDER_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(
        stream,
        type ? { mimeType: type } : undefined,
      );
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timer.current) clearInterval(timer.current);
        setState("idle");
        onAudio(
          new Blob(chunks, { type: rec.mimeType || "audio/webm" }),
          "Your recording",
        );
      };
      recorder.current = rec;
      setElapsed(0);
      rec.start();
      setState("recording");
      const began = Date.now();
      timer.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - began) / 1000);
        setElapsed(seconds);
        if (seconds >= maxSeconds) rec.stop();
      }, 250);
    } catch {
      setState("denied");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {state === "recording" ? (
        <button
          type="button"
          className="btn btn-plum"
          onClick={() => recorder.current?.stop()}
          aria-live="polite"
        >
          Stop recording ({elapsed}s of {maxSeconds}s)
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-plum"
          onClick={start}
          disabled={disabled || state === "unsupported"}
        >
          Record
        </button>
      )}
      <label
        className={`btn btn-line ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        Upload a recording
        <input
          type="file"
          accept="audio/webm,audio/ogg,audio/wav,audio/x-wav,audio/mpeg,audio/mp4,audio/x-m4a,audio/flac"
          className="sr-only"
          disabled={disabled}
          data-testid="voice-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAudio(file, file.name);
            e.target.value = "";
          }}
        />
      </label>
      {state === "unsupported" && (
        <p className="note">
          This browser cannot record here. You can upload a recording or type.
        </p>
      )}
      {state === "denied" && (
        <p className="note">
          Microphone access was not allowed. You can upload a recording or type.
        </p>
      )}
    </div>
  );
}

export function PreferenceComposer({
  circleId,
  circleKey,
  myLanguage,
  organiserLanguage,
  capabilities,
  onSaved,
}: {
  circleId: string;
  circleKey: string;
  myLanguage: string;
  organiserLanguage: string;
  capabilities: Capabilities;
  onSaved: () => void;
}) {
  const [chosenMode, setMode] = useState<"text" | "voice">("text");
  const [stage, setStage] = useState<Stage>("compose");
  const [chosenLanguage, setLanguage] = useState(myLanguage);
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [audio, setAudio] = useState<{
    blob: Blob;
    label: string;
    url: string;
  } | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [translation, setTranslation] = useState<{
    text: string;
    original: string;
    language: string;
    model: string;
    receipt: string;
  } | null>(null);
  /** Signed by the server when Sarvam proposed the fields; lets the save prove it. */
  const [structureReceipt, setStructureReceipt] = useState<string | null>(null);
  const [structured, setStructured] =
    useState<StructuredPreference>(EMPTY_STRUCTURE);
  const [structuredBy, setStructuredBy] = useState<
    "rules" | "sarvam" | "person"
  >("rules");
  const [structureNotice, setStructureNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // If voice is switched off (by a flag or an administrator) while the composer is open, it falls back to typing.
  const mode = capabilities.voice ? chosenMode : "text";
  // "Detect automatically" only makes sense for speech; typed text always has a language.
  const language =
    mode === "text" && chosenLanguage === "unknown"
      ? myLanguage
      : chosenLanguage;
  useEffect(
    () => () => void (audio && URL.revokeObjectURL(audio.url)),
    [audio],
  );

  const speechLanguages = LANGUAGES.filter((l) => supportsSpeech(l.tag));
  const canTranslate =
    capabilities.translation &&
    supportsTranslation(language, organiserLanguage);
  const reset = () => {
    setStage("compose");
    setText("");
    setAudio(null);
    setTranscript(null);
    setTranslation(null);
    setStructured(EMPTY_STRUCTURE);
    setStructureReceipt(null);
    setStructureNotice(null);
    setError(null);
    setTouched(false);
  };

  async function transcribe() {
    if (!audio) return;
    setBusy("Sending to Sarvam…");
    setError(null);
    const form = new FormData();
    form.append("audio", audio.blob, "preference");
    form.append("language", language);
    form.append("consent", consent ? "true" : "false");
    try {
      const result = await api<{
        transcript: string;
        language: string | null;
        languageProbability: number | null;
        requestId: string | null;
        model: string;
        receipt: string;
      }>(`/api/circles/${circleId}/voice`, {
        method: "POST",
        body: form,
        key: circleKey,
      });
      setTranscript({
        model: result.model,
        requestId: result.requestId,
        detectedLanguage: result.language,
        languageProbability: result.languageProbability,
        original: result.transcript,
        receipt: result.receipt,
      });
      setText(result.transcript);
      if (result.language && languageByTag.has(result.language))
        setLanguage(result.language);
      else if (language === "unknown") setLanguage(myLanguage);
      // The recording has done its job; drop it from memory.
      URL.revokeObjectURL(audio.url);
      setAudio(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "The recording could not be transcribed. You can type instead.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function translate() {
    setBusy("Translating with Sarvam…");
    setError(null);
    try {
      const result = await api<{
        text: string;
        model: string;
        receipt: string;
      }>(`/api/circles/${circleId}/translate`, {
        method: "POST",
        body: JSON.stringify({ text, from: language, to: organiserLanguage }),
        key: circleKey,
      });
      setTranslation({
        text: result.text,
        original: result.text,
        language: organiserLanguage,
        model: result.model,
        receipt: result.receipt,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Translation failed. You can save without it.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function review() {
    if (!text.trim()) {
      setError("Write or record your preference first.");
      return;
    }
    setBusy("Reading your preference…");
    setError(null);
    let english = text;
    let notice: string | null = null;
    if (!language.startsWith("en")) {
      if (translation?.language.startsWith("en")) english = translation.text;
      else if (
        capabilities.translation &&
        supportsTranslation(language, "en-IN")
      ) {
        try {
          english = (
            await api<{ text: string }>(`/api/circles/${circleId}/translate`, {
              method: "POST",
              body: JSON.stringify({ text, from: language, to: "en-IN" }),
              key: circleKey,
            })
          ).text;
          notice =
            "An English version from Sarvam was used to fill in these details. It is not saved.";
        } catch {
          notice =
            "These details could not be read from your language automatically. Fill them in below.";
        }
      } else
        notice =
          "Fill in the details below: automatic reading works from English.";
    }
    try {
      const result = await api<{
        structured: StructuredPreference;
        structuredBy: "rules" | "sarvam";
        notice: string;
        receipt?: string;
      }>(`/api/circles/${circleId}/structure`, {
        method: "POST",
        body: JSON.stringify({ englishText: english }),
        key: circleKey,
      });
      setStructured(result.structured);
      setStructuredBy(result.structuredBy);
      setStructureReceipt(result.receipt ?? null);
      setStructureNotice([notice, result.notice].filter(Boolean).join(" "));
    } catch (err) {
      setStructured({ ...EMPTY_STRUCTURE, notes: text.slice(0, 280) });
      setStructuredBy("person");
      setStructureReceipt(null);
      setStructureNotice(
        err instanceof ApiError ? err.message : "Fill in the details yourself.",
      );
    }
    setBusy(null);
    setStage("review");
  }

  async function save() {
    setBusy("Saving…");
    setError(null);
    try {
      await api(`/api/circles/${circleId}/preferences`, {
        method: "POST",
        key: circleKey,
        body: JSON.stringify({
          source: transcript ? "voice" : "text",
          originalText: text.trim(),
          originalLanguage: language,
          translation:
            translation && translation.text.trim()
              ? {
                  text: translation.text.trim(),
                  language: translation.language,
                  model: translation.model,
                  edited: translation.text !== translation.original,
                  receipt: translation.receipt,
                }
              : null,
          transcript: transcript
            ? {
                model: transcript.model,
                requestId: transcript.requestId,
                detectedLanguage: transcript.detectedLanguage,
                languageProbability: transcript.languageProbability,
                edited: text.trim() !== transcript.original.trim(),
                receipt: transcript.receipt,
              }
            : null,
          structured,
          structuredBy: touched ? "person" : structuredBy,
          structureReceipt: touched ? null : structureReceipt,
        }),
      });
      reset();
      onSaved();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Your preference could not be saved. Try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  const edit = <K extends keyof StructuredPreference>(
    key: K,
    value: StructuredPreference[K],
  ) => {
    setTouched(true);
    setStructured((s) => ({ ...s, [key]: value }));
  };

  if (stage === "review") {
    return (
      <div className="grid gap-5" data-testid="preference-review">
        <div className="rule rounded-xl border bg-[#fffdf7] p-5">
          <p className="note">Your words, as they will be saved</p>
          <LangText text={text} lang={language} className="mt-2 text-lg" />
          {translation && (
            <>
              <p className="note mt-4">
                Translation for the organiser, saved separately
              </p>
              <LangText
                text={translation.text}
                lang={translation.language}
                className="mt-1"
              />
            </>
          )}
        </div>
        {structureNotice && <Notice>{structureNotice}</Notice>}
        <fieldset>
          <legend className="field-label">Kinds of gift</legend>
          <div className="flex flex-wrap gap-2">
            {GIFT_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={structured.categories.includes(c)}
                onClick={() =>
                  edit(
                    "categories",
                    structured.categories.includes(c)
                      ? structured.categories.filter((x) => x !== c)
                      : [...structured.categories, c],
                  )
                }
              >
                {GIFT_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["likes", "Things they like", "handmade, books, tea"],
              ["avoid", "Things to avoid", "plastic, perfume"],
              ["materials", "Materials", "cotton, brass"],
              ["dietary", "Dietary needs", "vegetarian, nut-free"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key}>
              <label htmlFor={`pref-${key}`} className="field-label">
                {label}
              </label>
              <input
                id={`pref-${key}`}
                className="field"
                placeholder={placeholder}
                defaultValue={structured[key].join(", ")}
                onBlur={(e) =>
                  edit(
                    key,
                    list(e.target.value).slice(
                      0,
                      key === "dietary" || key === "materials" ? 6 : 8,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
        {error && <Notice tone="warn">{error}</Notice>}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-saffron"
            onClick={save}
            disabled={Boolean(busy)}
          >
            {busy ?? "Save preference"}
          </button>
          <button
            type="button"
            className="btn btn-line"
            onClick={() => setStage("compose")}
            disabled={Boolean(busy)}
          >
            Back to edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5" data-testid="preference-composer">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="How to add your preference"
      >
        <button
          type="button"
          className="chip"
          aria-pressed={mode === "text"}
          onClick={() => setMode("text")}
        >
          Type
        </button>
        <button
          type="button"
          className="chip"
          aria-pressed={mode === "voice"}
          onClick={() => setMode("voice")}
          disabled={!capabilities.voice}
          data-testid="mode-voice"
        >
          Speak
        </button>
      </div>
      {!capabilities.voice && capabilities.voiceReason && (
        <p className="note" data-testid="voice-unavailable">
          {capabilities.voiceReason}
        </p>
      )}

      <div>
        <label htmlFor="pref-language" className="field-label">
          Language
        </label>
        <select
          id="pref-language"
          className="field max-w-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {mode === "voice" && (
            <option value="unknown">Detect automatically</option>
          )}
          {(mode === "voice" ? speechLanguages : LANGUAGES).map((l) => (
            <option key={l.tag} value={l.tag} lang={l.tag}>
              {l.nativeName === l.name ? l.name : `${l.nativeName} (${l.name})`}
            </option>
          ))}
        </select>
      </div>

      {mode === "voice" && !transcript && (
        <div
          className="rule grid gap-4 rounded-xl border p-5"
          data-testid="voice-panel"
        >
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              data-testid="voice-consent"
            />
            <span>
              I agree that FESTIVA may send this recording to Sarvam AI to turn
              it into text. FESTIVA does not keep the recording. Up to{" "}
              {capabilities.maxRecordingSeconds} seconds.
            </span>
          </label>
          <Recorder
            maxSeconds={capabilities.maxRecordingSeconds}
            disabled={!consent || Boolean(busy)}
            onAudio={(blob, label) => {
              if (audio) URL.revokeObjectURL(audio.url);
              setAudio({ blob, label, url: URL.createObjectURL(blob) });
            }}
          />
          {audio && (
            <div className="grid gap-3">
              <audio controls src={audio.url} className="w-full max-w-md">
                <track kind="captions" />
              </audio>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-saffron"
                  onClick={transcribe}
                  disabled={!consent || Boolean(busy)}
                  data-testid="transcribe"
                >
                  {busy ?? "Transcribe with Sarvam"}
                </button>
                <button
                  type="button"
                  className="btn btn-line"
                  onClick={() => setAudio(null)}
                  disabled={Boolean(busy)}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(mode === "text" || transcript) && (
        <div>
          <label htmlFor="pref-text" className="field-label">
            {transcript
              ? "Check the transcript and correct anything Sarvam misheard"
              : "What would you love to receive, or what should others know?"}
          </label>
          <textarea
            id="pref-text"
            className="field min-h-32"
            lang={language === "unknown" ? undefined : language}
            dir="auto"
            maxLength={1200}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setTranslation(null);
            }}
            placeholder="Something handmade, please. I love block-printed cotton. No sweets this year."
          />
          {transcript && (
            <p
              className="note mt-1 text-[0.85rem]"
              data-testid="transcript-meta"
            >
              Transcribed by Sarvam {transcript.model}
              {transcript.detectedLanguage
                ? `, heard as ${languageByTag.get(transcript.detectedLanguage)?.name ?? transcript.detectedLanguage}`
                : ""}
              {transcript.languageProbability !== null
                ? ` (confidence ${Math.round(transcript.languageProbability * 100)}%)`
                : ""}
              .
            </p>
          )}
        </div>
      )}

      {(mode === "text" || transcript) && language !== organiserLanguage && (
        <div className="rule rounded-xl border p-5">
          {translation ? (
            <div data-testid="translation-editor">
              <label htmlFor="pref-translation" className="field-label">
                Translation into {languageByTag.get(organiserLanguage)?.name},
                saved beside your words
              </label>
              <textarea
                id="pref-translation"
                className="field min-h-24"
                lang={organiserLanguage}
                dir="auto"
                value={translation.text}
                onChange={(e) =>
                  setTranslation({ ...translation, text: e.target.value })
                }
              />
              <p className="note mt-1 text-[0.85rem]">
                By Sarvam {translation.model}. Edit it if something reads wrong,
                or remove it.
              </p>
              <button
                type="button"
                className="link note mt-2"
                onClick={() => setTranslation(null)}
              >
                Remove the translation
              </button>
            </div>
          ) : canTranslate ? (
            <button
              type="button"
              className="btn btn-line"
              onClick={translate}
              disabled={!text.trim() || Boolean(busy)}
              data-testid="translate"
            >
              Translate into {languageByTag.get(organiserLanguage)?.name} for
              the organiser
            </button>
          ) : (
            <p className="note">
              {capabilities.translation
                ? "Sarvam cannot translate between these two languages, so your words will be shared as written."
                : "Translation needs Sarvam, which is not configured on this server. Your words will be shared as written."}
            </p>
          )}
        </div>
      )}

      {error && (
        <Notice tone="warn" testId="composer-error">
          {error}
        </Notice>
      )}
      {(mode === "text" || transcript) && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-saffron"
            onClick={review}
            disabled={!text.trim() || Boolean(busy)}
          >
            {busy ?? "Review details"}
          </button>
          {transcript && (
            <button type="button" className="btn btn-line" onClick={reset}>
              Start again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
