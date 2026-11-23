import { BRAND_LOGOS } from "@/data/brand-logos";
import Image from "next/image";
import { imageFor } from "@/data/photo-fallbacks";
import { seeded } from "@/domain/random";
import type { Food, GiftTier } from "@/domain/types";
import { Motif } from "../Motif";
import { dotPath, GRID_STEP, landCells, project } from "./map";

/**
 * FESTIVA's illustration system. Every kind of content has its own original,
 * generated artwork in the shared palette, so a dish never looks like a city:
 *
 *   festival    → arch rosette (Motif)
 *   dish        → a plate seen from above, arranged by course
 *   garment     → a woven textile swatch
 *   place       → a dot-map locator around its real coordinates
 *   brand       → the name set in FESTIVA's own type (never a logo)
 *
 * All artwork is decorative (aria-hidden): the title beside it carries the meaning.
 */

export type Art =
  | { kind: "rosette" }
  | { kind: "plate"; course: Food["type"]; hint?: string }
  | { kind: "textile" }
  | { kind: "locator"; lat: number; lon: number }
  | { kind: "brand"; name: string; tier: GiftTier; origin: string };

type Palette = readonly [string, string, string];

const IVORY = "#fbf6ea";
const CREAM = "#f2e7cf";

/** Frame shape per kind: the shape itself tells you what you are looking at. */
export function frameClass(kind: Art["kind"]): string {
  switch (kind) {
    case "rosette":
      return "arch aspect-[4/5]";
    case "plate":
      return "aspect-square overflow-hidden rounded-full";
    case "textile":
      return "aspect-[4/5] overflow-hidden rounded-[0.35rem]";
    case "locator":
    case "brand":
      return "aspect-[4/3] overflow-hidden rounded-2xl";
  }
}

export function ArtImage({ art, seed, palette, className = "h-full w-full", sizes = "(max-width: 768px) 90vw, 40vw" }: { art: Art; seed: string; palette: Palette; className?: string; sizes?: string }) {
  // A freely licensed photograph when one has been sourced; otherwise the generated artwork.
  const photo = imageFor(art.kind, seed);
  if (photo) return <Image src={photo.src} alt="" aria-hidden="true" width={photo.width} height={photo.height} sizes={sizes} className={`${className} object-cover`} style={{ backgroundColor: palette[0] }} />;
  switch (art.kind) {
    case "rosette":
      return <Motif seed={seed} palette={palette} className={className} />;
    case "plate":
      return <Plate seed={seed} palette={palette} course={art.course} hint={art.hint} className={className} />;
    case "textile":
      return <Textile seed={seed} palette={palette} className={className} />;
    case "locator":
      return <Locator lat={art.lat} lon={art.lon} palette={palette} className={className} />;
    case "brand":
      return <BrandTile name={art.name} tier={art.tier} origin={art.origin} logo={BRAND_LOGOS[seed]?.src} className={className} />;
  }
}

/* ------------------------------------------------------------------ */

/** Sweets take the shape the dish's own description gives them, so a dumpling is never drawn as a square. */
function sweetShape(hint: string | undefined, fallback: number): number {
  if (!hint) return fallback;
  if (/\b(ball|balls|dumpling|dumplings|laddu|ladoo|round|sphere|spheres)\b/i.test(hint)) return 0;
  if (/\bdiamond/i.test(hint)) return 1;
  if (/\b(square|squares|bar|bars|block|blocks|fudge|slab|cake|cut)\b/i.test(hint)) return 2;
  return fallback;
}

export function Plate({ seed, palette, course, hint, className }: { seed: string; palette: Palette; course: Food["type"]; hint?: string; className?: string }) {
  const rng = seeded(`plate:${seed}`);
  const [bg, a, b] = palette;
  const c = 200;
  const rimMarks = 18 + Math.floor(rng() * 4) * 6;
  const rimKind = Math.floor(rng() * 3);
  const food: React.ReactNode[] = [];

  if (course === "sweet") {
    const n = 5 + Math.floor(rng() * 4);
    const shape = sweetShape(hint, Math.floor(rng() * 3));
    const ring = n > 6 ? 62 : 52;
    for (let i = 0; i < n; i += 1) {
      const angle = (i / n) * Math.PI * 2 + rng() * 0.15;
      const x = c + Math.cos(angle) * ring;
      const y = c + Math.sin(angle) * ring;
      if (shape === 0) food.push(<g key={i}><circle cx={x} cy={y} r={24} fill={a} /><circle cx={x - 7} cy={y - 8} r={6} fill={IVORY} opacity={0.55} /></g>);
      else if (shape === 1) food.push(<path key={i} d={`M${x} ${y - 26} L${x + 20} ${y} L${x} ${y + 26} L${x - 20} ${y} Z`} fill={a} stroke={b} strokeWidth={2} transform={`rotate(${(angle * 180) / Math.PI} ${x} ${y})`} />);
      else food.push(<rect key={i} x={x - 20} y={y - 20} width={40} height={40} rx={9} fill={a} stroke={b} strokeWidth={2} transform={`rotate(${(angle * 180) / Math.PI + 45} ${x} ${y})`} />);
    }
    food.push(<circle key="centre" cx={c} cy={c} r={20} fill={b} />);
  } else if (course === "main") {
    food.push(<ellipse key="mound" cx={c - 18} cy={c + 6} rx={78} ry={70} fill={a} />);
    for (let i = 0; i < 40; i += 1) {
      const angle = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * 60;
      food.push(<ellipse key={`g${i}`} cx={c - 18 + Math.cos(angle) * r} cy={c + 6 + Math.sin(angle) * r * 0.9} rx={4.5} ry={2} fill={IVORY} opacity={0.5} transform={`rotate(${rng() * 180} ${c - 18 + Math.cos(angle) * r} ${c + 6 + Math.sin(angle) * r * 0.9})`} />);
    }
    food.push(<path key="leaf" d={`M${c + 40} ${c - 70} q 58 20 52 86 q -54 -14 -52 -86 Z`} fill={b} />);
    food.push(<circle key="bowl" cx={c + 62} cy={c + 62} r={30} fill={b} stroke={IVORY} strokeWidth={5} />);
  } else if (course === "snack") {
    const n = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i += 1) {
      const angle = (i / n) * Math.PI * 2;
      const x = c + Math.cos(angle) * 58;
      const y = c + Math.sin(angle) * 58;
      let d = `M${x} ${y}`;
      for (let t = 0; t < 22; t += 1) {
        const r = 3 + t * 1.6;
        d += ` L${(x + Math.cos(t * 0.75) * r).toFixed(1)} ${(y + Math.sin(t * 0.75) * r).toFixed(1)}`;
      }
      food.push(<path key={i} d={d} fill="none" stroke={a} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />);
    }
  } else {
    food.push(<circle key="cup" cx={c} cy={c} r={74} fill={a} />);
    food.push(<rect key="handle" x={c + 66} y={c - 14} width={44} height={28} rx={14} fill={a} />);
    food.push(<circle key="liquid" cx={c} cy={c} r={58} fill={b} />);
    food.push(<path key="swirl" d={`M${c - 30} ${c} q 15 -24 30 0 t 30 0`} fill="none" stroke={IVORY} strokeWidth={4} strokeLinecap="round" opacity={0.7} />);
  }

  const marks = Array.from({ length: rimMarks }, (_, i) => {
    const t = `rotate(${(360 / rimMarks) * i} ${c} ${c})`;
    if (rimKind === 0) return <circle key={i} cx={c} cy={c - 156} r={4} fill={a} transform={t} />;
    if (rimKind === 1) return <rect key={i} x={c - 2} y={c - 166} width={4} height={18} rx={2} fill={a} transform={t} />;
    return <ellipse key={i} cx={c} cy={c - 157} rx={5} ry={10} fill={i % 2 ? a : b} transform={t} />;
  });

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <rect width="400" height="400" fill={bg} />
      <circle cx={c} cy={c + 6} r={176} fill="#000" opacity={0.12} />
      <circle cx={c} cy={c} r={176} fill={IVORY} />
      {marks}
      <circle cx={c} cy={c} r={138} fill={CREAM} />
      <circle cx={c} cy={c} r={138} fill="none" stroke={a} strokeWidth={1.2} opacity={0.5} />
      {food}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export function Textile({ seed, palette, className }: { seed: string; palette: Palette; className?: string }) {
  const rng = seeded(`textile:${seed}`);
  const [bg, a, b] = palette;
  const colours = [bg, a, b, IVORY];
  const bands: React.ReactNode[] = [];
  let y = 0;
  let i = 0;
  while (y < 440) {
    const h = Math.min(440 - y, 26 + Math.floor(rng() * 5) * 16);
    const base = colours[i % 2 === 0 ? 0 : Math.floor(rng() * 4)];
    const ink = colours[(colours.indexOf(base) + 1 + Math.floor(rng() * 3)) % 4];
    const kind = Math.floor(rng() * 6);
    const key = `b${i}`;
    bands.push(<rect key={key} x={0} y={y} width={400} height={h} fill={base} />);
    if (kind === 1) {
      for (let x = 6; x < 400; x += 14) bands.push(<rect key={`${key}-${x}`} x={x} y={y} width={4} height={h} fill={ink} opacity={0.8} />);
    } else if (kind === 2) {
      let d = `M0 ${y + h * 0.75}`;
      for (let x = 0; x <= 400; x += 20) d += ` L${x + 10} ${y + h * 0.25} L${x + 20} ${y + h * 0.75}`;
      bands.push(<path key={`${key}-z`} d={d} fill="none" stroke={ink} strokeWidth={Math.max(3, h / 9)} strokeLinejoin="round" />);
    } else if (kind === 3) {
      const s = Math.min(h * 0.42, 22);
      for (let x = s; x < 400; x += s * 2.4)
        bands.push(<path key={`${key}-${x}`} d={`M${x} ${y + h / 2 - s} L${x + s * 0.8} ${y + h / 2} L${x} ${y + h / 2 + s} L${x - s * 0.8} ${y + h / 2} Z`} fill={ink} opacity={0.9} />);
    } else if (kind === 4) {
      const s = Math.max(10, h / 3);
      for (let x = 0; x < 400; x += s) for (let yy = y; yy < y + h; yy += s) if ((Math.round(x / s) + Math.round((yy - y) / s)) % 2 === 0) bands.push(<rect key={`${key}-${x}-${yy}`} x={x} y={yy} width={s} height={Math.min(s, y + h - yy)} fill={ink} opacity={0.35} />);
    } else if (kind === 5) {
      for (let x = 10; x < 400; x += 22) bands.push(<circle key={`${key}-${x}`} cx={x} cy={y + h / 2} r={Math.min(5, h / 5)} fill={ink} />);
    }
    // A thin woven edge between bands.
    bands.push(<rect key={`${key}-edge`} x={0} y={y + h - 2} width={400} height={2} fill={IVORY} opacity={0.25} />);
    y += h;
    i += 1;
  }
  const fringe = Array.from({ length: 50 }, (_, k) => <line key={`f${k}`} x1={4 + k * 8} y1={440} x2={4 + k * 8 + (rng() - 0.5) * 4} y2={470 + rng() * 22} stroke={a} strokeWidth={2.4} strokeLinecap="round" />);
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <rect width="400" height="500" fill={CREAM} />
      {bands}
      {fringe}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

/** A dot map around a real place, with a marker on its coordinates. */
export function Locator({ lat, lon, palette, className, span = 44 }: { lat: number; lon: number; palette: Palette; className?: string; span?: number }) {
  const [bg, a] = palette;
  const width = 400;
  const height = 300;
  const halfLon = span / 2;
  const halfLat = (span * height) / width / 2;
  const box = { west: lon - halfLon, east: lon + halfLon, north: lat + halfLat, south: lat - halfLat, width, height };
  const r = ((GRID_STEP / span) * width) / 2 - 1.2;
  const near: { x: number; y: number }[] = [];
  const far: { x: number; y: number }[] = [];
  for (const p of landCells()) {
    if (p.lon < box.west - GRID_STEP || p.lon > box.east + GRID_STEP || p.lat > box.north + GRID_STEP || p.lat < box.south - GRID_STEP) continue;
    (Math.hypot(p.lat - lat, p.lon - lon) < span / 7 ? near : far).push(project(p.lat, p.lon, box));
  }
  const diameter = Math.max(1.6, r) * 2;
  const { x, y } = project(lat, lon, box);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true" focusable="false">
      <rect width={width} height={height} fill={bg} />
      <line x1={0} y1={y} x2={width} y2={y} stroke={IVORY} strokeWidth={0.6} opacity={0.25} strokeDasharray="2 5" />
      <line x1={x} y1={0} x2={x} y2={height} stroke={IVORY} strokeWidth={0.6} opacity={0.25} strokeDasharray="2 5" />
      <path d={dotPath(far)} stroke={IVORY} strokeOpacity={0.42} strokeWidth={diameter} strokeLinecap="round" fill="none" />
      <path d={dotPath(near)} stroke={a} strokeOpacity={0.95} strokeWidth={diameter} strokeLinecap="round" fill="none" />
      <circle cx={x} cy={y} r={18} fill="none" stroke={a} strokeWidth={1.5} className="locator-pulse" />
      <circle cx={x} cy={y} r={9} fill={a} stroke={IVORY} strokeWidth={3} />
      <text x={14} y={height - 14} fill={IVORY} opacity={0.7} fontSize={12} fontFamily="var(--font-sans)" letterSpacing="0.04em">
        {Math.abs(lat).toFixed(1)}°{lat >= 0 ? "N" : "S"} {Math.abs(lon).toFixed(1)}°{lon >= 0 ? "E" : "W"}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const TIER_STYLE: Record<GiftTier, { bg: string; ink: string; rule: string; word: string }> = {
  everyday: { bg: CREAM, ink: "#241f27", rule: "#b9995e", word: "Everyday" },
  premium: { bg: "#0e5a48", ink: IVORY, rule: "#dcc898", word: "Premium" },
  elite: { bg: "#1e0a23", ink: "#dcc898", rule: "#b9995e", word: "Elite luxury" },
};

/** A brand shown by name in FESTIVA's own typography. It deliberately does not imitate any brand's logo. */
export function BrandTile({ name, tier, origin, logo, className }: { name: string; tier: GiftTier; origin: string; logo?: string; className?: string }) {
  const s = TIER_STYLE[tier];
  // The brand's own logo, when a licensed copy exists: shown on a white plate so it keeps its colours.
  if (logo) {
    return (
      <div className={`relative flex flex-col items-center justify-center gap-4 bg-white p-8 text-center ${className ?? ""}`} aria-hidden="true">
        <span className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: s.rule, opacity: 0.55 }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- a small static SVG logo; next/image adds nothing here */}
        <img src={logo} alt="" className="max-h-[42%] w-auto max-w-[72%] object-contain" />
        <span className="text-[0.85rem] italic text-ink">
          {s.word}, from {origin}
        </span>
      </div>
    );
  }
  const size = name.length > 12 ? "text-[clamp(1.6rem,3.2vw,2.4rem)]" : "text-[clamp(1.9rem,4vw,3rem)]";
  return (
    <div className={`relative flex flex-col items-center justify-center p-6 text-center ${className ?? ""}`} style={{ background: s.bg, color: s.ink }} aria-hidden="true">
      <span className="pointer-events-none absolute inset-3 rounded-xl border" style={{ borderColor: s.rule, opacity: tier === "everyday" ? 0.6 : 0.9 }} />
      {tier === "elite" && <span className="pointer-events-none absolute inset-[1.15rem] rounded-lg border" style={{ borderColor: s.rule, opacity: 0.6 }} />}
      <span className={`font-[family-name:var(--font-display)] leading-none ${size}`}>{name}</span>
      <span className="mt-3 text-[0.85rem] italic" style={{ opacity: 0.85 }}>
        {s.word}, from {origin}
      </span>
    </div>
  );
}
