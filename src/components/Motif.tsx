import { seeded } from "@/domain/random";

interface MotifProps {
  seed: string;
  palette: readonly [string, string, string];
  className?: string;
  /** Provide a label only when the artwork conveys something the text does not. */
  label?: string;
}

/**
 * Original generative artwork: a rosette built from rings of simple shapes.
 * Each subject gets a stable pattern from its seed and palette. It is
 * FESTIVA's own abstract art and deliberately does not imitate any sacred or
 * traditional design.
 */
export function Motif({ seed, palette, className, label }: MotifProps) {
  const rng = seeded(seed);
  const [bg, a, b] = palette;
  const cx = 200;
  const cy = 270;
  const count = 8 + Math.floor(rng() * 5) * 2;
  const rings = 3 + Math.floor(rng() * 2);
  const shapes: React.ReactNode[] = [];
  for (let r = 0; r < rings; r += 1) {
    const radius = 176 - r * (136 / rings);
    const kind = Math.floor(rng() * 3);
    const fill = r % 2 === 0 ? a : b;
    const n = Math.max(6, count - r * 2);
    const offset = r % 2 === 0 ? 0 : 180 / n;
    for (let i = 0; i < n; i += 1) {
      const angle = (360 / n) * i + offset;
      const key = `${r}-${i}`;
      const transform = `rotate(${angle.toFixed(2)} ${cx} ${cy})`;
      if (kind === 0) {
        shapes.push(<ellipse key={key} cx={cx} cy={cy - radius} rx={radius * 0.13} ry={radius * 0.3} fill={fill} opacity={0.9 - r * 0.12} transform={transform} />);
      } else if (kind === 1) {
        const s = radius * 0.16;
        shapes.push(<path key={key} d={`M${cx} ${cy - radius - s} L${cx + s * 0.7} ${cy - radius} L${cx} ${cy - radius + s} L${cx - s * 0.7} ${cy - radius} Z`} fill={fill} opacity={0.92 - r * 0.1} transform={transform} />);
      } else {
        shapes.push(<circle key={key} cx={cx} cy={cy - radius} r={Math.max(3, radius * 0.07)} fill={fill} opacity={0.95} transform={transform} />);
      }
    }
    shapes.push(<circle key={`ring-${r}`} cx={cx} cy={cy} r={radius * 0.72} fill="none" stroke={r % 2 === 0 ? b : a} strokeWidth={0.8} opacity={0.5} />);
  }
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
      <rect width="400" height="500" fill={bg} />
      {shapes}
      <circle cx={cx} cy={cy} r={16} fill={a} />
      <circle cx={cx} cy={cy} r={6} fill={bg} />
    </svg>
  );
}
