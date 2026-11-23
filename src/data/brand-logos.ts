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
  cartier: { src: "/logos/cartier.svg", license: "public domain", sourceLabel: "Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Cartier_logo.svg" },
  swarovski: { src: "/logos/swarovski.svg", license: "public domain", sourceLabel: "Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Swarovski_new_logo.svg" },
  tanishq: { src: "/logos/tanishq.svg", license: "public domain", sourceLabel: "Wikimedia Commons", source: "https://commons.wikimedia.org/wiki/File:Tanishq_Logo.svg" },
  // From each brand's own website header (the logo the brand itself publishes), 24 November 2026.
  biba: { src: "/logos/biba.svg", license: "trademark of Biba Apparels, from the logo on its own website", sourceLabel: "biba.in", source: "https://www.biba.in/" },
  manyavar: { src: "/logos/manyavar.png", license: "trademark of Vedant Fashions, the Manyavar and Mohey logo on its own website", sourceLabel: "manyavar.com", source: "https://www.manyavar.com/" },
  "anita-dongre": { src: "/logos/anita-dongre.svg", license: "trademark of House of Anita Dongre, from the logo on its own website", sourceLabel: "anitadongre.com", source: "https://www.anitadongre.com/" },
  sabyasachi: { src: "/logos/sabyasachi.svg", license: "trademark of Sabyasachi, from the logo on its own website", sourceLabel: "sabyasachi.com", source: "https://www.sabyasachi.com/" },
  giva: { src: "/logos/giva.png", license: "trademark of GIVA, from the logo on its own website", sourceLabel: "giva.co", source: "https://www.giva.co/" },
  "good-earth": { src: "/logos/good-earth.svg", license: "trademark of Good Earth, from the logo on its own website", sourceLabel: "goodearth.in", source: "https://www.goodearth.in/" },
  nicobar: { src: "/logos/nicobar.svg", license: "trademark of Nicobar, from the logo on its own website", sourceLabel: "nicobar.com", source: "https://www.nicobar.com/" },
  godiva: { src: "/logos/godiva.svg", license: "trademark of Godiva Chocolatier, published on Wikipedia as a non-free logo", sourceLabel: "Wikipedia", source: "https://en.wikipedia.org/wiki/File:Godiva_Chocolatier_Logo.svg" },
};
