/** FESTIVA's mark: an eight-petal rosette (rangoli, diyas, lanterns, fireworks) beside a bold wordmark. */
const PETALS = ["#ff9f1c", "#e5157a", "#19c39a", "#12b5c4", "#ffc23d", "#ff6b4a", "#8b5cf6", "#00866b"];

export function Rosette({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      {PETALS.map((c, i) => (
        <ellipse key={c} cx="20" cy="9.5" rx="5.2" ry="9" fill={c} transform={`rotate(${i * 45} 20 20)`} opacity="0.95" />
      ))}
      <circle cx="20" cy="20" r="5.4" fill="#fffaf2" />
      <circle cx="20" cy="20" r="2.4" fill="#170833" />
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Rosette className="logo-spin" />
      <span className={`font-[family-name:var(--font-display)] text-[1.55rem] font-[800] leading-none tracking-[-0.045em] ${tone === "dark" ? "text-plum-deep" : "text-ivory"}`}>
        festiva
      </span>
    </span>
  );
}
