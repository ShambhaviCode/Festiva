import { Suspense } from "react";
import { PageSkeleton } from "@/components/Skeleton";
import { CirclePageClient } from "@/components/circles/CirclePages";

async function Resolved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CirclePageClient circleId={id} view="organiser" />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="shell pb-24 pt-10">
      <Suspense fallback={<PageSkeleton label="Loading…" variant="circle" />}>
        <Resolved params={params} />
      </Suspense>
    </div>
  );
}
