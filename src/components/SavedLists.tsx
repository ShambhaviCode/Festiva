"use client";

import Link from "next/link";
import { favouriteArtists, savedFestivals, savedPlaces, toggleIn, useStore, wishlist, type LocalStore } from "@/lib/store";
import { toast } from "@/lib/toast";

interface Lookup {
  [id: string]: { title: string; href: string };
}

function List({ title, empty, emptyHref, emptyCta, store, lookup, testId }: { title: string; empty: string; emptyHref: string; emptyCta: string; store: LocalStore<string[]>; lookup: Lookup; testId: string }) {
  const [ids] = useStore(store);
  const known = ids.filter((id) => lookup[id]);
  return (
    <section className="rule grid gap-4 border-t py-8 lg:grid-cols-[0.36fr_1fr] lg:gap-12" aria-label={title}>
      <h2 className="display-3">{title}</h2>
      {known.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-charcoal/20 px-6 py-7">
          <p className="text-ink">{empty}</p>
          <Link href={emptyHref} className="btn btn-line btn-sm mt-3">
            {emptyCta}
          </Link>
        </div>
      ) : (
        <ul data-testid={testId}>
          {known.map((id) => (
            <li key={id} className="rule flex flex-wrap items-center justify-between gap-3 border-t py-3 first:border-t-0">
              <Link href={lookup[id].href} className="font-semibold hover:underline hover:decoration-gold hover:underline-offset-4">
                {lookup[id].title}
              </Link>
              <button type="button" className="btn btn-line btn-sm" onClick={() => { toggleIn(store, id); toast(`Removed ${lookup[id].title}`, { tone: "info", action: { label: "Undo", onClick: () => toggleIn(store, id) } }); }} aria-label={`Remove ${lookup[id].title}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SavedLists({ festivals, places, gifts, artists }: { festivals: Lookup; places: Lookup; gifts: Lookup; artists: Lookup }) {
  return (
    <>
      <List title="Festivals" empty="No saved festivals yet." emptyHref="/discover" emptyCta="Browse festivals" store={savedFestivals} lookup={festivals} testId="saved-festivals" />
      <List title="Places" empty="No saved places yet." emptyHref="/journeys" emptyCta="Browse destinations" store={savedPlaces} lookup={places} testId="saved-places" />
      <List title="Gift wishlist" empty="Your wishlist is empty." emptyHref="/shop" emptyCta="Find gift ideas" store={wishlist} lookup={gifts} testId="saved-wishlist" />
      <List title="Favourite artists" empty="No favourite artists yet." emptyHref="/sound" emptyCta="Explore music" store={favouriteArtists} lookup={artists} testId="saved-artists" />
    </>
  );
}
