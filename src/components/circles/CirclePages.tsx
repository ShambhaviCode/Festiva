"use client";

import { GiftCircleGate } from "./Gate";
import { OrganiserHome } from "./OrganiserHome";
import { ParticipantHome } from "./ParticipantHome";
import { CircleSummary } from "./Summary";

/** Client entry points for the circle pages, rendered behind the Gift Circle flag. */
export function CirclePageClient({
  circleId,
  view,
}: {
  circleId: string;
  view: "organiser" | "participant" | "summary";
}) {
  return (
    <GiftCircleGate>
      {() =>
        view === "organiser" ? (
          <OrganiserHome circleId={circleId} />
        ) : view === "participant" ? (
          <ParticipantHome circleId={circleId} />
        ) : (
          <CircleSummary circleId={circleId} />
        )
      }
    </GiftCircleGate>
  );
}
