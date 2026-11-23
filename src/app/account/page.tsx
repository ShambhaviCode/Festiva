import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/AccountPanel";
import { Preferences } from "@/components/Preferences";
import { YourThings } from "@/components/YourThings";

export const metadata: Metadata = { title: "Account and settings", description: "Your FESTIVA account, regional settings and everything you have saved.", alternates: { canonical: "/account" }, robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="shell pb-24 pt-10 lg:pt-14">
      <p className="eyebrow">Your FESTIVA</p>
      <h1 className="display-1 mt-2">Account and settings</h1>
      <p className="lede mt-3 max-w-2xl text-ink">Browse, plan and save without an account. Sign in to keep your celebration plans in private cloud storage and reach them from any device.</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section aria-labelledby="acct-things" className="rounded-[2rem] bg-cream p-6 sm:p-8">
          <h2 id="acct-things" className="display-3">Your things</h2>
          <div className="mt-5"><YourThings /></div>
        </section>
        <section aria-labelledby="acct-signin" className="rounded-[2rem] border border-charcoal/10 bg-white p-6 sm:p-8">
          <h2 id="acct-signin" className="display-3">Account</h2>
          <div className="mt-5"><AccountPanel /></div>
        </section>
        <section aria-labelledby="acct-region" className="rounded-[2rem] border border-charcoal/10 bg-white p-6 sm:p-8">
          <h2 id="acct-region" className="display-3">Regional settings</h2>
          <div className="mt-5"><Preferences tone="light" /></div>
        </section>
        <section aria-labelledby="acct-privacy" className="rounded-[2rem] bg-plum-deep p-6 text-ivory sm:p-8">
          <h2 id="acct-privacy" className="display-3">Privacy</h2>
          <p className="mt-3 text-ivory/85">No tracking cookies and no advertising. Voice recordings for Gift Circle go to Sarvam AI only with your consent and are never stored.</p>
          <Link href="/privacy" className="link mt-4 inline-block font-semibold text-marigold">Read the privacy notice</Link>
        </section>
      </div>
    </div>
  );
}
