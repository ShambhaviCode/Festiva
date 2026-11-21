"use client";

import { useEffect, useRef, useState } from "react";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type Mode = "pending" | "webgl" | "canvas" | "static";

/**
 * The homepage globe. Purely decorative: the page is complete without it.
 * Loads Three.js lazily after first paint, falls back to a static 2D drawing
 * when WebGL is unavailable, and to the CSS backdrop alone if both fail.
 */
export function Globe({ markers }: { markers: { lat: number; lon: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const load = async () => {
      try {
        const points = (await import("@/data/globe-points.json")).default as number[];
        if (cancelled) return;
        if (supportsWebGL()) {
          try {
            const { mountGlobe } = await import("./globe/scene");
            if (cancelled) return;
            dispose = mountGlobe(container, { points, markers, reducedMotion });
            setMode("webgl");
            return;
          } catch {
            // fall through to the 2D drawing
          }
        }
        const { mountFallbackGlobe } = await import("./globe/fallback");
        if (cancelled) return;
        dispose = mountFallbackGlobe(container, { points, markers });
        setMode("canvas");
      } catch {
        if (!cancelled) setMode("static");
      }
    };

    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle ? window.requestIdleCallback(() => void load(), { timeout: 1200 }) : globalThis.setTimeout(() => void load(), 200);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle as number);
      else globalThis.clearTimeout(handle);
      dispose?.();
    };
  }, [markers]);

  return (
    <div
      ref={ref}
      data-globe={mode}
      aria-hidden="true"
      className="fade-in relative aspect-square w-full [background:radial-gradient(closest-side,rgba(199,122,42,0.18),rgba(199,122,42,0)_72%)]"
    />
  );
}
