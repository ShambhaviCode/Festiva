import { geoEqualEarth } from "d3-geo";
import projection from "@/data/geo-projection.json";

/**
 * The same Equal Earth projection the map shapes in /public/geo were drawn with
 * (scripts/build-geo.mjs), so festival coordinates land exactly on the map. Server-side only.
 */
const project = geoEqualEarth().scale(projection.scale).translate(projection.translate as [number, number]);

export function toMap(lat: number, lon: number): [number, number] | null {
  const p = project([lon, lat]);
  return p ? [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10] : null;
}

export const MAP_SIZE = { width: projection.width, height: projection.height };
