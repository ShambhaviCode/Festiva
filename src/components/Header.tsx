"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFlags } from "@/lib/client/circles";
import { NAV } from "@/lib/site";

const GIFT_CIRCLE = { href: "/circles", label: "Gift Circle", blurb: "Organise a group gift exchange together" } as const;

const EXTRA = [
  { href: "/matchmaker", label: "Matchmaker" },
  { href: "/plans", label: "My plans" },
  { href: "/saved", label: "Saved" },
];

function HeaderInner({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  // Gift Circle appears only when its Flagsmith flag is on for this visitor.
  const flags = useFlags();
  const items = flags?.flags.gift_circle_enabled ? [...NAV, GIFT_CIRCLE] : NAV;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="on-dark no-print sticky top-0 z-40 bg-plum-deep text-ivory">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="font-[family-name:var(--font-display)] text-[1.45rem] font-medium tracking-[0.2em]" aria-label="FESTIVA home" onClick={() => setOpen(false)}>
          FESTIVA
        </Link>
        <nav aria-label="Main" className="hidden nav:block">
          <ul className="flex items-center gap-6 text-[0.95rem]">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="border-b border-transparent py-1 text-ivory/85 transition-colors hover:text-ivory aria-[current=page]:border-saffron aria-[current=page]:text-ivory"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/matchmaker" className="btn btn-saffron btn-sm hidden sm:inline-flex">
            Plan a celebration
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="btn btn-line btn-sm nav:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div id="mobile-nav" hidden={!open} className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-plum-deep nav:hidden">
        <nav aria-label="All sections" className="shell pb-16 pt-6">
          <ul>
            {items.map((item) => (
              <li key={item.href} className="rule border-b">
                <Link href={item.href} onClick={() => setOpen(false)} aria-current={isActive(item.href) ? "page" : undefined} className="flex items-baseline justify-between gap-4 py-4">
                  <span className="font-[family-name:var(--font-display)] text-3xl">{item.label}</span>
                  <span className="note max-w-[55%] text-right">{item.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
            {EXTRA.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/matchmaker" onClick={() => setOpen(false)} className="btn btn-saffron mt-8 w-full">
            Plan a celebration
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeaderWithPath() {
  return <HeaderInner pathname={usePathname()} />;
}

/** Pass `pathname` to render without reading the router (used as the Suspense fallback). */
export function Header({ pathname }: { pathname?: string }) {
  return pathname === undefined ? <HeaderWithPath /> : <HeaderInner pathname={pathname} />;
}
