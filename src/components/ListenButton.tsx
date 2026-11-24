"use client";

import { useEffect, useRef, useState } from "react";

/** The first sentences of a reply, up to the length Sarvam is asked to speak. */
function speakable(text: string, max = 480): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("। "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return (end > 80 ? cut.slice(0, end + 1) : cut).trim();
}

/**
 * Reads a reply aloud with Sarvam text-to-speech (POST /api/speak). One press fetches and plays it; pressing
 * again stops it. The audio is kept only in memory for replays and is released when the button goes away.
 */
export function ListenButton({ text, language, label = "Listen", className = "" }: { text: string; language: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);

  useEffect(
    () => () => {
      audio.current?.pause();
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );

  const play = async () => {
    if (state === "playing") {
      audio.current?.pause();
      setState("idle");
      return;
    }
    setError(null);
    try {
      if (!url.current) {
        setState("loading");
        const res = await fetch("/api/speak", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: speakable(text), language }) });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "The reply could not be read aloud. It is still shown as text.");
        }
        url.current = URL.createObjectURL(await res.blob());
      }
      const a = new Audio(url.current);
      a.addEventListener("ended", () => setState("idle"));
      a.addEventListener("error", () => { setState("idle"); setError("The audio could not be played."); });
      audio.current = a;
      await a.play();
      setState("playing");
    } catch (e) {
      setState("idle");
      setError(e instanceof Error ? e.message : "The reply could not be read aloud.");
    }
  };

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <button type="button" onClick={play} disabled={state === "loading"} aria-busy={state === "loading"} aria-pressed={state === "playing"} className="btn btn-sm btn-plum" data-testid="listen">
        {state !== "loading" && (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
            {state === "playing" ? <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /> : <path d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" fill="currentColor" />}
          </svg>
        )}
        {state === "loading" ? "Getting the voice…" : state === "playing" ? "Stop" : label}
      </button>
      {error && <span className="text-sm font-medium text-vermilion" role="alert">{error}</span>}
    </span>
  );
}
