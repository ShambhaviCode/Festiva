import Link from "next/link";
import { NAV, site } from "@/lib/site";
import { Preferences } from "./Preferences";

export function Footer() {
  return (
    <footer className="on-dark no-print bg-plum-deep text-ivory">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl tracking-[0.2em]">FESTIVA</p>
          <p className="mt-4 max-w-sm font-[family-name:var(--font-display)] text-xl italic text-gold-soft">{site.supporting}</p>
          <p className="note mt-6 max-w-sm">
            Founded by {site.founder.name}.{" "}
            {site.founder.links.map((link, i) => (
              <span key={link.url}>
                {i > 0 && ", "}
                <a className="link" href={link.url} rel="me noopener" target="_blank">
                  {link.label}
                </a>
              </span>
            ))}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
            {[...NAV, { href: "/matchmaker", label: "Matchmaker" }, { href: "/plans", label: "My plans" }, { href: "/saved", label: "Saved" }].map((item) => (
              <li key={item.href}>
                <Link className="link" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Preferences />
      </div>
    </footer>
  );
}
