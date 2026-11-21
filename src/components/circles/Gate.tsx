"use client";

import Link from "next/link";
import { PageSkeleton } from "@/components/Skeleton";
import type { ReactNode } from "react";
import {
  flagsOrDefault,
  useFlags,
  type ClientFlags,
} from "@/lib/client/circles";

/**
 * Renders Gift Circle only while its flag is on. The API enforces the same
 * flag, so this is presentation, not the control itself.
 */
export function GiftCircleGate({
  children,
}: {
  children: (flags: ClientFlags) => ReactNode;
}) {
  const value = useFlags();
  if (!value)
    return <PageSkeleton label="Loading Gift Circle…" variant="summary" />;
  const flags = flagsOrDefault(value);
  if (!flags.flags.gift_circle_enabled) {
    return (
      <div className="min-h-[50vh] py-10" data-testid="gift-circle-off">
        <h2 className="display-2">Gift Circle is paused right now.</h2>
        <p className="lede mt-4 max-w-xl">
          Nothing you added has been lost. Check back later, or plan a
          celebration with the Matchmaker in the meantime.
        </p>
        <Link href="/matchmaker" className="btn btn-saffron mt-6">
          Plan a celebration
        </Link>
      </div>
    );
  }
  // Same minimum height as the loading placeholder, so a page shorter than the screen does not pull the footer up into view.
  return <div className="min-h-[100svh]">{children(flags)}</div>;
}
