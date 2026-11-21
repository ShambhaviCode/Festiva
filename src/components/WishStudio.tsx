"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { seeded } from "@/domain/random";
import type { Greeting } from "@/domain/types";
import {
  CARD_FONTS,
  CARD_LAYOUTS,
  CARD_PALETTES,
  composeWish,
  LAYOUT_LABELS,
  TONE_LABELS,
  WISH_LANGUAGES,
  WISH_TONES,
  wrapText,
  type CardFontId,
  type CardLayout,
  type CardPaletteId,
  type WishLanguage,
  type WishTone,
} from "@/domain/wishes";
import { track } from "@/lib/analytics";

interface FestivalOption {
  slug: string;
  name: string;
  greetings: Greeting[];
}

const W = 1080;
const H = 1350;

interface CardSpec {
  seed: string;
  headline: string;
  message: string;
  sender: string;
  layout: CardLayout;
  fontCss: string;
  bg: string;
  ink: string;
  accent: string;
}

function rosette(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, seed: string, color: string, alpha: number) {
  const rng = seeded(seed);
  const petals = 8 + Math.floor(rng() * 5) * 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  for (let ring = 0; ring < 3; ring += 1) {
    const r = radius * (1 - ring * 0.3);
    for (let i = 0; i < petals; i += 1) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(((Math.PI * 2) / petals) * i + (ring % 2 ? Math.PI / petals : 0));
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.78, r * 0.1, r * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCard(ctx: CanvasRenderingContext2D, spec: CardSpec) {
  const sans = '"Instrument Sans Variable", system-ui, sans-serif';
  ctx.fillStyle = spec.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = spec.accent;
  ctx.fillStyle = spec.accent;

  let top = 250;
  if (spec.layout === "arch") {
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(90, H - 90);
    ctx.lineTo(90, 560);
    ctx.arc(W / 2, 560, W / 2 - 90, Math.PI, 0);
    ctx.lineTo(W - 90, H - 90);
    ctx.closePath();
    ctx.stroke();
    rosette(ctx, W / 2, 330, 150, spec.seed, spec.accent, 0.95);
    top = 590;
  } else if (spec.layout === "mandala") {
    rosette(ctx, W / 2, H / 2 - 40, 520, spec.seed, spec.accent, 0.16);
    rosette(ctx, W / 2, 220, 95, spec.seed, spec.accent, 0.95);
    top = 430;
  } else if (spec.layout === "border") {
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(84, 84, W - 168, H - 168);
    for (const [x, y] of [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
    }
    top = 330;
  } else {
    ctx.fillRect(W / 2 - 60, 210, 120, 4);
    top = 340;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const maxWidth = spec.layout === "arch" ? W - 330 : W - 260;

  ctx.fillStyle = spec.accent;
  let size = 96;
  let headLines: string[] = [];
  do {
    ctx.font = `500 ${size}px ${spec.fontCss}`;
    headLines = wrapText(spec.headline, maxWidth, (s) => ctx.measureText(s).width);
    size -= 6;
  } while (headLines.length > 3 && size > 44);
  const headSize = size + 6;
  let y = top;
  for (const line of headLines) {
    ctx.fillText(line, W / 2, y);
    y += headSize * 1.12;
  }

  ctx.fillStyle = spec.ink;
  let bodySize = 44;
  let bodyLines: string[] = [];
  const room = H - 300 - (y + 50);
  do {
    ctx.font = `400 ${bodySize}px ${sans}`;
    bodyLines = wrapText(spec.message, maxWidth, (s) => ctx.measureText(s).width);
    bodySize -= 2;
  } while (bodyLines.length * (bodySize + 2) * 1.45 > room && bodySize > 24);
  const lineHeight = (bodySize + 2) * 1.45;
  y += 50;
  for (const line of bodyLines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  if (spec.sender.trim()) {
    ctx.font = `italic 500 46px ${spec.fontCss}`;
    ctx.fillStyle = spec.accent;
    ctx.fillText(spec.sender.trim(), W / 2, H - 250);
  }
  ctx.font = `500 24px ${sans}`;
  ctx.fillStyle = spec.ink;
  ctx.globalAlpha = 0.7;
  ctx.fillText("Made with FESTIVA", W / 2, H - 150);
  ctx.globalAlpha = 1;
}

export function WishStudio({ festivals }: { festivals: FestivalOption[] }) {
  const params = useSearchParams();
  const requested = params.get("festival");
  const [festivalSlug, setFestivalSlug] = useState(() => (festivals.some((f) => f.slug === requested) ? requested! : festivals[0].slug));
  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [language, setLanguage] = useState<WishLanguage>("English");
  const [tone, setTone] = useState<WishTone>("warm");
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [custom, setCustom] = useState<string | null>(null);
  const [layout, setLayout] = useState<CardLayout>("arch");
  const [font, setFont] = useState<CardFontId>("display");
  const [palette, setPalette] = useState<CardPaletteId>("plum");
  const [status, setStatus] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isCustom = festivalSlug === "custom";
  const festival = festivals.find((f) => f.slug === festivalSlug);
  const festivalName = isCustom ? occasion.trim() || "your celebration" : (festival?.name ?? "");
  const greetings = festival?.greetings ?? [];
  const headline = greetings[greetingIndex]?.text ?? (isCustom ? occasion.trim() || "With warm wishes" : `Happy ${festivalName}`);
  const composed = composeWish({ festival: festivalName, recipient, language, tone });
  const message = custom ?? composed;
  const colours = CARD_PALETTES.find((p) => p.id === palette)!;
  const fontCss = CARD_FONTS.find((f) => f.id === font)!.css;
  const fullText = `${headline}\n\n${message}${sender.trim() ? `\n\n${sender.trim()}` : ""}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let cancelled = false;
    const paint = () => {
      if (!cancelled) drawCard(ctx, { seed: festivalSlug, headline, message, sender, layout, fontCss, bg: colours.bg, ink: colours.ink, accent: colours.accent });
    };
    paint();
    // Repaint once web fonts are ready so the export matches the preview.
    void Promise.all([document.fonts.load(`500 96px ${fontCss}`), document.fonts.load('400 44px "Instrument Sans Variable"')]).then(paint, paint);
    return () => {
      cancelled = true;
    };
  }, [festivalSlug, headline, message, sender, layout, fontCss, colours]);

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      const canvas = canvasRef.current;
      if (canvas) canvas.toBlob(resolve, "image/png");
      else resolve(null);
    });
  const fileName = `festiva-wish-${festivalSlug}.png`;

  const exportPng = async () => {
    const blob = await toBlob();
    if (!blob) return setStatus("The card could not be exported in this browser.");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    track("greeting_created", isCustom ? "custom" : festivalSlug);
    setStatus("Card downloaded as a PNG image.");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setStatus("Greeting text copied.");
    } catch {
      setStatus("Copying is blocked in this browser. Select the message text and copy it manually.");
    }
  };

  const share = async () => {
    const blob = await toBlob();
    const file = blob ? new File([blob], fileName, { type: "image/png" }) : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: fullText, title: headline });
        track("greeting_created", isCustom ? "custom" : festivalSlug);
        setStatus("Shared.");
      } else if (navigator.share) {
        await navigator.share({ text: fullText, title: headline });
        setStatus("Shared as text.");
      } else {
        await copyText();
        setStatus("Sharing is not available in this browser, so the greeting text was copied instead. Download the card to send the image.");
      }
    } catch {
      setStatus("Sharing was cancelled.");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
      <form className="grid content-start gap-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-5">
          <label className="grid">
            <span className="field-label">Festival or occasion</span>
            <select
              className="field min-w-60"
              value={festivalSlug}
              data-testid="wish-festival"
              onChange={(e) => {
                setFestivalSlug(e.target.value);
                setGreetingIndex(0);
              }}
            >
              {festivals.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
                </option>
              ))}
              <option value="custom">Another occasion</option>
            </select>
          </label>
          {isCustom && (
            <label className="grid">
              <span className="field-label">Name of the occasion</span>
              <input className="field" value={occasion} maxLength={40} onChange={(e) => setOccasion(e.target.value)} placeholder="For example, Housewarming" />
            </label>
          )}
          {greetings.length > 0 && (
            <label className="grid">
              <span className="field-label">Greeting on the card</span>
              <select className="field min-w-60" value={greetingIndex} onChange={(e) => setGreetingIndex(Number(e.target.value))}>
                {greetings.map((g, i) => (
                  <option key={g.text} value={i}>
                    {g.text} ({g.language})
                  </option>
                ))}
                <option value={-1}>Happy {festivalName}</option>
              </select>
            </label>
          )}
        </div>
        <div className="flex flex-wrap gap-5">
          <label className="grid">
            <span className="field-label">Recipient&rsquo;s name</span>
            <input className="field" value={recipient} maxLength={40} onChange={(e) => setRecipient(e.target.value)} data-testid="wish-recipient" autoComplete="off" />
          </label>
          <label className="grid">
            <span className="field-label">Signed</span>
            <input className="field" value={sender} maxLength={40} onChange={(e) => setSender(e.target.value)} placeholder="With love, …" autoComplete="off" />
          </label>
        </div>
        <fieldset>
          <legend className="field-label">Language</legend>
          <div className="flex flex-wrap gap-2">
            {WISH_LANGUAGES.map((l) => (
              <button key={l} type="button" className="chip" aria-pressed={language === l} onClick={() => (setLanguage(l), setCustom(null))}>
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="field-label">Tone</legend>
          <div className="flex flex-wrap gap-2">
            {WISH_TONES.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tone === t} onClick={() => (setTone(t), setCustom(null))}>
                {TONE_LABELS[t]}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="grid">
          <span className="field-label">Message</span>
          <textarea className="field" rows={4} maxLength={320} value={message} onChange={(e) => setCustom(e.target.value)} data-testid="wish-message" />
          <span className="note mt-1">
            Edit freely.{" "}
            {custom !== null && (
              <button type="button" className="link link-accent" onClick={() => setCustom(null)}>
                Restore the suggested message
              </button>
            )}
          </span>
        </label>
        <fieldset>
          <legend className="field-label">Card design</legend>
          <div className="flex flex-wrap gap-2">
            {CARD_LAYOUTS.map((l) => (
              <button key={l} type="button" className="chip" aria-pressed={layout === l} onClick={() => setLayout(l)}>
                {LAYOUT_LABELS[l]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="field-label">Typeface</legend>
          <div className="flex flex-wrap gap-2">
            {CARD_FONTS.map((f) => (
              <button key={f.id} type="button" className="chip" aria-pressed={font === f.id} onClick={() => setFont(f.id)} style={{ fontFamily: f.css }}>
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="field-label">Colours</legend>
          <div className="flex flex-wrap gap-2">
            {CARD_PALETTES.map((p) => (
              <button key={p.id} type="button" className="chip gap-2" aria-pressed={palette === p.id} onClick={() => setPalette(p.id)}>
                <span aria-hidden="true" className="inline-block h-4 w-4 rounded-full border border-charcoal/30" style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }} />
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          role="img"
          aria-label={`Card preview. ${headline}. ${message}${sender.trim() ? ` Signed ${sender.trim()}.` : ""}`}
          className="mx-auto h-auto w-full max-w-md rounded-xl shadow-[0_24px_60px_-30px_rgba(30,10,35,0.55)]"
          data-testid="wish-canvas"
        />
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button type="button" className="btn btn-saffron" onClick={exportPng} data-testid="wish-export">
            Download card
          </button>
          <button type="button" className="btn btn-line" onClick={copyText} data-testid="wish-copy">
            Copy text
          </button>
          <button type="button" className="btn btn-line" onClick={share}>
            Share
          </button>
        </div>
        <p className="mt-3 min-h-6 text-center text-sm font-medium text-emerald" role="status" aria-live="polite" data-testid="wish-status">
          {status}
        </p>
        <p className="note mt-2 text-center">The card is made in your browser. Names and messages are not sent to FESTIVA.</p>
      </div>
    </div>
  );
}
