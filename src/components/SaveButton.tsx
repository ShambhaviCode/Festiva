"use client";

import { useState } from "react";
import { favouriteArtists, savedFestivals, savedPlaces, toggleIn, useStore, wishlist } from "@/lib/store";
import { toast } from "@/lib/toast";

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
  const [pop, setPop] = useState(false);
  return (
    <button
      type="button"
      className={`btn ${saved ? "btn-plum" : "btn-line"} ${small ? "btn-sm" : ""} ${pop ? "save-pop" : ""}`}
      onAnimationEnd={() => setPop(false)}
      aria-pressed={saved}
      aria-label={`${saved ? WORDS[kind][1] : WORDS[kind][0]}: ${name}`}
      onClick={() => {
        toggleIn(store, id);
        if (!saved) setPop(true);
        const where = kind === "artist" ? { label: "Open Sound", href: "/sound" } : { label: "View saved", href: "/saved" };
        toast(saved ? `Removed ${name}` : `${kind === "wishlist" ? "Added to your wishlist" : "Saved"}: ${name}`, { tone: saved ? "info" : "success", action: saved ? undefined : where });
      }}
    >
      {saved ? WORDS[kind][1] : WORDS[kind][0]}
    </button>
  );
}
