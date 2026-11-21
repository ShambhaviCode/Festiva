"use client";

import { useCallback, useEffect, useState } from "react";
import type { BudgetInsights, OrganiserView, ParticipantView } from "@/domain/circle/engine";
import type { VerifiedContext } from "@/domain/circle/culture";
import type { Participant } from "@/domain/circle/schema";
import { api, ApiError, heldCircles, type HeldCircle } from "@/lib/client/circles";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/hooks";

export interface Capabilities {
  voice: boolean;
  voiceReason: string | null;
  translation: boolean;
  aiStructuring: boolean;
  aiCulture: boolean;
  recommendations: boolean;
  secretSanta: boolean;
  budgetInsights: boolean;
  premiumGifting: boolean;
  matchmakerInline: boolean;
  multilingual: boolean;
  maxRecordingSeconds: number;
}

export type CircleResponse =
  | { role: "organiser"; me: Participant; circle: OrganiserView; invite: { createdAt: string; expiresAt: string; revokedAt: string | null } | null; insights: BudgetInsights | null; culture: VerifiedContext | null; capabilities: Capabilities }
  | { role: "participant"; organiser: boolean; me: Participant; circle: ParticipantView; culture: VerifiedContext | null; capabilities: Capabilities };

/**
 * Load a circle with the key this browser holds, and keep it fresh: every
 * 10 seconds and on focus, so flag changes and other people's additions
 * appear without reloading.
 */
export function useCircle(circleId: string, view: "organiser" | "participant" = "organiser") {
  const mounted = useMounted();
  const [held] = useStore(heldCircles);
  const entries = held.filter((c) => c.circleId === circleId);
  const entry: HeldCircle | null = entries.find((c) => c.role === "organiser") ?? entries[0] ?? null;
  const key = entry?.key ?? null;
  const [data, setData] = useState<CircleResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const reload = useCallback(async () => {
    if (!key) return;
    try {
      setData(await api<CircleResponse>(`/api/circles/${circleId}${view === "participant" ? "?view=participant" : ""}`, { key }));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, "network", "The circle could not be loaded."));
    }
  }, [circleId, key, view]);

  useEffect(() => {
    if (!key) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads from the server; state is set after the request resolves
    void reload();
    const timer = setInterval(() => void reload(), 10_000);
    const onFocus = () => void reload();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [key, reload]);

  return { mounted, entry, key, data, error, reload };
}
