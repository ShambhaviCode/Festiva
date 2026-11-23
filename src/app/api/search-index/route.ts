import { buildIndex } from "@/domain/search";
import { indiaDivisions, linksForDivision } from "@/data/geo-india";
import { normalise } from "@/domain/text";

/**
 * The global search palette's index: the same documents FESTIVA Intelligence searches (festivals,
 * food, attire, places, countries, brands, artists, genres) plus India's 36 states and union
 * territories. Built from static data, so it is prerendered at build time and only downloaded
 * when someone opens search. Countries open on the World map.
 */
export async function GET() {
  const docs = buildIndex().map((d) => ({
    type: d.type,
    title: d.title,
    summary: d.summary.length > 110 ? `${d.summary.slice(0, 107).trimEnd()}…` : d.summary,
    href: d.type === "country" ? `/world?country=${d.id.split(":")[1]}` : d.href,
    alt: d.alt,
    haystack: d.haystack.length > 360 ? `${d.haystack.slice(0, 360)} ` : d.haystack,
  }));
  const regions = indiaDivisions.map((r) => {
    const n = new Set(linksForDivision(r.id).map((l) => l.festival)).size;
    const kind = r.kind === "state" ? "State" : "Union territory";
    return {
      type: "region",
      title: r.name,
      summary: `${kind} of India${n ? `, ${n} festival${n === 1 ? "" : "s"} in the guide` : ""}`,
      href: `/world?country=IN&region=${r.id}`,
      alt: "",
      haystack: ` ${normalise(`${r.name} india ${kind}`)} `,
    };
  });
  return Response.json([...docs, ...regions], { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
