"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_CONFIG, DEFAULT_FLAGS, type EvaluatedFlags } from "../flags/definitions";
import { createLocalStore } from "../store";

/**
 * Browser-side helpers for Gift Circle.
 *
 * - An anonymous random identifier (never linked to a name) for flag
 *   evaluation and experiment counts.
 * - The keys this device holds for each circle. A key is shown once by the
 *   server and kept only here, in this browser.
 * - A small fetch wrapper that sends both.
 */

const ANON_KEY = "festiva.anon";

export function anonymousId(): string {
  try {
    let value = window.localStorage.getItem(ANON_KEY);
    if (!value || !/^[A-Za-z0-9_-]{16,64}$/.test(value)) {
      value = crypto.randomUUID().replace(/-/g, "");
      window.localStorage.setItem(ANON_KEY, value);
    }
    return value;
  } catch {
    return "nostorage" + Math.random().toString(36).slice(2).padEnd(12, "0");
  }
}

export interface HeldCircle {
  circleId: string;
  role: "organiser" | "participant";
  key: string;
  participantId: string;
  name: string;
  savedAt: string;
}

const isHeld = (value: unknown): value is HeldCircle[] =>
  Array.isArray(value) && value.every((v) => v && typeof v === "object" && typeof (v as HeldCircle).circleId === "string" && typeof (v as HeldCircle).key === "string");

export const heldCircles = createLocalStore<HeldCircle[]>("festiva.circles", [], isHeld);

export function rememberCircle(entry: HeldCircle): void {
  heldCircles.set((all) => [entry, ...all.filter((c) => !(c.circleId === entry.circleId && c.participantId === entry.participantId))].slice(0, 50));
}

export function forgetCircle(circleId: string): void {
  heldCircles.set((all) => all.filter((c) => c.circleId !== circleId));
}

export function keyFor(circleId: string): HeldCircle | null {
  const all = heldCircles.get().filter((c) => c.circleId === circleId);
  return all.find((c) => c.role === "organiser") ?? all[0] ?? null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit & { key?: string | null } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("x-festiva-anon", anonymousId());
  if (init.key) headers.set("authorization", `Bearer ${init.key}`);
  if (init.body && typeof init.body === "string" && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!response.ok) throw new ApiError(response.status, data.code ?? "error", data.error ?? "Something went wrong. Try again.");
  return data as T;
}

export type ClientFlags = Pick<EvaluatedFlags, "flags" | "config" | "onboarding" | "source" | "evaluatedAt">;

const FALLBACK: ClientFlags = {
  flags: DEFAULT_FLAGS,
  config: DEFAULT_CONFIG,
  onboarding: { variant: "guided", inExperiment: false, assignedBy: "none" },
  source: "defaults",
  evaluatedAt: "",
};

let shared: { value: ClientFlags | null; listeners: Set<() => void>; timer: ReturnType<typeof setInterval> | null; inflight: Promise<void> | null } = {
  value: null,
  listeners: new Set(),
  timer: null,
  inflight: null,
};

async function refresh(): Promise<void> {
  if (shared.inflight) return shared.inflight;
  shared.inflight = (async () => {
    try {
      shared.value = await api<ClientFlags>("/api/flags");
      shared.listeners.forEach((listener) => listener());
    } catch {
      // Keep the last known values; the server enforces flags regardless.
    } finally {
      shared.inflight = null;
    }
  })();
  return shared.inflight;
}

const onFocus = () => void refresh();

function subscribe(listener: () => void): () => void {
  shared.listeners.add(listener);
  if (shared.listeners.size === 1) {
    shared.timer = setInterval(() => void refresh(), 10_000);
    window.addEventListener("focus", onFocus);
  }
  if (!shared.value) void refresh();
  return () => {
    shared.listeners.delete(listener);
    if (shared.listeners.size === 0) {
      if (shared.timer) clearInterval(shared.timer);
      shared.timer = null;
      window.removeEventListener("focus", onFocus);
    }
  };
}

/**
 * Evaluated flags for this visitor, refreshed every 10 seconds and whenever
 * the tab regains focus, so a change in Flagsmith appears without a reload.
 * Returns `null` until the first answer arrives. Built on useSyncExternalStore,
 * so every component sees the same value even if it mounts after the fetch.
 */
export function useFlags(): ClientFlags | null {
  return useSyncExternalStore(
    subscribe,
    () => shared.value,
    () => null,
  );
}

export const flagsOrDefault = (value: ClientFlags | null): ClientFlags => value ?? FALLBACK;

/** Test hook: forget cached flags. */
export function resetClientFlags(): void {
  shared = { value: null, listeners: new Set(), timer: null, inflight: null };
}
