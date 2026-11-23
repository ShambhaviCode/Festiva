import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NAV_GROUPS, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="on-dark no-print relative overflow-hidden bg-plum-deep text-ivory">
      <div aria-hidden="true" className="h-1.5 w-full bg-[linear-gradient(90deg,var(--color-saffron),var(--color-pink),var(--color-turquoise),var(--color-jade),var(--color-marigold))]" />
      <div className="shell grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-sm font-[family-name:var(--font-display)] text-2xl font-[700] leading-tight tracking-[-0.03em]">
            Every culture has a celebration. <span className="text-marigold">Find yours.</span>
          </p>
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
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <Link href={g.href} className="font-semibold text-marigold hover:underline">
                {g.label}
              </Link>
              {g.links && (
                <ul className="mt-2 grid gap-1.5">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link className="text-ivory/80 hover:text-ivory" href={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
        <div>
          <p className="font-semibold text-marigold">You</p>
          <ul className="mt-2 grid gap-1.5">
            <li><Link className="text-ivory/80 hover:text-ivory" href="/account">Account and settings</Link></li>
            <li><Link className="text-ivory/80 hover:text-ivory" href="/saved">Saved</Link></li>
            <li><Link className="text-ivory/80 hover:text-ivory" href="/plans">My plans</Link></li>
          </ul>
          <p className="note mt-4">Currency, date and number format live in Account and settings.</p>
        </div>
      </div>
    </footer>
  );
}
