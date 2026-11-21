import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { GameIndex } from "@/components/play/GameHost";

export const metadata: Metadata = {
  title: "Play: five cultural games",
  description: "Festival Memory Match, Global Culture Quiz, Rangoli Pattern Designer, Festival Knowledge Challenge and a Cultural Puzzle. Free, in the browser, with keyboard and touch support.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <>
      <PageIntro title="Play" lede="Five small games built from the festival guide. They work with touch, mouse and keyboard, and your best scores stay on this device." />
      <section className="shell pb-24">
        <GameIndex />
      </section>
    </>
  );
}
