"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { SearchPalette } from "@/components/SearchPalette";
import { useFlags } from "@/lib/client/circles";
import { useFocusTrap } from "@/lib/client/focus-trap";
import { NAV_GROUPS, type NavGroup, type NavLink } from "@/lib/site";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
  );
}

function Menu({ group, links, active, onNavigate, align = "center" }: { group: NavGroup; links: NavLink[]; active: boolean; onNavigate: () => void; align?: "center" | "end" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  // Hover opens the menu; a click right after that keeps it open instead of toggling it shut.
  const hovered = useRef(false);
  // A short grace period so a diagonal move from the button to an item does not close the menu.
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); leaveTimer.current = null; };
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") { setOpen(false); button.current?.focus(); }
      } else if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  useEffect(() => cancelLeave, []);

  const items = () => [...(ref.current?.querySelectorAll<HTMLAnchorElement>("[data-menu-item]") ?? [])];
  const focusItem = (index: number) => {
    const list = items();
    if (list.length) list[(index + list.length) % list.length].focus();
  };
  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      const first = e.key === "ArrowDown";
      requestAnimationFrame(() => focusItem(first ? 0 : -1));
    }
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") { e.preventDefault(); focusItem(at + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focusItem(at - 1); }
    else if (e.key === "Home") { e.preventDefault(); focusItem(0); }
    else if (e.key === "End") { e.preventDefault(); focusItem(-1); }
  };
  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={cancelLeave}
      onMouseLeave={() => { hovered.current = false; cancelLeave(); leaveTimer.current = setTimeout(() => setOpen(false), 140); }}
      // Tabbing out of the menu closes it.
      onBlur={(e) => { if (open && !ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => { if (hovered.current) { hovered.current = false; setOpen(true); } else setOpen((v) => !v); }}
        onMouseEnter={() => { hovered.current = true; setOpen(true); }}
        onKeyDown={onButtonKey}
        className={`nav-item ${active ? "nav-item-active" : ""}`}
      >
        {group.label}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
      {open && (
        <div id={menuId} onKeyDown={onMenuKey} className={`menu-in absolute top-full z-50 w-[min(22rem,calc(100vw-2rem))] pt-3 ${align === "end" ? "right-0 origin-top-right" : "left-1/2 -translate-x-1/2 origin-top"}`}>
          <ul className="rounded-3xl border border-charcoal/10 bg-ivory p-2 shadow-[0_30px_60px_-28px_rgba(23,8,51,0.45)]">
            {links.map((l) => (
              <li key={l.href}>
                <Link data-menu-item href={l.href} onClick={() => { setOpen(false); onNavigate(); }} className="block rounded-2xl px-4 py-3 transition-colors duration-150 hover:bg-cream focus-visible:bg-cream">
                  <span className="block font-semibold text-plum-deep">{l.label}</span>
                  <span className="note block">{l.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function HeaderInner({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");
  // Flag-gated entries (Gift Circle) appear only when the Flagsmith flag is on for this visitor.
  const flags = useFlags();
  const allowed = (l: NavLink) => !l.flag || Boolean(flags?.flags[l.flag]);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  useFocusTrap(mobileRef, open);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const groupActive = (g: NavGroup) => isActive(g.href) || Boolean(g.links?.some((l) => isActive(l.href)));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setSearching(true);
      }
    };
    // Other components (the homepage search) open search with a query already typed.
    const onOpen = (event: Event) => {
      setInitialQuery((event as CustomEvent<{ query?: string }>).detail?.query ?? "");
      setSearching(true);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("festiva:search", onOpen);
    return () => { document.removeEventListener("keydown", onKey); window.removeEventListener("festiva:search", onOpen); };
  }, []);

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
    <header className="no-print sticky top-0 z-40 border-b border-charcoal/8 bg-ivory/95 text-charcoal">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="FESTIVA home" onClick={() => setOpen(false)} className="shrink-0">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden nav:block">
          <ul className="flex items-center gap-1">
            {NAV_GROUPS.map((g) => {
              const links = g.links?.filter(allowed);
              return links ? (
                <Menu key={g.label} group={g} links={links} active={groupActive(g)} onNavigate={() => setOpen(false)} align={g === NAV_GROUPS[NAV_GROUPS.length - 1] ? "end" : "center"} />
              ) : (
                <li key={g.label}>
                  <Link href={g.href} aria-current={isActive(g.href) ? "page" : undefined} className={`nav-item ${isActive(g.href) ? "nav-item-active" : ""}`}>
                    {g.label}
                  </Link>
                </li>
              );
            })}
            {/* Kept for the flag-driven Gift Circle entry: visible in the main bar too when enabled. */}
            {flags?.flags.gift_circle_enabled && (
              <li>
                <Link href="/circles" aria-current={isActive("/circles") ? "page" : undefined} className={`nav-item ${isActive("/circles") ? "nav-item-active" : ""}`}>Gift Circle</Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSearching(true)} className="search-trigger" aria-label="Search FESTIVA" data-testid="open-search">
            <SearchIcon />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden rounded-md border border-charcoal/15 px-1.5 text-[0.7rem] text-ink lg:inline">/</kbd>
          </button>
          <Link href="/account" aria-label="Account and settings" aria-current={isActive("/account") ? "page" : undefined} className="search-trigger !px-2.5" data-testid="open-account">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </Link>
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
      <div ref={mobileRef} id="mobile-nav" hidden={!open} className="drawer-in fixed inset-x-0 bottom-0 top-16 overflow-y-auto overscroll-contain bg-ivory nav:hidden">
        <nav aria-label="All sections" className="shell pb-16 pt-4">
          <button type="button" onClick={() => { setOpen(false); setSearching(true); }} className="field mb-6 flex items-center gap-3 text-left text-ink">
            <SearchIcon /> Search festivals, countries, states…
          </button>
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className="rule border-b py-3">
              <Link href={g.href} onClick={() => setOpen(false)} aria-current={isActive(g.href) ? "page" : undefined} className="font-[family-name:var(--font-display)] text-3xl font-[750] tracking-[-0.035em]">
                {g.label}
              </Link>
              {g.links && (
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {g.links.filter(allowed).map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} onClick={() => setOpen(false)} className="text-ink hover:text-plum-deep">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <Link href="/account" onClick={() => setOpen(false)} className="btn btn-line mt-8 w-full">
            Account and settings
          </Link>
          <Link href="/matchmaker" onClick={() => setOpen(false)} className="btn btn-saffron mt-3 w-full">
            Plan a celebration
          </Link>
        </nav>
      </div>
      {searching && <SearchPalette key={initialQuery} initialQuery={initialQuery} onClose={() => { setSearching(false); setInitialQuery(""); }} />}
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
