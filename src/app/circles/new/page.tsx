"use client";

import Link from "next/link";
import { Suspense } from "react";
import { GiftCircleGate } from "@/components/circles/Gate";
import { Onboarding } from "@/components/circles/Onboarding";

export default function NewCirclePage() {
  return (
    <div className="shell max-w-4xl pb-24 pt-10">
      <nav aria-label="Breadcrumb">
        <Link href="/circles" className="link note">
          Back to Gift Circle
        </Link>
      </nav>
      <h1 className="display-1 mt-5">Start a gift circle</h1>
      <p className="lede mt-4 max-w-2xl text-ink">You can change who is invited later. Nothing is shared until you send the invitation link.</p>
      <div className="mt-10">
        {/* Onboarding reads prefill values from the address (for example from a Matchmaker plan). */}
        <Suspense fallback={null}>
          <GiftCircleGate>{(flags) => <Onboarding flags={flags} />}</GiftCircleGate>
        </Suspense>
      </div>
    </div>
  );
}
