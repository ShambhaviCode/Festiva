import type { Metadata } from "next";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { WishStudio } from "@/components/WishStudio";
import { festivals } from "@/data/festivals";

export const metadata: Metadata = {
  title: "Wishes: make a personalised greeting card",
  description: "Create an original festival greeting card: choose the festival, language, tone, typeface and colours, then download, copy or share it.",
  alternates: { canonical: "/wishes" },
};

const options = [...festivals].sort((a, b) => a.name.localeCompare(b.name)).map((f) => ({ slug: f.slug, name: f.name, greetings: f.greetings }));

export default function WishesPage() {
  return (
    <>
      <PageIntro title="Wishes" lede="Make a greeting card in a minute. Pick the celebration, write to someone by name, choose a design, and download or share it. The artwork and wording are original to FESTIVA." />
      <section className="shell pb-24">
        <Suspense fallback={<p className="note min-h-[80vh]">Loading the studio…</p>}>
          <WishStudio festivals={options} />
        </Suspense>
      </section>
    </>
  );
}
