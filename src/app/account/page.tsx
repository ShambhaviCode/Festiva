import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "Account", description: "Sign in to keep your FESTIVA celebration plans in a private account.", alternates: { canonical: "/account" }, robots: { index: false } };

export default function AccountPage() {
  return (
    <>
      <PageIntro title="Account" lede="An account keeps your celebration plans in private cloud storage so you can reach them from any device. You never need one to use FESTIVA." />
      <div className="shell pb-24">
        <AccountPanel />
      </div>
    </>
  );
}
