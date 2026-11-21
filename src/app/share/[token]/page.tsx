import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PlanView } from "@/components/matchmaker/PlanView";
import { getShared } from "@/lib/share-store";

export const metadata: Metadata = {
  title: "A shared celebration plan",
  description: "A celebration plan made with the FESTIVA Matchmaker.",
  robots: { index: false, follow: false },
};

async function SharedPlan({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await getShared(token);
  if (!record) {
    return (
      <div className="py-10" data-testid="share-unavailable">
        <h1 className="display-2">This shared plan is not available.</h1>
        <p className="mt-3 max-w-xl text-ink">The link may have been revoked by the person who shared it, or it may have expired.</p>
        <Link href="/matchmaker" className="btn btn-saffron mt-6">
          Make a plan of your own
        </Link>
      </div>
    );
  }
  return (
    <>
      <PlanView plan={record.plan} />
      <div className="no-print rule mt-12 border-t pt-8">
        <Link href={`/matchmaker?occasion=${record.plan.input.occasion}`} className="btn btn-saffron">
          Make a plan of your own
        </Link>
      </div>
    </>
  );
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <div className="shell pb-24 pt-12">
      <Suspense fallback={<p className="note min-h-[80vh]">Opening the shared plan…</p>}>
        <SharedPlan params={params} />
      </Suspense>
    </div>
  );
}
