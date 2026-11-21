"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Small typed localStorage stores.
 * Everything a visitor saves without an account (saved festivals, wishlist,
 * favourite artists, plans, scores, preferences) stays on their own device.
 */
export interface LocalStore<T> {
  key: string;
  get(): T;
  set(value: T | ((previous: T) => T)): void;
  subscribe(listener: () => void): () => void;
  fallback: T;
}

export function createLocalStore<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T } | null = null;

  const read = (): T => {
    if (typeof window === "undefined") return fallback;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cache?.value ?? fallback;
    }
    if (cache && cache.raw === raw) return cache.value;
    let value = fallback;
    if (raw !== null) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!validate || validate(parsed)) value = parsed as T;
      } catch {
        value = fallback;
      }
    }
    cache = { raw, value };
    return value;
  };

  const store: LocalStore<T> = {
    key,
    fallback,
    get: read,
    set(next) {
      const value = typeof next === "function" ? (next as (previous: T) => T)(read()) : next;
      const raw = JSON.stringify(value);
      cache = { raw, value };
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        // Storage can be unavailable (private mode, quota). The value still lives in memory for this visit.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
  return store;
}

export function useStore<T>(store: LocalStore<T>): [T, LocalStore<T>["set"]] {
  const getServerSnapshot = useCallback(() => store.fallback, [store]);
  const value = useSyncExternalStore(store.subscribe, store.get, getServerSnapshot);
  return [value, store.set];
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

export const savedFestivals = createLocalStore<string[]>("festiva.saved-festivals", [], isStringArray);
export const savedPlaces = createLocalStore<string[]>("festiva.saved-places", [], isStringArray);
export const wishlist = createLocalStore<string[]>("festiva.wishlist", [], isStringArray);
export const favouriteArtists = createLocalStore<string[]>("festiva.favourite-artists", [], isStringArray);
export const recentArtists = createLocalStore<string[]>("festiva.recent-artists", [], isStringArray);
export const bestScores = createLocalStore<Record<string, number>>("festiva.best-scores", {});
export const preferences = createLocalStore<{ locale: string; currency: string }>("festiva.preferences", { locale: "en-GB", currency: "INR" });

export function toggleIn(store: LocalStore<string[]>, id: string): void {
  store.set((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
}

export function recordScore(game: string, score: number): void {
  bestScores.set((scores) => (score > (scores[game] ?? -Infinity) ? { ...scores, [game]: score } : scores));
}
