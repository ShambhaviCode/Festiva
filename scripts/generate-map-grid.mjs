// Generates src/data/map-grid.json: land cells on a regular latitude/longitude grid,
// stored as runs, for FESTIVA's flat dot maps (Journeys world map and place locators).
// Land outlines: Natural Earth (public domain) via the `world-atlas` package.
// Run with: npm run generate:map
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topology = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-110m.json", import.meta.url), "utf8"));
const land = feature(topology, topology.objects.land);

const STEP = 1.5;
const LAT_MAX = 84;
const LAT_MIN = -57; // leave out Antarctica
const rows = Math.round((LAT_MAX - LAT_MIN) / STEP);
const cols = Math.round(360 / STEP);
const runs = [];
let cells = 0;
for (let r = 0; r < rows; r += 1) {
  const lat = LAT_MAX - r * STEP - STEP / 2;
  let start = -1;
  for (let c = 0; c <= cols; c += 1) {
    const lon = -180 + c * STEP + STEP / 2;
    const isLand = c < cols && geoContains(land, [lon, lat]);
    if (isLand) cells += 1;
    if (isLand && start === -1) start = c;
    if (!isLand && start !== -1) {
      runs.push(r, start, c - 1);
      start = -1;
    }
  }
}
writeFileSync(new URL("../src/data/map-grid.json", import.meta.url), JSON.stringify({ step: STEP, latMax: LAT_MAX, rows, cols, runs }));
console.log(`Wrote ${cells} land cells in ${runs.length / 3} runs`);
