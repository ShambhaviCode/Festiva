"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { symmetryPoints } from "@/domain/games";
import { Completion, GameStats } from "./GameShell";

const SIZE = 720;
const COLOURS = [
  { name: "Saffron", value: "#f0a030" },
  { name: "Vermilion", value: "#d7432f" },
  { name: "Magenta", value: "#c2267a" },
  { name: "Emerald", value: "#17876c" },
  { name: "Indigo", value: "#3a4bb3" },
  { name: "Ivory", value: "#fbf6ea" },
  { name: "Gold", value: "#dca92b" },
];
const FOLDS = [6, 8, 12, 16];

interface Stroke {
  colour: string;
  width: number;
  folds: number;
  mirror: boolean;
  /** Points in canvas units. A single point draws a dot. */
  points: [number, number][];
}

function paint(ctx: CanvasRenderingContext2D, strokes: Stroke[]) {
  ctx.fillStyle = "#1e0a23";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = "rgba(220,200,152,0.14)";
  ctx.lineWidth = 1;
  for (const r of [90, 180, 270, 340]) {
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const stroke of strokes) {
    ctx.strokeStyle = stroke.colour;
    ctx.fillStyle = stroke.colour;
    ctx.lineWidth = stroke.width;
    const copies = symmetryPoints(stroke.points[0][0], stroke.points[0][1], SIZE / 2, SIZE / 2, stroke.folds, stroke.mirror).length;
    for (let c = 0; c < copies; c += 1) {
      ctx.beginPath();
      stroke.points.forEach(([x, y], i) => {
        const [px, py] = symmetryPoints(x, y, SIZE / 2, SIZE / 2, stroke.folds, stroke.mirror)[c];
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      if (stroke.points.length === 1) {
        const [px, py] = symmetryPoints(stroke.points[0][0], stroke.points[0][1], SIZE / 2, SIZE / 2, stroke.folds, stroke.mirror)[c];
        ctx.beginPath();
        ctx.arc(px, py, stroke.width * 0.9, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.stroke();
    }
  }
}

export function RangoliDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [colour, setColour] = useState(COLOURS[0].value);
  const [folds, setFolds] = useState(8);
  const [mirror, setMirror] = useState(true);
  const [width, setWidth] = useState(6);
  const [finished, setFinished] = useState(false);
  const drawing = useRef<Stroke | null>(null);

  const redraw = useCallback((list: Stroke[]) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) paint(ctx, list);
  }, []);

  useEffect(() => redraw(strokes), [strokes, redraw]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = event.currentTarget.getBoundingClientRect();
    return [((event.clientX - rect.left) / rect.width) * SIZE, ((event.clientY - rect.top) / rect.height) * SIZE];
  };

  const onDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = { colour, width, folds, mirror, points: [point(event)] };
    redraw([...strokes, drawing.current]);
  };
  const onMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current.points.push(point(event));
    redraw([...strokes, drawing.current]);
  };
  const onUp = () => {
    if (!drawing.current) return;
    const done = drawing.current;
    drawing.current = null;
    setStrokes((s) => [...s, done]);
    setFinished(false);
  };

  /** Keyboard-friendly way to build a design: adds a ring of shapes at the next radius. */
  const addRing = (kind: "petals" | "dots") => {
    const ring = strokes.length % 6;
    const radius = 60 + ring * 52;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const points: [number, number][] =
      kind === "dots"
        ? [[cx, cy - radius]]
        : Array.from({ length: 13 }, (_, i) => {
            const t = (i / 12) * Math.PI;
            return [cx + Math.sin(t) * radius * 0.16 * Math.sin(t), cy - radius + Math.cos(t) * radius * 0.3 - radius * 0.02] as [number, number];
          });
    setStrokes((s) => [...s, { colour, width, folds, mirror: kind === "petals" ? mirror : false, points }]);
    setFinished(false);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "festiva-rangoli.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
    setFinished(true);
  };

  const colours = new Set(strokes.map((s) => s.colour)).size;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-12">
      <div>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label={`Rangoli canvas with ${strokes.length} strokes in ${folds}-fold symmetry. Draw with a pointer, or use the Add ring buttons.`}
          className="aspect-square w-full touch-none rounded-2xl"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          data-testid="rangoli-canvas"
        />
      </div>
      <div className="grid content-start gap-6">
        <GameStats game="rangoli" items={[["Strokes", strokes.length], ["Colours used", colours]]} />
        <fieldset>
          <legend className="field-label">Colour</legend>
          <div className="flex flex-wrap gap-2">
            {COLOURS.map((c) => (
              <button key={c.value} type="button" className="chip gap-2" aria-pressed={colour === c.value} onClick={() => setColour(c.value)}>
                <span aria-hidden="true" className="inline-block h-4 w-4 rounded-full border border-charcoal/30" style={{ background: c.value }} />
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="field-label">Symmetry</legend>
          <div className="flex flex-wrap gap-2">
            {FOLDS.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={folds === f} onClick={() => setFolds(f)}>
                {f} fold
              </button>
            ))}
            <button type="button" className="chip" aria-pressed={mirror} onClick={() => setMirror((m) => !m)}>
              Mirror
            </button>
          </div>
        </fieldset>
        <label className="grid max-w-xs">
          <span className="field-label">Line width</span>
          <input type="range" min={2} max={18} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </label>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className="btn btn-plum btn-sm" onClick={() => addRing("petals")} data-testid="rangoli-add-petals">
            Add a ring of petals
          </button>
          <button type="button" className="btn btn-plum btn-sm" onClick={() => addRing("dots")}>
            Add a ring of dots
          </button>
          <button type="button" className="btn btn-line btn-sm" onClick={() => setStrokes((s) => s.slice(0, -1))} disabled={strokes.length === 0}>
            Undo
          </button>
          <button type="button" className="btn btn-line btn-sm" onClick={() => (setStrokes([]), setFinished(false))} disabled={strokes.length === 0} data-testid="game-reset">
            Clear
          </button>
        </div>
        <button type="button" className="btn btn-saffron w-fit" onClick={exportPng} disabled={strokes.length === 0} data-testid="rangoli-export">
          Finish and download
        </button>
        {finished && (
          <Completion title="Your rangoli is saved as an image." onReset={() => (setStrokes([]), setFinished(false))} resetLabel="Start a new design">
            <p>
              {strokes.length} strokes in {colours} {colours === 1 ? "colour" : "colours"}. Try recreating it at your doorstep in chalk, flowers or coloured rice.
            </p>
          </Completion>
        )}
        <p className="note max-w-md">Rangoli, kolam and alpana are floor patterns drawn at thresholds across South Asia to welcome guests. This designer is a free sketching tool with radial symmetry, not a reproduction of any traditional design.</p>
      </div>
    </div>
  );
}
