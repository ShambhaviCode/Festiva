import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { SavedLists } from "@/components/SavedLists";
import { destinations } from "@/data/destinations";
import { festivals } from "@/data/festivals";
import { artists } from "@/data/music";
import { giftIdeas } from "@/data/shop";

export const metadata: Metadata = { title: "Saved", description: "Festivals, places, gift ideas and artists you have saved in FESTIVA.", alternates: { canonical: "/saved" }, robots: { index: false } };

export default function SavedPage() {
  return (
    <>
      <PageIntro title="Saved" lede="Everything you have saved, kept privately in this browser. Nothing here is sent to FESTIVA.">
        <p className="mt-5">
          <Link href="/plans" className="link link-accent">
            Looking for your celebration plans?
          </Link>
        </p>
      </PageIntro>
      <div className="shell pb-24">
        <SavedLists
          festivals={Object.fromEntries(festivals.map((f) => [f.slug, { title: f.name, href: `/discover/${f.slug}` }]))}
          places={Object.fromEntries(destinations.map((d) => [d.slug, { title: d.name, href: `/journeys/${d.slug}` }]))}
          gifts={Object.fromEntries(giftIdeas.map((g) => [g.slug, { title: g.title, href: "/shop" }]))}
          artists={Object.fromEntries(artists.map((a) => [a.name, { title: a.name, href: `/sound?q=${encodeURIComponent(a.name)}` }]))}
        />
      </div>
    </>
  );
}
