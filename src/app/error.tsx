"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell py-24" role="alert">
      <h1 className="display-1">Something went wrong on this page.</h1>
      <p className="lede mt-5 max-w-xl text-ink">Nothing you saved has been lost. Try loading the page again.</p>
      <button type="button" className="btn btn-plum mt-8" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
