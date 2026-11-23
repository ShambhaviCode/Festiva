/**
 * Brand logos, shown only to identify each brand on its Shop card and detail page. Each logo is the
 * trademark of its owner; FESTIVA has no relationship with any brand. Every file is recorded with where it
 * came from and on what terms it is published there (fetched 24 November 2026). Brands without a logo keep
 * FESTIVA's typographic name plate, which deliberately does not imitate any logo.
 * To add one, place the file in /public/logos and list it here with its source.
 */
export interface BrandLogo {
  src: string;
  /** How the source publishes the file, e.g. "Public domain" or "Non-free (fair use on Wikipedia)". */
  license: string;
  sourceLabel: string;
  source: string;
}

export const BRAND_LOGOS: Record<string, BrandLogo> = {
  fabindia: { src: "/logos/fabindia.svg", license: "public domain", sourceLabel: "Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Fabindia_logo.svg" },
  haldirams: { src: "/logos/haldirams.svg", license: "trademark of Haldiram's, published on Wikipedia as a non-free logo", sourceLabel: "Wikipedia", source: "https://en.wikipedia.org/wiki/File:Haldiram%27s_2024_Logo.svg" },
  lindt: { src: "/logos/lindt.svg", license: "trademark of Lindt & Sprüngli, published on Wikipedia as a non-free logo", sourceLabel: "Wikipedia", source: "https://en.wikipedia.org/wiki/File:Lindt_%26_Spr%C3%BCngli.svg" },
  godiva: { src: "/logos/godiva.svg", license: "trademark of Godiva Chocolatier, published on Wikipedia as a non-free logo", sourceLabel: "Wikipedia", source: "https://en.wikipedia.org/wiki/File:Godiva_Chocolatier_Logo.svg" },
};
