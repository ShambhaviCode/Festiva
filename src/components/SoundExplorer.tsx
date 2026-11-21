"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { artists, genres, listenLinks, playlists } from "@/data/music";
import { normalise } from "@/domain/text";
import type { Artist } from "@/domain/types";
import { favouriteArtists, recentArtists, toggleIn, useStore } from "@/lib/store";

function ListenLinks({ query, onOpen }: { query: string; onOpen?: () => void }) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {listenLinks(query).map((link) => (
        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="link link-accent" onClick={onOpen} aria-label={`Find ${query} on ${link.label}`}>
          {link.label}
        </a>
      ))}
    </span>
  );
}

function ArtistRow({ artist }: { artist: Artist }) {
  const [favourites] = useStore(favouriteArtists);
  const isFavourite = favourites.includes(artist.name);
  const genre = genres.find((g) => g.slug === artist.genre);
  const remember = () => recentArtists.set((list) => [artist.name, ...list.filter((n) => n !== artist.name)].slice(0, 8));
  return (
    <li className="rule grid gap-x-8 gap-y-2 border-t py-5 md:grid-cols-[1fr_auto]" data-testid="artist-row">
      <div>
        <h3 className="text-2xl">{artist.name}</h3>
        <p className="note mt-1">
          {genre?.name}, {artist.country}. {artist.languages.join(", ")}.
        </p>
        {artist.songs.length > 0 && (
          <ul className="mt-2 grid gap-1">
            {artist.songs.map((song) => (
              <li key={song} className="flex flex-wrap items-baseline gap-x-4">
                <span>“{song}”</span>
                <ListenLinks query={`${artist.name} ${song}`} onOpen={remember} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 flex flex-wrap items-baseline gap-x-4">
          <span className="note">Official videos and releases:</span>
          <ListenLinks query={`${artist.name} official`} onOpen={remember} />
        </p>
      </div>
      <div className="md:self-center">
        <button type="button" className={`btn btn-sm ${isFavourite ? "btn-plum" : "btn-line"}`} aria-pressed={isFavourite} aria-label={`${isFavourite ? "Favourited" : "Favourite"}: ${artist.name}`} onClick={() => toggleIn(favouriteArtists, artist.name)}>
          {isFavourite ? "Favourited" : "Favourite"}
        </button>
      </div>
    </li>
  );
}

export function SoundExplorer() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [genre, setGenre] = useState(() => (genres.some((g) => g.slug === params.get("genre")) ? params.get("genre")! : ""));
  const [favourites] = useStore(favouriteArtists);
  const [recent] = useStore(recentArtists);

  const results = useMemo(() => {
    const tokens = normalise(query).split(" ").filter(Boolean);
    return artists.filter((artist) => {
      if (genre && artist.genre !== genre) return false;
      const text = ` ${normalise([artist.name, artist.country, artist.genre, ...artist.languages, ...artist.songs].join(" "))} `;
      return tokens.every((t) => text.includes(` ${t}`));
    });
  }, [query, genre]);

  const activeGenre = genres.find((g) => g.slug === genre);
  const byName = (name: string) => artists.find((a) => a.name === name);

  return (
    <div className="grid gap-14">
      <section aria-label="Search music">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-5">
          <label className="grid">
            <span className="field-label">Search by artist, song, country or language</span>
            <input type="search" className="field max-w-xl" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “Korean”, “Cuba” or “Jai Ho”" data-testid="sound-search" autoComplete="off" />
          </label>
          <fieldset>
            <legend className="field-label">Genre</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="chip" aria-pressed={genre === ""} onClick={() => setGenre("")}>
                All genres
              </button>
              {genres.map((g) => (
                <button key={g.slug} type="button" className="chip" aria-pressed={genre === g.slug} onClick={() => setGenre(g.slug)}>
                  {g.name}
                </button>
              ))}
            </div>
          </fieldset>
        </form>
        {activeGenre && (
          <p className="mt-6 max-w-2xl rounded-2xl bg-cream p-5">
            <span className="font-semibold">{activeGenre.name}</span>, {activeGenre.origin}. {activeGenre.about}
          </p>
        )}
        <p className="note mt-6" role="status" aria-live="polite" data-testid="sound-count">
          {results.length} {results.length === 1 ? "artist" : "artists"}
        </p>
        {results.length === 0 ? (
          <p className="rule mt-2 border-t py-8 text-ink">No artists in the guide match. FESTIVA&rsquo;s list is a starting point, not a catalogue; try a genre instead.</p>
        ) : (
          <ul className="mt-2">
            {results.map((artist) => (
              <ArtistRow key={artist.name} artist={artist} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="playlists-heading">
        <h2 id="playlists-heading" className="display-2">
          Curated playlists
        </h2>
        <div className="mt-6 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {playlists.map((playlist) => (
            <article key={playlist.slug} id={playlist.slug} className="scroll-mt-24">
              <h3 className="text-2xl">{playlist.title}</h3>
              <p className="note mt-1">{playlist.mood}</p>
              <ol className="mt-3">
                {playlist.tracks.map((track, i) => (
                  <li key={track.song} className="rule grid grid-cols-[1.5rem_1fr] gap-x-2 border-t py-2.5">
                    <span className="tabular-nums text-ink">{i + 1}</span>
                    <span>
                      <span className="font-semibold">{track.song}</span>, {track.artist}
                      <ListenLinks query={`${track.artist} ${track.song}`} />
                    </span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-10 md:grid-cols-2">
        <section aria-labelledby="favourites-heading">
          <h2 id="favourites-heading" className="display-3">
            Favourites
          </h2>
          {favourites.length === 0 ? (
            <p className="note mt-2">Press Favourite on an artist to keep them here. Saved on this device.</p>
          ) : (
            <ul className="mt-3 grid gap-2" data-testid="sound-favourites">
              {favourites.map((name) => (
                <li key={name} className="flex flex-wrap items-baseline justify-between gap-3">
                  <button type="button" className="link" onClick={() => (setQuery(name), setGenre(""))}>
                    {name}
                  </button>
                  <span className="note">{byName(name)?.country}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="display-3">
            Recently explored
          </h2>
          {recent.length === 0 ? (
            <p className="note mt-2">Artists you open on a listening service appear here.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {recent.map((name) => (
                <li key={name}>
                  <button type="button" className="link" onClick={() => (setQuery(name), setGenre(""))}>
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
