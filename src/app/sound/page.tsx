import type { Metadata } from "next";
import { Suspense } from "react";
import { PageIntro } from "@/components/PageIntro";
import { SoundExplorer } from "@/components/SoundExplorer";

export const metadata: Metadata = {
  title: "Sound: discover music from around the world",
  description: "Explore sixteen genres from K-pop and Bollywood to Afrobeats, salsa, jazz and classical. Search artists by country and language, and open official releases on licensed services.",
  alternates: { canonical: "/sound" },
};

export default function SoundPage() {
  return (
    <>
      <PageIntro title="Sound" lede="Music from sixteen genres and twenty countries, for festivals and for every other day.">
        <p className="note mt-5 max-w-2xl">
          FESTIVA does not host or stream music. Listening links open a search on YouTube, Spotify or Apple Music, where official releases and videos can be played. Embedded playback needs those services&rsquo; licensed APIs and is not enabled in this version.
        </p>
      </PageIntro>
      <div className="shell pb-24">
        <Suspense fallback={<p className="note min-h-[80vh]">Loading music…</p>}>
          <SoundExplorer />
        </Suspense>
      </div>
    </>
  );
}
