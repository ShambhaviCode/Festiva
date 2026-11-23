"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Data shapes (map files are built by scripts/build-geo.mjs)          */
/* ------------------------------------------------------------------ */
interface Shape { id: string; name: string; d: string; c: [number, number]; b: [number, number, number, number] }
interface CountryShape extends Shape { continent: string }
interface World { width: number; height: number; countries: CountryShape[]; source: string }
interface Admin1 { country: string; items: (Shape & { type?: string })[]; source: string }

export interface MapFestival { slug: string; name: string; category: string; countries: string[]; x: number | null; y: number | null }
export interface MapCountry { code: string; name: string; region: string; blurb: string }
export interface RegionLink { slug: string; name: string; basis: "main" | "variation"; place?: string; text?: string }
export interface MapRegion { id: string; name: string; kind: string; links: RegionLink[] }

const SUBDIVIDED = new Set(["IN", "US", "JP", "BR", "DE", "AU"]);
const LEVEL_NAME: Record<string, string> = { IN: "State / union territory", US: "State", JP: "Prefecture", BR: "State", DE: "State (Land)", AU: "State / territory" };
const FULL: VB = [0, 0, 1000, 520];
type VB = [number, number, number, number];

let worldPromise: Promise<World> | null = null;
const adminCache = new Map<string, Promise<Admin1>>();
const getJSON = <T,>(url: string) => fetch(url).then((r) => { if (!r.ok) throw new Error(`${url} ${r.status}`); return r.json() as Promise<T>; });
const loadWorld = () => (worldPromise ??= getJSON<World>("/geo/world.json").catch((e) => { worldPromise = null; throw e; }));
const loadAdmin = (cc: string) => {
  if (!adminCache.has(cc)) adminCache.set(cc, getJSON<Admin1>(`/geo/admin1-${cc}.json`).catch((e) => { adminCache.delete(cc); throw e; }));
  return adminCache.get(cc)!;
};

function fit(b: [number, number, number, number], pad = 0.18): VB {
  let [x0, y0, x1, y1] = b;
  const w = Math.max(x1 - x0, 14), h = Math.max(y1 - y0, 8);
  x0 -= w * pad; x1 += w * pad; y0 -= h * pad; y1 += h * pad;
  let vw = x1 - x0, vh = y1 - y0;
  const ratio = 1000 / 520;
  if (vw / vh > ratio) { const nh = vw / ratio; y0 -= (nh - vh) / 2; vh = nh; } else { const nw = vh * ratio; x0 -= (nw - vw) / 2; vw = nw; }
  return [x0, y0, vw, vh];
}
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/** Fill for a country by how many festivals the guide holds for it. */
function heat(n: number): string {
  if (n === 0) return "#efe5d6";
  if (n === 1) return "#ffd98a";
  if (n <= 3) return "#ffb547";
  if (n <= 6) return "#ff8a3d";
  return "#e5157a";
}

export function WorldMap({
  festivals, countries, india, initialCountry, initialRegion, compact = false,
}: {
  festivals: MapFestival[];
  countries: MapCountry[];
  india: MapRegion[];
  initialCountry?: string;
  initialRegion?: string;
  compact?: boolean;
}) {
  const [world, setWorld] = useState<World | null>(null);
  const [failed, setFailed] = useState(false);
  const [country, setCountry] = useState<string | null>(initialCountry ?? null);
  const [region, setRegion] = useState<string | null>(initialRegion ?? null);
  const [admin, setAdmin] = useState<Admin1 | null>(null);
  const [vb, setVb] = useState<VB>(FULL);
  const [hover, setHover] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [continent, setContinent] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const anim = useRef<number | null>(null);
  const vbRef = useRef<VB>(FULL);
  const router = useRouter();
  useEffect(() => { vbRef.current = vb; }, [vb]);

  const byCountry = useMemo(() => {
    const m = new Map<string, MapFestival[]>();
    for (const f of festivals) for (const c of f.countries) m.set(c, [...(m.get(c) ?? []), f]);
    return m;
  }, [festivals]);
  const info = useMemo(() => new Map(countries.map((c) => [c.code, c])), [countries]);
  const regionInfo = useMemo(() => new Map(india.map((r) => [r.id, r])), [india]);

  const animateTo = useCallback((target: VB) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = vbRef.current;
    if (reduce) { vbRef.current = target; setVb(target); return; }
    const t0 = performance.now(), dur = 750;
    const step = (t: number) => {
      const k = ease(Math.min(1, (t - t0) / dur));
      const next = from.map((v, i) => v + (target[i] - v) * k) as VB;
      vbRef.current = next;
      setVb(next);
      if (k < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  /** Frame a country: France and others include far-away territories, so very wide boxes frame the centroid instead. */
  const countryView = (shape: CountryShape): VB => {
    const [x0, , x1] = shape.b;
    return fit(x1 - x0 > 300 ? [shape.c[0] - 40, shape.c[1] - 25, shape.c[0] + 40, shape.c[1] + 25] : shape.b);
  };

  /** Open a country (and optionally one of its regions). Subdivisions load only for the opened country. */
  const openCountry = useCallback((w: World, cc: string | null, regionId: string | null = null) => {
    setCountry(cc);
    setRegion(regionId);
    setAdmin(null);
    if (!cc) { animateTo(FULL); return; }
    const shape = w.countries.find((c) => c.id === cc);
    if (shape) animateTo(countryView(shape));
    if (SUBDIVIDED.has(cc)) {
      loadAdmin(cc).then((a) => {
        setAdmin(a);
        const r = regionId ? a.items.find((i) => i.id === regionId) : null;
        if (r) animateTo(fit(r.b, 0.6));
      }, () => setAdmin(null));
    }
  }, [animateTo]);

  // Load the map; deep links (/world?country=IN&region=IN-KL) are read in the browser, so the page stays static.
  useEffect(() => {
    loadWorld().then((w) => {
      setWorld(w);
      if (compact) return;
      const q = new URLSearchParams(window.location.search);
      const cc = (initialCountry ?? q.get("country") ?? "").toUpperCase();
      const r = initialRegion ?? q.get("region");
      if (/^[A-Z]{2}$/.test(cc)) openCountry(w, cc, r && /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(r) ? r : null);
    }, () => setFailed(true));
  }, [compact, initialCountry, initialRegion, openCountry]);

  // Search can send the map somewhere new while it is already open.
  const worldRef = useRef<World | null>(null);
  useEffect(() => { worldRef.current = world; }, [world]);
  useEffect(() => {
    if (compact) return;
    const onNavigate = (e: Event) => {
      const href = (e as CustomEvent<{ href?: string }>).detail?.href;
      const w = worldRef.current;
      if (!href || !w) return;
      const url = new URL(href, window.location.origin);
      if (url.pathname !== "/world") return;
      const cc = url.searchParams.get("country")?.toUpperCase() ?? null;
      openCountry(w, cc && /^[A-Z]{2}$/.test(cc) ? cc : null, url.searchParams.get("region"));
    };
    window.addEventListener("festiva:navigate", onNavigate);
    return () => window.removeEventListener("festiva:navigate", onNavigate);
  }, [compact, openCountry]);

  const openRegion = (id: string) => {
    setRegion(id);
    const r = admin?.items.find((i) => i.id === id);
    if (r) animateTo(fit(r.b, 0.6));
  };

  // Keep the address shareable without adding history entries.
  useEffect(() => {
    // Wait for the map: until then the deep link in the address has not been read yet.
    if (compact || !world) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("country"); url.searchParams.delete("region");
    if (country) url.searchParams.set("country", country);
    if (region) url.searchParams.set("region", region);
    window.history.replaceState(null, "", url.toString());
  }, [country, region, compact, world]);

  const select = (cc: string | null) => { if (world) openCountry(world, cc); };
  const back = () => {
    if (region) { setRegion(null); const shape = world?.countries.find((c) => c.id === country); if (shape) animateTo(countryView(shape)); }
    else select(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && (country || region)) back(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---------- pan and zoom ---------- */
  const zoomBy = (factor: number, cx?: number, cy?: number) => {
    const [x, y, w, h] = vbRef.current;
    const nw = Math.min(1000, Math.max(18, w * factor)), nh = nw * (h / w);
    const px = cx ?? x + w / 2, py = cy ?? y + h / 2;
    setVb([px - ((px - x) * nw) / w, py - ((py - y) * nh) / h, nw, nh]);
  };
  const drag = useRef<{ x: number; y: number; vb: VB; moved: boolean } | null>(null);
  const toSvg = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect(); const [x, y, w, h] = vbRef.current;
    return [x + ((clientX - r.left) / r.width) * w, y + ((clientY - r.top) / r.height) * h];
  };
  const onWheel = (e: React.WheelEvent) => {
    if (compact) return;
    const [px, py] = toSvg(e.clientX, e.clientY);
    zoomBy(e.deltaY > 0 ? 1.15 : 1 / 1.15, px, py);
  };
  const onPointerDown = (e: React.PointerEvent) => { if (!compact) drag.current = { x: e.clientX, y: e.clientY, vb: vbRef.current, moved: false }; };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !svgRef.current) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const r = svgRef.current.getBoundingClientRect();
    setVb([d.vb[0] - (dx / r.width) * d.vb[2], d.vb[1] - (dy / r.height) * d.vb[3], d.vb[2], d.vb[3]]);
  };
  const endDrag = () => { setTimeout(() => (drag.current = null), 0); };
  const wasDrag = () => Boolean(drag.current?.moved);

  /* ---------- derived ---------- */
  const zoom = 1000 / vb[2];
  const continents = useMemo(() => [...new Set((world?.countries ?? []).map((c) => c.continent))].filter((c) => c && c !== "Seven seas (open ocean)").sort(), [world]);
  const sel = country ? world?.countries.find((c) => c.id === country) : null;
  const selFests = useMemo(() => (country ? byCountry.get(country) ?? [] : []), [country, byCountry]);
  const regionLinks = useMemo(() => (region ? regionInfo.get(region)?.links ?? [] : []), [region, regionInfo]);
  const markers = useMemo(() => {
    if (region) {
      const main = new Set(regionLinks.filter((l) => l.basis === "main").map((l) => l.slug));
      return festivals.filter((f) => main.has(f.slug) && f.x !== null);
    }
    if (country) return selFests.filter((f) => f.countries[0] === country && f.x !== null);
    return festivals.filter((f) => f.x !== null);
  }, [festivals, country, region, selFests, regionLinks]);
  const listed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return countries
      .filter((c) => (!q || c.name.toLowerCase().includes(q)) && (!continent || world?.countries.find((w) => w.id === c.code)?.continent === continent))
      .map((c) => ({ ...c, n: byCountry.get(c.code)?.length ?? 0 }))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  }, [countries, filter, continent, world, byCountry]);

  const chooseContinent = (c: string | null) => {
    setContinent(c); select(null);
    if (!c || !world) { animateTo(FULL); return; }
    const cs = world.countries.filter((w) => w.continent === c);
    const xs = cs.map((w) => w.c[0]).sort((a, b) => a - b), ys = cs.map((w) => w.c[1]).sort((a, b) => a - b);
    const q = (arr: number[], p: number) => arr[Math.floor((arr.length - 1) * p)];
    animateTo(fit([q(xs, 0.03), q(ys, 0.03), q(xs, 0.97), q(ys, 0.97)], 0.25));
  };

  const hovered = hover ? (admin?.items.find((i) => i.id === hover)?.name ?? info.get(hover)?.name ?? world?.countries.find((c) => c.id === hover)?.name) : null;

  return (
    <div className={compact ? "" : "grid gap-6 lg:grid-cols-[1fr_24rem]"} data-testid="world-explorer">
      <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_top,#e9f8f8,#cdeef0_55%,#b9e3e8)]">
        {!world && !failed && <div className="skeleton aspect-[1000/520] w-full" aria-label="Loading the map" />}
        {failed && <p className="p-8 text-vermilion" role="alert">The map could not load. The country list still works.</p>}
        {world && (
          <svg
            ref={svgRef}
            viewBox={vb.join(" ")}
            className={`block aspect-[1000/520] w-full touch-none select-none ${compact ? "" : "cursor-grab active:cursor-grabbing"}`}
            role="img"
            aria-label={sel ? `Map of ${sel.name}` : "World map of festivals in the guide"}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={() => { endDrag(); setHover(null); }}
            data-testid="world-map-svg"
          >
            <g>
              {world.countries.map((c) => {
                const n = byCountry.get(c.id)?.length ?? 0;
                const isSel = c.id === country;
                const dim = (continent && c.continent !== continent) || (country && !isSel);
                return (
                  <path
                    key={c.id}
                    d={c.d}
                    fill={isSel && admin ? "#fff3df" : isSel ? "#2d1052" : heat(n)}
                    fillOpacity={dim ? 0.45 : 1}
                    stroke={hover === c.id ? "#170833" : "#fffaf2"}
                    strokeWidth={(hover === c.id ? 1.4 : 0.5) / zoom}
                    className="transition-[fill-opacity] duration-300"
                    onPointerEnter={() => setHover(c.id)}
                    onClick={() => { if (wasDrag()) return; if (compact) { router.push(`/world?country=${c.id}`); return; } select(c.id === country ? country : c.id); }}
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`${c.name}: ${n} festival${n === 1 ? "" : "s"} in the guide`}</title>
                  </path>
                );
              })}
            </g>
            {admin && (
              <g className="fade-in">
                {admin.items.map((r) => {
                  const links = admin.country === "IN" ? regionInfo.get(r.id)?.links.length ?? 0 : 0;
                  const isSel = r.id === region;
                  return (
                    <path
                      key={r.id}
                      d={r.d}
                      fill={isSel ? "#2d1052" : links ? (links > 3 ? "#00866b" : "#19c39a") : "#ffe2b3"}
                      stroke={hover === r.id ? "#170833" : "#fffaf2"}
                      strokeWidth={(hover === r.id ? 1.6 : 0.7) / zoom}
                      onPointerEnter={() => setHover(r.id)}
                      onClick={() => { if (!wasDrag()) openRegion(r.id); }}
                      style={{ cursor: "pointer" }}
                    >
                      <title>{admin.country === "IN" ? `${r.name}: ${links} festival link${links === 1 ? "" : "s"}` : r.name}</title>
                    </path>
                  );
                })}
              </g>
            )}
            <g>
              {markers.map((f) => (
                <g key={f.slug} transform={`translate(${f.x} ${f.y})`}>
                  <circle r={7 / zoom} fill="#e5157a" opacity="0.25" className="locator-pulse" />
                  <circle r={3.2 / zoom} fill="#e5157a" stroke="#fff" strokeWidth={1 / zoom} />
                  <title>{`${f.name} (main place in the guide)`}</title>
                </g>
              ))}
            </g>
          </svg>
        )}
        {world && hovered && <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-plum-deep px-3 py-1 text-sm font-semibold text-ivory" aria-hidden="true">{hovered}</p>}
        {world && !compact && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button type="button" className="map-btn" onClick={() => zoomBy(1 / 1.4)} aria-label="Zoom in">+</button>
            <button type="button" className="map-btn" onClick={() => zoomBy(1.4)} aria-label="Zoom out">−</button>
            <button type="button" className="map-btn px-3 text-sm" onClick={() => { setContinent(null); select(null); }}>World</button>
          </div>
        )}
        {world && !compact && (
          <div className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-semibold text-ink sm:flex" aria-hidden="true">
            Festivals in the guide
            {[0, 1, 3, 6, 9].map((n) => <span key={n} className="inline-block h-3 w-5 rounded-sm" style={{ background: heat(n) }} />)}
          </div>
        )}
      </div>

      {!compact && (
        <aside className="min-w-0 rounded-[2rem] bg-cream p-5 sm:p-6" aria-live="polite" data-testid="map-panel">
          <nav aria-label="Map location" className="mb-4 flex flex-wrap items-center gap-1 text-sm font-semibold">
            <button type="button" className="link" onClick={() => { setContinent(null); select(null); }}>World</button>
            {(sel?.continent ?? continent) && <><span aria-hidden="true">›</span><button type="button" className="link" onClick={() => chooseContinent(sel?.continent ?? continent)}>{sel?.continent ?? continent}</button></>}
            {sel && <><span aria-hidden="true">›</span><button type="button" className="link" onClick={() => { setRegion(null); animateTo(countryView(sel)); }}>{sel.name}</button></>}
            {region && <><span aria-hidden="true">›</span><span aria-current="location">{regionInfo.get(region)?.name ?? admin?.items.find((i) => i.id === region)?.name}</span></>}
          </nav>

          {!country && (
            <>
              <h2 className="display-3">Explore the world</h2>
              <p className="note mt-1">Pick a continent or a country, or click the map. India opens down to its 28 states and 8 union territories.</p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Continents">
                {continents.map((c) => <button key={c} type="button" className="chip" aria-pressed={continent === c} onClick={() => chooseContinent(continent === c ? null : c)}>{c}</button>)}
              </div>
              <label className="field-label mt-5" htmlFor="map-country-filter">Find a country</label>
              <input id="map-country-filter" className="field" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="India, Japan, Brazil…" />
              <ul className="mt-3 max-h-[22rem] overflow-y-auto pr-1" aria-label="Countries">
                {listed.map((c) => (
                  <li key={c.code}>
                    <button type="button" onClick={() => select(c.code)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-ivory">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="pill-tag shrink-0" style={{ background: heat(c.n), color: c.n > 6 ? "#fff" : "#170833" }}>{c.n}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {country && !region && (
            <>
              <p className="eyebrow">{info.get(country)?.region ?? sel?.continent}</p>
              <h2 className="display-2 mt-1">{info.get(country)?.name ?? sel?.name}</h2>
              {info.get(country)?.blurb && <p className="mt-2 text-ink">{info.get(country)!.blurb}</p>}
              {admin && (
                <p className="note mt-3">
                  {LEVEL_NAME[country]} boundaries shown.{" "}
                  {country === "IN" ? "Green areas have festivals linked in the guide; click one." : "Festival links below this level are not in the guide yet."}
                </p>
              )}
              <h3 className="mt-5 font-semibold">{selFests.length} festival{selFests.length === 1 ? "" : "s"} in the guide</h3>
              <ul className="mt-2 grid gap-2">
                {selFests.map((f) => (
                  <li key={f.slug}>
                    <Link href={`/discover/${f.slug}`} className="card-lift flex items-center justify-between gap-3 rounded-2xl bg-ivory px-4 py-3">
                      <span className="font-semibold">{f.name}</span>
                      <span className="note shrink-0">{f.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {country === "IN" && (
                <div className="mt-5">
                  <h3 className="font-semibold">States and union territories</h3>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {india.map((r) => (
                      <li key={r.id}><button type="button" className="chip text-sm" onClick={() => openRegion(r.id)}>{r.name}{r.links.length ? ` · ${new Set(r.links.map((l) => l.slug)).size}` : ""}</button></li>
                    ))}
                  </ul>
                </div>
              )}
              <Link href={`/journeys/country/${country.toLowerCase()}`} className="btn btn-saffron btn-sm mt-5">Open the {info.get(country)?.name ?? "country"} guide</Link>
            </>
          )}

          {region && (
            <>
              <p className="eyebrow">{regionInfo.get(region)?.kind === "union-territory" ? "Union territory" : "State"} of India</p>
              <h2 className="display-2 mt-1">{regionInfo.get(region)?.name}</h2>
              {regionLinks.length === 0 ? (
                <p className="mt-3 text-ink">FESTIVA&rsquo;s guide has no festival linked to {regionInfo.get(region)?.name} yet. We only link a festival to a state when its sourced record names that state, so this will grow as the guide does.</p>
              ) : (
                <ul className="mt-4 grid gap-2">
                  {[...new Map(regionLinks.map((l) => [l.slug, l])).values()].map((l) => (
                    <li key={l.slug}>
                      <Link href={`/discover/${l.slug}`} className="card-lift block rounded-2xl bg-ivory px-4 py-3">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{l.name}</span>
                          <span className={`pill-tag ${l.basis === "main" ? "bg-saffron text-plum-deep" : "bg-jade/20 text-emerald-deep"}`}>{l.basis === "main" ? "Main place" : "Regional variation"}</span>
                        </span>
                        {l.text && <span className="note mt-1 block">{l.text}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <p className="note mt-4">Links come from each festival&rsquo;s sourced record: its main place in the guide, or a regional variation it describes.</p>
            </>
          )}
          <p className="note mt-6 border-t border-charcoal/10 pt-3 text-[0.78rem]">Boundaries: Natural Earth (public domain), India point of view. Simplified for the web.</p>
        </aside>
      )}
    </div>
  );
}
