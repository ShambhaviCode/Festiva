"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ToastEvent } from "@/lib/toast";

const ICON: Record<string, string> = { success: "✓", info: "i", error: "!" };
const TONE: Record<string, string> = { success: "bg-jade text-plum-deep", info: "bg-marigold text-plum-deep", error: "bg-vermilion text-white" };

/** Shows toast() messages: bottom-centre on phones, bottom-right on larger screens. Announced politely to screen readers. */
export function Toaster() {
  const [items, setItems] = useState<(ToastEvent & { leaving?: boolean })[]>([]);
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const onToast = (e: Event) => {
      const t = (e as CustomEvent<ToastEvent>).detail;
      setItems((list) => [...list.slice(-2), t]);
      const leave = setTimeout(() => setItems((list) => list.map((x) => (x.id === t.id ? { ...x, leaving: true } : x))), 3600);
      const drop = setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 3900);
      timers.add(leave); timers.add(drop);
    };
    window.addEventListener("festiva:toast", onToast);
    return () => { window.removeEventListener("festiva:toast", onToast); timers.forEach(clearTimeout); };
  }, []);
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end" data-testid="toaster">
      {items.map((t) => (
        <div key={t.id} role="status" className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl bg-plum-deep px-4 py-3 text-ivory shadow-[0_20px_40px_-18px_rgba(23,8,51,0.7)] ${t.leaving ? "toast-out" : "toast-in"}`}>
          <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm font-bold ${TONE[t.tone ?? "success"]}`}>{ICON[t.tone ?? "success"]}</span>
          <span className="font-medium">{t.message}</span>
          {t.action && "href" in t.action && <Link href={t.action.href} className="shrink-0 font-semibold text-marigold underline-offset-2 hover:underline">{t.action.label}</Link>}
          {t.action && "onClick" in t.action && (
            <button type="button" className="shrink-0 font-semibold text-marigold underline-offset-2 hover:underline" onClick={() => { (t.action as { onClick: () => void }).onClick(); setItems((list) => list.filter((x) => x.id !== t.id)); }}>
              {t.action.label}
            </button>
          )}
          <button type="button" aria-label="Dismiss" className="shrink-0 text-ivory/60 hover:text-ivory" onClick={() => setItems((list) => list.filter((x) => x.id !== t.id))}>×</button>
        </div>
      ))}
    </div>
  );
}
