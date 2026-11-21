import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Matchmaker } from "@/components/matchmaker/Matchmaker";
import { aiStatus } from "@/lib/env.server";

export const metadata: Metadata = {
  title: "Matchmaker: a personalised celebration plan",
  description: "Answer six questions and get a celebration plan: schedule, food that fits every diet, gifts, attire, decorations, activities, music, greetings and a budget split, each with its reasoning.",
  alternates: { canonical: "/matchmaker" },
};

/** Reads server configuration at request time so the page reflects the live deployment, not the build machine. */
async function MatchmakerWithConfig() {
  await connection();
  return <Matchmaker aiEnabled={aiStatus().configured} />;
}

export default function MatchmakerPage() {
  return (
    <div className="shell pb-24 pt-12 lg:pt-16">
      <header className="mb-10 max-w-3xl">
        <h1 className="display-1">FESTIVA Matchmaker</h1>
        <p className="lede mt-5 text-ink">Your celebration concierge. Six short questions, then a plan you can edit line by line, with the reason behind every suggestion.</p>
      </header>
      <Suspense fallback={<p className="note min-h-[80vh] py-10">Loading the Matchmaker…</p>}>
        <MatchmakerWithConfig />
      </Suspense>
    </div>
  );
}
