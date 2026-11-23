"use client";

import Link from "next/link";
import { useState } from "react";
import { heldCircles } from "@/lib/client/circles";
import { localPlans } from "@/lib/plans";
import { favouriteArtists, savedFestivals, savedPlaces, useStore, wishlist } from "@/lib/store";
import { confirmAction } from "@/lib/confirm";

const KEYS = ["festiva.saved-festivals", "festiva.saved-places", "festiva.wishlist", "festiva.favourite-artists", "festiva.recent-artists", "festiva.best-scores", "festiva.plans", "festiva.shares", "festiva.preferences", "festiva.search.recent"];

/** Everything this device keeps for the person, with counts, links and a way to clear it. */
export function YourThings() {
  const [fests] = useStore(savedFestivals);
  const [places] = useStore(savedPlaces);
  const [wish] = useStore(wishlist);
  const [artists] = useStore(favouriteArtists);
  const [plans] = useStore(localPlans);
  const [circles] = useStore(heldCircles);
  const [cleared, setCleared] = useState(false);
  const tiles = [
    { label: "Saved festivals", n: fests.length, href: "/saved", colour: "bg-saffron" },
    { label: "Saved places", n: places.length, href: "/saved", colour: "bg-turquoise" },
    { label: "Gift wishlist", n: wish.length, href: "/saved", colour: "bg-pink text-white" },
    { label: "Favourite artists", n: artists.length, href: "/sound", colour: "bg-jade" },
    { label: "Celebration plans", n: plans.length, href: "/plans", colour: "bg-marigold" },
    { label: "Gift Circles", n: circles.length, href: "/circles", colour: "bg-coral" },
  ];
  return (
    <div data-testid="your-things">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className={`card-lift block rounded-[1.5rem] p-4 ${t.colour}`}>
              <span className="block font-[family-name:var(--font-display)] text-4xl font-[800] tracking-[-0.04em]">{t.n}</span>
              <span className="font-semibold">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="note mt-4">Kept in this browser. Signed in, your celebration plans also sync to your private account.</p>
      <button
        type="button"
        className="btn btn-line btn-sm mt-4"
        onClick={async () => {
          if (!(await confirmAction({ title: "Clear data on this device?", body: "Removes the saved items, plans and preferences FESTIVA keeps in this browser. Gift Circles you joined stay on the server.", confirmLabel: "Clear data", tone: "danger" }))) return;
          try { for (const k of KEYS) window.localStorage.removeItem(k); } catch { /* storage unavailable */ }
          setCleared(true);
          window.location.reload();
        }}
      >
        Clear data on this device
      </button>
      {cleared && <p role="status" className="note mt-2">Cleared.</p>}
    </div>
  );
}
