"use client";

import { EVENT_NAMES, type EventName } from "./analytics-events";

/**
 * First-party, privacy-conscious product analytics.
 * - No third-party scripts, no cookies, no fingerprinting.
 * - Respects Do Not Track and Global Privacy Control.
 * - Events carry a name and at most a small label (for example a festival
 *   slug); never free text, names or plan contents.
 * - If the deployment has no database configured, the endpoint discards them.
 */
export { EVENT_NAMES, type EventName };

function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function track(name: EventName, label?: string): void {
  if (typeof window === "undefined" || optedOut()) return;
  const body = JSON.stringify({ name, label: label?.slice(0, 60), path: window.location.pathname });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    else void fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
  } catch {
    // Analytics must never break the product.
  }
}
