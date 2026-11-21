/** Cover art for each game: an original sketch of how the game is played. Decorative. */

const PLUM = "#33143a";
const PLUM_DEEP = "#1e0a23";
const IVORY = "#fbf6ea";
const CREAM = "#f2e7cf";
const SAFFRON = "#f0a030";
const GOLD = "#b9995e";
const GOLD_SOFT = "#dcc898";
const EMERALD = "#0e5a48";
const VERMILION = "#b93626";

function Bloom({
  cx,
  cy,
  r,
  fill,
  centre,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  centre: string;
}) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - r * 0.55}
          rx={r * 0.18}
          ry={r * 0.38}
          fill={fill}
          transform={`rotate(${i * 45} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.2} fill={centre} />
    </g>
  );
}

function Memory() {
  const faceUp = new Set([1, 6, 9, 14]);
  return (
    <>
      <rect width="400" height="300" fill={PLUM} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 92 + (i % 4) * 56;
        const y = 34 + Math.floor(i / 4) * 60;
        const up = faceUp.has(i);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={48}
              height={52}
              rx={7}
              fill={up ? IVORY : CREAM}
              opacity={up ? 1 : 0.16}
              stroke={up ? "none" : GOLD_SOFT}
              strokeOpacity={0.5}
            />
            {up ? (
              <Bloom
                cx={x + 24}
                cy={y + 26}
                r={18}
                fill={i === 1 || i === 14 ? SAFFRON : EMERALD}
                centre={PLUM}
              />
            ) : (
              <path
                d={`M${x + 24} ${y + 16} l8 10 -8 10 -8 -10 Z`}
                fill={GOLD_SOFT}
                opacity={0.5}
              />
            )}
          </g>
        );
      })}
    </>
  );
}

function Quiz() {
  return (
    <>
      <rect width="400" height="300" fill={EMERALD} />
      <text
        x="70"
        y="220"
        fontFamily="var(--font-display)"
        fontSize="200"
        fill={IVORY}
      >
        ?
      </text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={190}
            y={78 + i * 52}
            width={170}
            height={36}
            rx={18}
            fill={i === 1 ? SAFFRON : IVORY}
            opacity={i === 1 ? 1 : 0.18}
          />
          <rect
            x={210}
            y={93 + i * 52}
            width={i === 1 ? 90 : 110}
            height={6}
            rx={3}
            fill={i === 1 ? PLUM_DEEP : IVORY}
            opacity={i === 1 ? 0.8 : 0.5}
          />
          {i === 1 && (
            <path
              d={`M330 ${96 + i * 52} l7 7 13 -14`}
              fill="none"
              stroke={PLUM_DEEP}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>
      ))}
    </>
  );
}

function Rangoli() {
  const c = { x: 200, y: 150 };
  return (
    <>
      <rect width="400" height="300" fill={PLUM_DEEP} />
      {[110, 80, 52].map((r, ring) =>
        Array.from({ length: 16 }, (_, i) => {
          const a = ((i * 360) / 16 + ring * 11.25) * (Math.PI / 180);
          const x = c.x + Math.cos(a) * r;
          const y = c.y + Math.sin(a) * r;
          return ring === 1 ? (
            <ellipse
              key={`${ring}-${i}`}
              cx={x}
              cy={y}
              rx={6}
              ry={14}
              fill={[SAFFRON, VERMILION, GOLD_SOFT][i % 3]}
              transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
            />
          ) : (
            <circle
              key={`${ring}-${i}`}
              cx={x}
              cy={y}
              r={ring === 0 ? 4 : 6}
              fill={ring === 0 ? IVORY : SAFFRON}
              opacity={ring === 0 ? 0.7 : 1}
            />
          );
        }),
      )}
      <Bloom cx={c.x} cy={c.y} r={38} fill={VERMILION} centre={SAFFRON} />
      <circle
        cx={c.x}
        cy={c.y}
        r={128}
        fill="none"
        stroke={GOLD}
        strokeDasharray="2 6"
      />
    </>
  );
}

function Challenge() {
  const c = { x: 140, y: 150 };
  return (
    <>
      <rect width="400" height="300" fill={SAFFRON} />
      {Array.from({ length: 60 }, (_, i) => (
        <rect
          key={i}
          x={c.x - 1.5}
          y={c.y - 100}
          width={3}
          height={i % 5 === 0 ? 14 : 7}
          fill={PLUM_DEEP}
          opacity={i < 42 ? 0.9 : 0.25}
          transform={`rotate(${i * 6} ${c.x} ${c.y})`}
        />
      ))}
      <text
        x={c.x}
        y={c.y + 22}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="64"
        fill={PLUM_DEEP}
      >
        42
      </text>
      <rect x={262} y={98} width={104} height={40} rx={20} fill={PLUM_DEEP} />
      <text
        x={314}
        y={124}
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
        fill={IVORY}
        fontFamily="var(--font-sans)"
      >
        True
      </text>
      <rect
        x={262}
        y={152}
        width={104}
        height={40}
        rx={20}
        fill="none"
        stroke={PLUM_DEEP}
        strokeWidth={2}
      />
      <text
        x={314}
        y={178}
        textAnchor="middle"
        fontSize="16"
        fontWeight="600"
        fill={PLUM_DEEP}
        fontFamily="var(--font-sans)"
      >
        False
      </text>
    </>
  );
}

function Puzzle() {
  const size = 66;
  const ox = 101;
  const oy = 51;
  return (
    <>
      <rect width="400" height="300" fill={CREAM} />
      <defs>
        <clipPath id="puzzle-board">
          <rect x={ox} y={oy} width={size * 3} height={size * 3} />
        </clipPath>
      </defs>
      <g clipPath="url(#puzzle-board)">
        <rect x={ox} y={oy} width={size * 3} height={size * 3} fill={PLUM} />
        <Bloom
          cx={ox + size * 1.5}
          cy={oy + size * 1.5}
          r={95}
          fill={SAFFRON}
          centre={EMERALD}
        />
        <circle
          cx={ox + size * 1.5}
          cy={oy + size * 1.5}
          r={70}
          fill="none"
          stroke={GOLD_SOFT}
          strokeWidth={2}
        />
      </g>
      {[1, 2].map((i) => (
        <g key={i}>
          <line
            x1={ox + size * i}
            y1={oy}
            x2={ox + size * i}
            y2={oy + size * 3}
            stroke={CREAM}
            strokeWidth={4}
          />
          <line
            x1={ox}
            y1={oy + size * i}
            x2={ox + size * 3}
            y2={oy + size * i}
            stroke={CREAM}
            strokeWidth={4}
          />
        </g>
      ))}
      <rect
        x={ox + size * 2 + 2}
        y={oy + size * 2 + 2}
        width={size - 4}
        height={size - 4}
        fill={CREAM}
      />
      <rect
        x={ox + size * 2 + 8}
        y={oy + size * 2 + 8}
        width={size - 16}
        height={size - 16}
        rx={6}
        fill="none"
        stroke={GOLD}
        strokeDasharray="4 4"
      />
    </>
  );
}

const COVERS = {
  memory: Memory,
  quiz: Quiz,
  rangoli: Rangoli,
  challenge: Challenge,
  puzzle: Puzzle,
} as const;

export function GameCover({
  slug,
  className,
}: {
  slug: keyof typeof COVERS;
  className?: string;
}) {
  const Cover = COVERS[slug];
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <Cover />
    </svg>
  );
}
