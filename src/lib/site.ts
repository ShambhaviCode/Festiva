export const site = {
  name: "FESTIVA",
  tagline: "Discover the world. Celebrate every culture.",
  supporting: "Every celebration has a story.",
  description:
    "FESTIVA is a global guide to festivals, traditions, food, attire, music and destinations, with a Matchmaker that turns them into a personalised celebration plan.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Date the curated dataset was last reviewed. Used for sitemap lastModified. */
  dataReviewed: "2026-11-16",
  founder: {
    name: "Shambhavi M K",
    role: "Founder of FESTIVA",
    links: [
      { label: "GitHub", url: "https://github.com/ShambhaviCode" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/shambhavi-m-k-1b6677378/" },
      { label: "X", url: "https://x.com/heyshambhavi" },
    ],
  },
} as const;

export const NAV = [
  { href: "/discover", label: "Discover", blurb: "Festivals, their stories and when they fall" },
  { href: "/journeys", label: "Journeys", blurb: "Countries and places where celebrations live" },
  { href: "/taste", label: "Taste", blurb: "Festival dishes, sweets and what goes into them" },
  { href: "/wear", label: "Wear", blurb: "Traditional dress, textiles and how to wear them" },
  { href: "/shop", label: "Shop", blurb: "Gift ideas and brands to browse, by tier" },
  { href: "/wishes", label: "Wishes", blurb: "Make a greeting card and share it" },
  { href: "/play", label: "Play", blurb: "Five cultural games" },
  { href: "/sound", label: "Sound", blurb: "Music from sixteen genres around the world" },
  { href: "/intelligence", label: "Intelligence", blurb: "Ask FESTIVA's cultural assistant" },
] as const;

/** Social preview image, repeated on pages that set their own Open Graph block (nested objects replace, they do not merge). */
export const OG_IMAGES = [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name}: ${site.tagline}` }];
