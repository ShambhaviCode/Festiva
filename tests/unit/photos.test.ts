import { existsSync } from "node:fs";
import path from "node:path";
import { FESTIVAL_PHOTOS } from "@/data/photos";
import { festivalBySlug } from "@/data/festivals";

describe("festival photographs", () => {
  const entries = Object.entries(FESTIVAL_PHOTOS);

  it("has photos", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s belongs to a real festival, exists on disk and is freely licensed and credited", (slug, photo) => {
    expect(festivalBySlug.has(slug)).toBe(true);
    expect(existsSync(path.join(process.cwd(), "public", photo.src))).toBe(true);
    expect(photo.license).toMatch(/^(CC BY(-SA)?( [0-9.]+)?|CC0|Public domain)/i);
    expect(photo.artist.length).toBeGreaterThan(0);
    expect(photo.source).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
  });
});
