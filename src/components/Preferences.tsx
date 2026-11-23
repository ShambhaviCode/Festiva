"use client";

import { CURRENCIES, LOCALES } from "@/domain/currency";
import { preferences, useStore } from "@/lib/store";
import { toast } from "@/lib/toast";

/** Display preferences, stored on the device. They change date and number formatting; the interface text is English. */
export function Preferences({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const field = tone === "dark" ? "field !bg-plum !text-ivory" : "field";
  const [prefs, setPrefs] = useStore(preferences);
  return (
    <form className="grid content-start gap-4" onSubmit={(e) => e.preventDefault()} aria-label="Display preferences">
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Date and number format</span>
        <select className={field} value={prefs.locale} onChange={(e) => { setPrefs({ ...prefs, locale: e.target.value }); toast(`Dates and numbers now follow ${LOCALES.find((l) => l.code === e.target.value)?.label ?? e.target.value}`); }}>
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold">Currency for budgets</span>
        <select className={field} value={prefs.currency} onChange={(e) => { setPrefs({ ...prefs, currency: e.target.value }); toast(`Budgets now use ${e.target.value}`); }}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}, {c.name}
            </option>
          ))}
        </select>
      </label>
      <p className="note">Saved on this device. Budgets in the planner and Gift Circle use this currency. FESTIVA does not convert between currencies, and the interface text is in English.</p>
    </form>
  );
}
