import { NextResponse, type NextRequest } from "next/server";
import { GAMES } from "@/components/play/games";
import { attire } from "@/data/attire";
import { countries } from "@/data/countries";
import { destinations } from "@/data/destinations";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/foods";
import { brands } from "@/data/shop";

/**
 * Real 404s for catalogue pages.
 *
 * With Cache Components, a dynamic route visited with an unknown slug streams
 * a prerendered shell before the page can call notFound(), which would answer
 * 200. Search engines treat that as a soft 404. This proxy checks the slug
 * against the curated dataset first and sends unknown ones to the not-found
 * page with a proper 404 status.
 */
const KNOWN: Record<string, Set<string>> = {
  discover: new Set([...festivals.map((f) => f.slug), "calendar"]),
  journeys: new Set(destinations.map((d) => d.slug)),
  country: new Set(countries.map((c) => c.code.toLowerCase())),
  taste: new Set(foods.map((f) => f.slug)),
  wear: new Set(attire.map((a) => a.slug)),
  shop: new Set(brands.map((b) => b.slug)),
  play: new Set(GAMES.map((g) => g.slug)),
};

export function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const [section, slug, extra] = parts;
  const known = section === "journeys" && slug === "country" ? KNOWN.country.has(extra ?? "") && parts.length === 3 : parts.length === 2 && KNOWN[section]?.has(slug);
  if (known) return NextResponse.next();
  return NextResponse.rewrite(new URL("/__not-in-the-guide", request.url), { status: 404 });
}

export const config = {
  matcher: ["/discover/:slug+", "/journeys/:slug+", "/taste/:slug+", "/wear/:slug+", "/shop/:slug+", "/play/:slug+"],
};
