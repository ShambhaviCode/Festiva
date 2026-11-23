"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFocusTrap } from "@/lib/client/focus-trap";

/**
 * FESTIVA's one overlay system.
 *
 * - variant "dialog": a focused, centred dialog on larger screens.
 * - variant "panel": a side panel on the right, for context without leaving the page.
 * On phones (under 640px) both become a bottom sheet that respects the safe area.
 *
 * Render it only while it is open: `{open && <Overlay … onClose={() => setOpen(false)} />}`.
 * It traps focus, closes on Escape and on a backdrop press, locks page scroll, gives focus back
 * to whatever opened it, and plays a short exit animation before calling onClose.
 */
export interface OverlayProps {
  title: string;
  /** Shown under the title. */
  description?: ReactNode;
  variant?: "dialog" | "panel";
  onClose: () => void;
  children?: ReactNode;
  /** Action row pinned to the bottom of the overlay. */
  footer?: (close: () => void) => ReactNode;
  /** Visually hide the title (it is still the overlay's accessible name). */
  hideTitle?: boolean;
  /** Selector of the element to focus first; defaults to the first focusable element. */
  initialFocus?: string;
  /** "alertdialog" for confirmations that interrupt the user. */
  role?: "dialog" | "alertdialog";
  testId?: string;
}

const EXIT_MS = 170;

export function Overlay({ title, description, variant = "dialog", onClose, children, footer, hideTitle, initialFocus, role = "dialog", testId }: OverlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  const titleId = useId();
  const descId = useId();
  useFocusTrap(ref);

  const close = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setTimeout(onClose, reduce ? 0 : EXIT_MS);
  }, [leaving, onClose]);

  useEffect(() => {
    const el = ref.current;
    const target = (initialFocus && el?.querySelector<HTMLElement>(initialFocus)) || el?.querySelector<HTMLElement>("[data-autofocus]") || el?.querySelector<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select, textarea');
    (target ?? el)?.focus();
    // Lock page scroll without the layout jumping when the scrollbar disappears.
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => { document.body.style.overflow = overflow; document.body.style.paddingRight = paddingRight; };
  }, [initialFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.stopPropagation(); e.preventDefault(); close(); }
  };

  const panel = variant === "panel";
  return (
    <div
      className={`overlay-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-plum-deep/55 sm:items-center ${panel ? "sm:justify-end sm:items-stretch" : "sm:p-6"} ${leaving ? "is-leaving" : ""}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
      data-testid={testId}
    >
      <div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={`overlay-surface ${panel ? "overlay-panel" : "overlay-dialog"} relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-ivory text-charcoal shadow-[0_40px_90px_-30px_rgba(23,8,51,0.75)] outline-none ${panel ? "sm:max-h-none sm:w-[min(28rem,92vw)] sm:rounded-none sm:rounded-l-[1.75rem]" : "sm:max-w-md sm:rounded-[1.75rem]"} ${leaving ? "is-leaving" : ""}`}
      >
        <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-charcoal/15 sm:hidden" />
        <div className="flex items-start gap-4 px-6 pb-2 pt-4 sm:pt-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={hideTitle ? "sr-only" : "font-[family-name:var(--font-display)] text-2xl font-[750] leading-tight tracking-[-0.03em]"}>{title}</h2>
            {description && <div id={descId} className="mt-1.5 text-ink">{description}</div>}
          </div>
          <button type="button" onClick={close} aria-label="Close" className="icon-btn -mr-2 -mt-1 shrink-0">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
        {children && <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-4">{children}</div>}
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-charcoal/10 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer(close)}
          </div>
        )}
        {!footer && <div className="h-[env(safe-area-inset-bottom)] shrink-0" />}
      </div>
    </div>
  );
}
