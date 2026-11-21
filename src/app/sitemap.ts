import type { MetadataRoute } from "next";
import { GAMES } from "@/components/play/games";
import { attire } from "@/data/attire";
import { countries } from "@/data/countries";
import { destinations } from "@/data/destinations";
import { festivals } from "@/data/festivals";
import { foods } from "@/data/foods";
import { brands } from "@/data/shop";
import { NAV, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${site.dataReviewed}T00:00:00Z`);
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${site.url}${path}`, lastModified, changeFrequency: "monthly", priority });
  return [
    entry("/", 1),
    entry("/matchmaker", 0.9),
    entry("/circles", 0.8),
    ...NAV.map((item) => entry(item.href, 0.8)),
    entry("/discover/calendar", 0.7),
    entry("/about", 0.4),
    entry("/privacy", 0.2),
    ...festivals.map((f) => entry(`/discover/${f.slug}`, 0.8)),
    ...destinations.map((d) => entry(`/journeys/${d.slug}`, 0.6)),
    ...countries.map((c) => entry(`/journeys/country/${c.code.toLowerCase()}`, 0.5)),
    ...foods.map((f) => entry(`/taste/${f.slug}`, 0.6)),
    ...attire.map((a) => entry(`/wear/${a.slug}`, 0.6)),
    ...brands.map((b) => entry(`/shop/${b.slug}`, 0.4)),
    ...GAMES.map((g) => entry(`/play/${g.slug}`, 0.5)),
  ];
}
