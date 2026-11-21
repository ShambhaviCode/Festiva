import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Chat } from "@/components/Chat";
import { PageIntro } from "@/components/PageIntro";
import { aiStatus } from "@/lib/env.server";

export const metadata: Metadata = {
  title: "Intelligence: FESTIVA's cultural assistant",
  description: "Ask about festivals, traditions, history, food, dress, destinations, gifts, music and celebration planning. Answers are grounded in FESTIVA's curated guide and separate facts from suggestions.",
  alternates: { canonical: "/intelligence" },
};

async function ChatWithConfig() {
  await connection();
  return <Chat aiEnabled={aiStatus().configured} />;
}

export default function IntelligencePage() {
  return (
    <>
      <PageIntro title="FESTIVA Intelligence" lede="A cultural assistant that answers from FESTIVA's own guide, shows which entries it used, and says plainly when it does not know." />
      {/* The loaded assistant keeps the placeholder's height, so the footer does not jump up into view. */}
      <div className="shell min-h-[80vh] pb-24">
        <Suspense fallback={<p className="note">Loading the assistant…</p>}>
          <ChatWithConfig />
        </Suspense>
      </div>
    </>
  );
}
