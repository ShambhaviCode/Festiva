import grid from "@/data/map-grid.json";

/**
 * Land cells on a 1.5° latitude/longitude grid (Natural Earth, public domain),
 * decoded from runs. Used for FESTIVA's flat dot maps.
 */
export interface Cell {
  lat: number;
  lon: number;
}

let cache: Cell[] | null = null;

export function landCells(): Cell[] {
  if (cache) return cache;
  const out: Cell[] = [];
  const { step, latMax, runs } = grid as { step: number; latMax: number; runs: number[] };
  for (let i = 0; i < runs.length; i += 3) {
    const lat = latMax - runs[i] * step - step / 2;
    for (let c = runs[i + 1]; c <= runs[i + 2]; c += 1) out.push({ lat, lon: -180 + c * step + step / 2 });
  }
  cache = out;
  return out;
}

export const GRID_STEP = (grid as { step: number }).step;

/** Equirectangular projection into a box, with latitude kept between -57° and 84°. */
export function project(lat: number, lon: number, box: { west: number; east: number; north: number; south: number; width: number; height: number }) {
  return {
    x: ((lon - box.west) / (box.east - box.west)) * box.width,
    y: ((box.north - lat) / (box.north - box.south)) * box.height,
  };
}

/**
 * Many dots as one path: each dot is a zero-length segment drawn with a round
 * cap, so a map is one element instead of thousands. Stroke width is the dot's
 * diameter.
 */
export function dotPath(points: { x: number; y: number }[]): string {
  let d = "";
  for (const p of points) d += `M${p.x.toFixed(1)} ${p.y.toFixed(1)}h0`;
  return d;
}
