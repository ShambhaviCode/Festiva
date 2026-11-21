"use client";

import { useEffect } from "react";
import { track, type EventName } from "@/lib/analytics";

/** Fires one analytics event when the page it sits on is viewed. Renders nothing. */
export function Track({ name, label }: { name: EventName; label?: string }) {
  useEffect(() => {
    track(name, label);
  }, [name, label]);
  return null;
}
