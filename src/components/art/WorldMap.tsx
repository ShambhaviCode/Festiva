import Link from "next/link";
import { dotPath, landCells, project } from "./map";

export interface MapPlace {
  slug: string;
  href: string;
  name: string;
  detail: string;
  lat: number;
  lon: number;
}

const BOX = { west: -180, east: 180, north: 84, south: -57, width: 1000, height: (1000 * 141) / 360 };

/**
 * A flat dot map of the world with every destination pinned. Each pin is a
 * real link (keyboard-focusable), named for screen readers, and shows its
 * label on hover or focus. Pins arrive from west to east once, to show how
 * widely the guide spreads; reduced motion shows them at once.
 * Rendered on the server: the land dots are plain SVG with no script.
 */
export function WorldMap({ places }: { places: MapPlace[] }) {
  const dots = dotPath(landCells().map((c) => project(c.lat, c.lon, BOX)));
  const ordered = [...places].sort((a, b) => a.lon - b.lon);
  return (
    <div className="relative" data-testid="world-map">
      <svg viewBox={`0 0 ${BOX.width} ${BOX.height.toFixed(0)}`} className="block h-auto w-full" aria-hidden="true" focusable="false">
        <path d={dots} stroke="var(--color-ivory)" strokeOpacity={0.32} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </svg>
      <ul aria-label="Destinations on the map">
        {ordered.map((place, index) => {
          const { x, y } = project(place.lat, place.lon, BOX);
          const left = (x / BOX.width) * 100;
          const top = (y / BOX.height) * 100;
          return (
            <li key={place.slug} className="absolute" style={{ left: `${left}%`, top: `${top}%` }}>
              <Link
                href={place.href}
                className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 outline-offset-2"
                aria-label={`${place.name}, ${place.detail}`}
              >
                <span className="seat-arrive block h-3 w-3 rounded-full border-2 border-plum-deep bg-saffron shadow-[0_0_0_3px_rgba(240,160,48,0.25)] transition-transform duration-200 group-hover:scale-150 group-focus-visible:scale-150" style={{ animationDelay: `${300 + index * 45}ms` }} />
                <span className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden w-max max-w-[14rem] rounded-lg bg-ivory px-3 py-2 text-left text-charcoal shadow-lg group-hover:block group-focus-visible:block ${left > 70 ? "right-0" : left < 30 ? "left-0" : "left-1/2 -translate-x-1/2"}`}>
                  <span className="block font-[family-name:var(--font-display)] text-lg leading-tight">{place.name}</span>
                  <span className="block text-[0.8rem] text-ink">{place.detail}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
