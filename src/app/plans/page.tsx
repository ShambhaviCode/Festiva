import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { PlanList } from "@/components/matchmaker/Plans";

export const metadata: Metadata = {
  title: "My plans",
  description: "Celebration plans you have saved from the FESTIVA Matchmaker.",
  alternates: { canonical: "/plans" },
  robots: { index: false },
};

export default function PlansPage() {
  return (
    <>
      <PageIntro title="My plans" lede="Plans you have saved. They are private: nothing is visible to anyone else unless you create a share link, and you can revoke that link at any time." />
      <div className="shell pb-24">
        <PlanList />
      </div>
    </>
  );
}
