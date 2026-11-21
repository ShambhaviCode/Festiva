import { existsSync } from "node:fs";
import path from "node:path";
import { ATTIRE_PHOTOS, DISH_PHOTOS, FESTIVAL_PHOTOS, PLACE_PHOTOS, photoFor, type Photo } from "@/data/photos";
import { festivalBySlug } from "@/data/festivals";
import { foodBySlug } from "@/data/foods";
import { attireBySlug } from "@/data/attire";
import { destinationBySlug } from "@/data/destinations";

const groups: [string, Record<string, Photo>, Map<string, unknown>][] = [
  ["festival", FESTIVAL_PHOTOS, festivalBySlug],
  ["dish", DISH_PHOTOS, foodBySlug],
  ["attire", ATTIRE_PHOTOS, attireBySlug],
  ["place", PLACE_PHOTOS, destinationBySlug],
];

describe("photographs", () => {
  it("has photos for every kind of content", () => {
    for (const [, photos] of groups) expect(Object.keys(photos).length).toBeGreaterThan(0);
  });

  const entries = groups.flatMap(([kind, photos, known]) => Object.entries(photos).map(([slug, photo]) => [kind, slug, photo, known] as const));

  it.each(entries)("%s %s belongs to real content, exists on disk and is freely licensed and credited", (_kind, slug, photo, known) => {
    expect(known.has(slug)).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", photo.src))).toBe(true);
    expect(photo.license).toMatch(/^(CC BY(-SA)?( [0-9.]+)?|CC0|Public domain)/i);
    expect(photo.artist.length).toBeGreaterThan(0);
    expect(photo.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
  });

  it("shows photographs of vegetarian dishes only", () => {
    const meat = Object.keys(DISH_PHOTOS).filter((slug) => !foodBySlug.get(slug)?.vegetarian);
    expect(meat).toEqual([]);
  });

  it("looks photos up by artwork kind", () => {
    const [festival] = Object.keys(FESTIVAL_PHOTOS);
    expect(photoFor("rosette", festival)).toBe(FESTIVAL_PHOTOS[festival]);
    expect(photoFor("brand", festival)).toBeUndefined();
  });
});
