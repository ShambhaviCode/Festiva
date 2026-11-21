import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { SavedPlan } from "@/components/matchmaker/Plans";
import { aiStatus } from "@/lib/env.server";

export const metadata: Metadata = { title: "Saved plan", robots: { index: false } };

async function SavedPlanWithConfig() {
  await connection();
  return <SavedPlan aiEnabled={aiStatus().configured} />;
}

export default function SavedPlanPage() {
  return (
    <div className="shell pb-24 pt-10">
      <nav aria-label="Breadcrumb" className="no-print mb-8">
        <Link href="/plans" className="link note">
          Back to My plans
        </Link>
      </nav>
      <Suspense fallback={<p className="note min-h-[80vh]">Loading your plan…</p>}>
        <SavedPlanWithConfig />
      </Suspense>
    </div>
  );
}
