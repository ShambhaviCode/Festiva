import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

/** Every link here goes to a real page or a real section on one. */
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  { title: "Discover", links: [
    { label: "All festivals", href: "/discover" },
    { label: "Festival calendar", href: "/discover/calendar" },
    { label: "Ask FESTIVA", href: "/intelligence" },
  ] },
  { title: "World", links: [
    { label: "Explore the world", href: "/world" },
    { label: "Countries", href: "/journeys#countries-heading" },
    { label: "India's states and UTs", href: "/world?country=IN" },
    { label: "Festival map", href: "/world#world-explorer" },
  ] },
  { title: "Journeys", links: [
    { label: "Festival destinations", href: "/journeys#destinations" },
    { label: "Journeys by country", href: "/journeys#countries-heading" },
    { label: "Explore journeys", href: "/journeys" },
  ] },
  { title: "Culture", links: [
    { label: "Taste", href: "/taste" },
    { label: "Wear", href: "/wear" },
    { label: "Sound", href: "/sound" },
    { label: "Wishes", href: "/wishes" },
    { label: "Play", href: "/play" },
  ] },
  { title: "Shop", links: [
    { label: "Gift ideas", href: "/shop#gift-ideas" },
    { label: "Explore brands", href: "/shop#brand-directory" },
    { label: "Everyday", href: "/shop?tier=everyday#brand-directory" },
    { label: "Premium", href: "/shop?tier=premium#brand-directory" },
    { label: "Elite luxury", href: "/shop?tier=elite#brand-directory" },
  ] },
  { title: "Plan", links: [
    { label: "Celebration planner", href: "/matchmaker" },
    { label: "Gift Circle", href: "/circles" },
    { label: "My plans", href: "/plans" },
    { label: "Saved", href: "/saved" },
  ] },
  { title: "Account", links: [
    { label: "Account and settings", href: "/account" },
    { label: "Saved items", href: "/saved" },
    { label: "Preferences", href: "/account#acct-region" },
  ] },
];

export function Footer() {
  return (
    <footer className="on-dark no-print relative overflow-hidden bg-plum-deep text-ivory">
      <div aria-hidden="true" className="h-1.5 w-full bg-[linear-gradient(90deg,var(--color-saffron),var(--color-pink),var(--color-turquoise),var(--color-jade),var(--color-marigold))]" />
      {/* A soft glow and rosette watermark, kept behind the text and out of the accessibility tree. */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-pink/20 blur-3xl" />
      <div className="shell relative py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-end">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm font-[family-name:var(--font-display)] text-3xl font-[750] leading-tight tracking-[-0.03em]">
              Every culture has a celebration. <span className="text-marigold">Find yours.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/matchmaker" className="btn btn-saffron">Plan a celebration</Link>
            <Link href="/world" className="btn btn-line">Explore the world</Link>
          </div>
        </div>
        <nav aria-label="Footer" className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ivory/15 pt-12 sm:grid-cols-3 lg:grid-cols-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="font-[family-name:var(--font-sans)] text-sm font-bold uppercase tracking-[0.14em] text-marigold">{col.title}</h2>
              <ul className="mt-4 grid gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link className="footer-link" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/15 pt-6 text-sm text-ivory/75">
          <p>
            Founded by {site.founder.name}.{" "}
            {site.founder.links.map((link, i) => (
              <span key={link.url}>
                {i > 0 && " · "}
                <a className="footer-link" href={link.url} rel="me noopener" target="_blank">
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
