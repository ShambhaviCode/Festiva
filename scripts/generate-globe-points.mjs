// Generates src/data/globe-points.json: evenly spaced points that fall on land,
// used to draw the dotted globe on the homepage.
// Land outlines: Natural Earth (public domain) via the `world-atlas` package.
// Run with: npm run generate:globe
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const topology = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-110m.json", import.meta.url), "utf8"));
const land = feature(topology, topology.objects.land);

const TOTAL = 15000;
const GOLDEN_ANGLE = 137.50776405003785;
const out = [];
for (let i = 0; i < TOTAL; i += 1) {
  const y = 1 - (2 * (i + 0.5)) / TOTAL;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((i * GOLDEN_ANGLE) % 360) - 180;
  if (lat < -58) continue; // omit Antarctica to keep the file small
  if (geoContains(land, [lon, lat])) out.push(Math.round(lat * 10), Math.round(lon * 10));
}
writeFileSync(new URL("../src/data/globe-points.json", import.meta.url), JSON.stringify(out));
console.log(`Wrote ${out.length / 2} land points`);
