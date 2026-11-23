"use client";

import Image from "next/image";
import Link from "next/link";
import { formatRange } from "@/domain/dates";
import { upcoming, useToday, type DatedFestival } from "@/components/Upcoming";

export interface RailPhoto { src: string; width: number; height: number }
const ACCENTS = ["bg-saffron", "bg-pink", "bg-turquoise", "bg-jade", "bg-coral", "bg-marigold"];

function when(days: number) {
  if (days <= 0) return "Happening now";
  if (days === 1) return "Tomorrow";
  if (days < 60) return `In ${days} days`;
  return `In about ${Math.round(days / 30)} months`;
}

/** The next festivals on the calendar, worked out from today's date in the browser (never baked into the page). */
export function UpcomingRail({ items, photos, limit = 8 }: { items: (DatedFestival & { category: string })[]; photos: Record<string, RailPhoto>; limit?: number }) {
  const today = useToday();
  if (!today) return <div className="flex gap-4 overflow-hidden" aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-80 w-64 shrink-0" />)}</div>;
  const list = upcoming(items, today, limit);
  const category = new Map(items.map((i) => [i.slug, i.category]));
  return (
    <ol className="-mx-[clamp(1.25rem,4vw,3.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-4" data-testid="upcoming-list">
      {list.map(({ item, occurrence, days }, i) => {
        const photo = photos[item.slug];
        return (
          <li key={item.slug} className="w-64 shrink-0 snap-start sm:w-72">
            <Link href={`/discover/${item.slug}`} className="card-lift photo-zoom group block overflow-hidden rounded-[1.75rem] bg-plum-deep text-ivory">
              <div className="relative aspect-[4/5] overflow-hidden">
                {photo ? (
                  <Image src={photo.src} alt="" fill sizes="(min-width: 640px) 18rem, 16rem" className="object-cover" />
                ) : (
                  <div className={`absolute inset-0 ${ACCENTS[i % ACCENTS.length]} opacity-80`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-plum-deep via-plum-deep/30 to-transparent" />
                <span className={`pill-tag absolute left-3 top-3 ${days <= 7 ? "bg-pink text-white" : "bg-ivory text-plum-deep"}`}>{when(days)}</span>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-semibold text-marigold">{formatRange(occurrence.start, occurrence.end)}</p>
                  <h3 className="mt-1 text-2xl leading-tight">{item.name}</h3>
                  <p className="mt-1 text-sm text-ivory/80">{category.get(item.slug)} · {item.place}</p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
