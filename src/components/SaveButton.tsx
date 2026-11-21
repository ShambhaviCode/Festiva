"use client";

import { favouriteArtists, savedFestivals, savedPlaces, toggleIn, useStore, wishlist } from "@/lib/store";

const STORES = { festival: savedFestivals, place: savedPlaces, wishlist, artist: favouriteArtists } as const;
const WORDS = {
  festival: ["Save festival", "Saved"],
  place: ["Save place", "Saved"],
  wishlist: ["Add to wishlist", "On your wishlist"],
  artist: ["Favourite", "Favourited"],
} as const;

export function SaveButton({ kind, id, name, small }: { kind: keyof typeof STORES; id: string; name: string; small?: boolean }) {
  const store = STORES[kind];
  const [list] = useStore(store);
  const saved = list.includes(id);
  return (
    <button
      type="button"
      className={`btn ${saved ? "btn-plum" : "btn-line"} ${small ? "btn-sm" : ""}`}
      aria-pressed={saved}
      aria-label={`${saved ? WORDS[kind][1] : WORDS[kind][0]}: ${name}`}
      onClick={() => toggleIn(store, id)}
    >
      {saved ? WORDS[kind][1] : WORDS[kind][0]}
    </button>
  );
}
