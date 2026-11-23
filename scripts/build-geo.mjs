#!/usr/bin/env node
/**
 * Builds FESTIVA's map data from Natural Earth (public domain, https://www.naturalearthdata.com).
 *
 *   world.json          every country, from the India point-of-view edition of
 *                       ne_10m_admin_0_countries (India's official boundaries)
 *   admin1-<CC>.json    first-level subdivisions for selected countries, from
 *                       ne_10m_admin_1_states_provinces, loaded only when a country is opened
 *
 * Shapes are simplified with mapshaper and pre-projected (Equal Earth) into one shared
 * 1000 x 520 coordinate space, so the browser draws SVG paths without any map library.
 *
 * Usage: node scripts/build-geo.mjs <dir with pov/ne_10m_admin_0_countries_ind.shp (unzipped) and ne_10m_admin_1.geojson>
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { geoEqualEarth, geoPath } from "d3-geo";

const SRC = resolve(process.argv[2] ?? "");
const OUT = resolve("public/geo");
const SUBDIVIDED = ["IN", "US", "JP", "BR", "DE", "AU"];
const W = 1000, H = 520;
mkdirSync(OUT, { recursive: true });
const tmp = join(SRC, "work"); mkdirSync(tmp, { recursive: true });
const mapshaper = (args) => execFileSync(process.execPath, [resolve("node_modules/mapshaper/bin/mapshaper"), ...args], { stdio: "inherit" });

// 1. Countries (India point of view), simplified.
const worldRaw = join(tmp, "world.geojson");
if (!existsSync(worldRaw)) {
  mapshaper(["-i", join(SRC, "pov", "ne_10m_admin_0_countries_ind.shp"), "-simplify", "visvalingam", "1.2%", "keep-shapes",
    "-filter-fields", "ISO_A2_EH,ISO_A2,NAME,NAME_LONG,CONTINENT,ADM0_A3", "-o", worldRaw, "format=geojson", "precision=0.001"]);
}
// 2. Subdivisions for selected countries.
const adminRaw = join(tmp, "admin1.geojson");
if (!existsSync(adminRaw)) {
  mapshaper(["-i", join(SRC, "ne_10m_admin_1.geojson"), "-filter", `${JSON.stringify(SUBDIVIDED)}.indexOf(iso_a2) > -1`,
    "-simplify", "visvalingam", "4%", "keep-shapes", "-filter-fields", "iso_a2,iso_3166_2,name,type_en,adm1_code",
    "-o", adminRaw, "format=geojson", "precision=0.001"]);
}

/**
 * d3-geo reads spherical polygons with the opposite ring order to GeoJSON (RFC 7946): exterior rings
 * clockwise, holes counter-clockwise. Without this, every country is drawn as "the globe minus that country".
 */
const signedArea = (ring) => { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]); return a; };
const rewindPolygon = (rings) => rings.map((ring, i) => {
  const clockwise = signedArea(ring) < 0; // this shoelace form is negative for clockwise rings (lon/lat, y up)
  return (i === 0) === clockwise ? ring : [...ring].reverse();
});
const rewind = (fc) => {
  for (const f of fc.features) {
    const g = f.geometry; if (!g) continue;
    if (g.type === "Polygon") g.coordinates = rewindPolygon(g.coordinates);
    else if (g.type === "MultiPolygon") g.coordinates = g.coordinates.map(rewindPolygon);
  }
  return fc;
};

const world = rewind(JSON.parse(readFileSync(worldRaw, "utf8")));
world.features = world.features.filter((f) => f.properties.CONTINENT !== "Antarctica");
const projection = geoEqualEarth().fitExtent([[8, 8], [W - 8, H - 8]], world);
const path = geoPath(projection);
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => (Math.round(Number(n) * 10) / 10).toString());
const shape = (f) => {
  const d = path(f); if (!d) return null;
  const [[x0, y0], [x1, y1]] = path.bounds(f); const [cx, cy] = path.centroid(f);
  return { d: round(d), c: [+cx.toFixed(1), +cy.toFixed(1)], b: [+x0.toFixed(1), +y0.toFixed(1), +x1.toFixed(1), +y1.toFixed(1)] };
};

const countries = [];
for (const f of world.features) {
  const p = f.properties;
  const code = (p.ISO_A2_EH && p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : p.ISO_A2) || "";
  if (!/^[A-Z]{2}$/.test(code)) continue;
  const s = shape(f); if (!s) continue;
  const prev = countries.find((c) => c.id === code);
  if (prev) {
    // Some countries come as more than one feature (e.g. France); merge them into one shape.
    prev.d += s.d;
    prev.b = [Math.min(prev.b[0], s.b[0]), Math.min(prev.b[1], s.b[1]), Math.max(prev.b[2], s.b[2]), Math.max(prev.b[3], s.b[3])];
    continue;
  }
  countries.push({ id: code, name: p.NAME, continent: p.CONTINENT, ...s });
}
const [sc, [tx, ty]] = [projection.scale(), projection.translate()];
writeFileSync(join(OUT, "world.json"), JSON.stringify({
  source: "Natural Earth 1:10m Admin 0 Countries, India point of view (public domain). Simplified.",
  width: W, height: H, projection: { type: "equalEarth", scale: sc, translate: [tx, ty] }, countries,
}));
console.log(`world.json: ${countries.length} countries`);

const admin = rewind(JSON.parse(readFileSync(adminRaw, "utf8")));
for (const cc of SUBDIVIDED) {
  const items = [];
  for (const f of admin.features.filter((f) => f.properties.iso_a2 === cc)) {
    const p = f.properties; const s = shape(f); if (!s) continue;
    items.push({ id: p.iso_3166_2, name: p.name, type: p.type_en, ...s });
  }
  writeFileSync(join(OUT, `admin1-${cc}.json`), JSON.stringify({ source: "Natural Earth 1:10m Admin 1 States and Provinces (public domain). Simplified.", country: cc, items }));
  console.log(`admin1-${cc}.json: ${items.length} subdivisions`);
}
// Projection parameters for placing festival coordinates on the same map (used server-side).
writeFileSync(resolve("src/data/geo-projection.json"), JSON.stringify({ width: W, height: H, scale: sc, translate: [tx, ty] }, null, 1) + "\n");
