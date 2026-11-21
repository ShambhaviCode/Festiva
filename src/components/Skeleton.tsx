/**
 * Loading placeholders that hold the shape of the page they stand in for, and
 * at least a full screen of height, so the footer never jumps into view and
 * back out when the data arrives.
 */
export function PageSkeleton({
  label,
  variant = "circle",
}: {
  label: string;
  variant?: "circle" | "admin" | "summary";
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[100svh]"
      data-testid="page-skeleton"
    >
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">
        {variant === "admin" ? (
          <>
            <div className="mb-8 flex gap-6">
              <span className="skeleton block h-5 w-28" />
              <span className="skeleton block h-5 w-28" />
            </div>
            <span className="skeleton block h-14 w-3/4 max-w-xl" />
            <span className="skeleton mt-5 block h-5 w-full max-w-2xl" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <span key={i} className="skeleton block h-40" />
              ))}
            </div>
            <span className="skeleton mt-10 block h-64 w-full" />
          </>
        ) : (
          <>
            <div className="grid items-center gap-8 pb-10 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="skeleton block h-4 w-24" />
                <span className="skeleton mt-4 block h-16 w-4/5 max-w-2xl" />
                <span className="skeleton mt-5 block h-6 w-3/5 max-w-lg" />
                <div className="mt-7 flex gap-3">
                  <span className="skeleton block h-12 w-52 rounded-full" />
                  <span className="skeleton block h-12 w-40 rounded-full" />
                </div>
              </div>
              {variant === "circle" && (
                <span className="skeleton mx-auto block size-[260px] rounded-full" />
              )}
            </div>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rule grid gap-5 border-t py-9 lg:grid-cols-[0.36fr_1fr] lg:gap-12"
              >
                <span className="skeleton block h-8 w-40" />
                <div className="grid gap-3">
                  <span className="skeleton block h-5 w-full" />
                  <span className="skeleton block h-5 w-11/12" />
                  <span className="skeleton block h-5 w-2/3" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
