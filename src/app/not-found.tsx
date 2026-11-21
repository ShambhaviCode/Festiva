import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell py-24">
      <h1 className="display-1">This page is not in the guide.</h1>
      <p className="lede mt-5 max-w-xl text-ink">The address may be mistyped, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/discover" className="btn btn-plum">
          Browse festivals
        </Link>
        <Link href="/" className="btn btn-line">
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
