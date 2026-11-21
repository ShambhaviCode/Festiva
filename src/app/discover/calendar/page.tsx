import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { festivals } from "@/data/festivals";
import { monthName, typicalMonths } from "@/domain/dates";
import { placeLine } from "@/lib/view";

export const metadata: Metadata = {
  title: "Festival calendar by month",
  description: "A month-by-month view of when the world's festivals usually fall, with fixed, calculated and lunar dates clearly distinguished.",
  alternates: { canonical: "/discover/calendar" },
};

const KIND_NOTE: Record<string, string> = {
  fixed: "fixed date",
  "nth-weekday": "set by a weekday rule",
  "easter-offset": "moves with Easter",
  custom: "set by a calendar rule",
  table: "moves with a lunar calendar",
  seasonal: "seasonal",
};

export default function CalendarPage() {
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { month, list: festivals.filter((f) => typicalMonths(f.date, 2026).includes(month)) };
  });
  return (
    <>
      <PageIntro
        title="The festival calendar"
        lede="When each celebration usually falls. Many follow lunar or regional calendars and move from year to year, so every festival page gives the next date with its source and how certain it is."
      >
        <nav aria-label="Jump to month" className="mt-6 flex flex-wrap gap-2">
          {months.map(({ month }) => (
            <a key={month} href={`#month-${month}`} className="chip">
              {monthName(month)}
            </a>
          ))}
        </nav>
      </PageIntro>
      <div className="shell pb-20">
        {months.map(({ month, list }) => (
          <section key={month} id={`month-${month}`} className="rule grid scroll-mt-24 gap-4 border-t py-8 lg:grid-cols-[0.3fr_1fr]" aria-labelledby={`month-heading-${month}`}>
            <h2 id={`month-heading-${month}`} className="display-2">
              {monthName(month)}
            </h2>
            {list.length === 0 ? (
              <p className="note self-center">No festivals in the guide usually fall in this month.</p>
            ) : (
              <ul>
                {list.map((f) => (
                  <li key={f.slug} className="rule border-t first:border-t-0">
                    <Link href={`/discover/${f.slug}`} className="group grid gap-x-6 py-3 sm:grid-cols-[1fr_auto]">
                      <span>
                        <span className="font-[family-name:var(--font-display)] text-xl group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">{f.name}</span>
                        <span className="note block">{placeLine(f)}</span>
                      </span>
                      <span className="note sm:text-right">{KIND_NOTE[f.date.kind]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
