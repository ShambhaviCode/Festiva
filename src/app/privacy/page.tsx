import type { Metadata } from "next";
import { Block } from "@/components/PageIntro";

export const metadata: Metadata = { title: "Privacy", description: "What FESTIVA stores, where, and how sharing works.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <article>
      <section className="shell pb-10 pt-14 lg:pt-20">
        <h1 className="display-1">Privacy</h1>
        <p className="lede mt-5 max-w-2xl text-ink">A plain description of what this software does with information. It is not a legal privacy policy; the operator of a public deployment should add one.</p>
      </section>
      <div className="shell pb-24">
        <Block title="On your device" id="device">
          <p>Saved festivals, places, wishlist items, favourite artists, game scores, display preferences and celebration plans are stored in your browser&rsquo;s local storage. They are not sent to FESTIVA. Clearing your browser data removes them.</p>
        </Block>
        <Block title="If you sign in" id="account">
          <p>When accounts are enabled, your email address is held by the authentication provider, and plans you save are stored in rows only you can read or change. This is enforced in the database with Row Level Security, not just in the app.</p>
        </Block>
        <Block title="Sharing" id="sharing">
          <p>Nothing is shared until you press Create share link. A share is a snapshot of one plan stored under a random token; the link contains only that token. Anyone with the link can view the snapshot. Revoking the link makes it stop working.</p>
        </Block>
        <Block title="The assistant and AI" id="ai">
          <p>Questions you ask Intelligence are sent to FESTIVA&rsquo;s server to be answered. If the operator has connected an AI provider, the question and the relevant guide entries are sent to that provider. Questions and answers are not written to FESTIVA&rsquo;s logs or database; only technical metadata such as timing and outcome is logged.</p>
        </Block>
        <Block title="Analytics" id="analytics">
          <p>FESTIVA can count a small set of product events, such as a Matchmaker being started or a plan being shared. An event is a name, an optional festival slug and a page path. There are no cookies, no third-party trackers and no identifiers, and events are not sent at all if your browser sets Do Not Track or Global Privacy Control.</p>
        </Block>
        <Block title="Gift Circle" id="gift-circle">
          <p>A gift circle is stored on FESTIVA&rsquo;s server so everyone in it can see it. It holds the names people chose, their languages, the preferences and wishlist items they approved, contribution commitments, and the Secret Santa draw. Each person sees only what their role allows: nobody, including the organiser, can see who drew whom except the giver.</p>
          <p>Access works through private keys that the server issues once and keeps only as one-way hashes; your browser keeps the key. Invitation tokens travel after the # in the link, which browsers do not send to servers. Participants can delete their preferences or leave; the organiser can delete the whole circle at once.</p>
          <p>FESTIVA records contribution commitments people type in. It does not take, hold, move or verify money.</p>
        </Block>
        <Block title="Voice and translation (Sarvam AI)" id="voice">
          <p>If the operator has connected Sarvam AI, you can speak a preference. Nothing is recorded or sent until you tick the consent box. The recording goes from your browser to FESTIVA&rsquo;s server, then to Sarvam for transcription, and is then discarded: FESTIVA never writes audio to disk or logs. You review and correct the transcript before anything is saved.</p>
          <p>Translations are made only when someone asks for one, and are stored beside the original text, never instead of it. If Sarvam suggests structured details from your words, you check them before saving. Sarvam&rsquo;s own terms apply to what it receives.</p>
        </Block>
        <Block title="Feature flags and the onboarding experiment" id="flags">
          <p>Your browser keeps a random identifier, not linked to your name or anything you type. FESTIVA uses it to decide which features and which version of the circle set-up you see, through Flagsmith. FESTIVA hashes it before it reaches Flagsmith or is counted.</p>
          <p>To compare the two set-up versions, FESTIVA counts steps such as starting set-up, creating a circle, joining and adding a preference, against that hashed identifier. If your browser sends Do Not Track or Global Privacy Control, these steps are not counted.</p>
        </Block>
        <Block title="Operations" id="operations">
          <p>FESTIVA measures its own reliability: request counts, response times, error codes and whether calls to Sarvam succeeded. These measurements contain no names, preferences or recordings. When something goes wrong they may be sent to the operator&rsquo;s monitoring tools, such as Prometheus or NudgeBee.</p>
        </Block>
        <Block title="Voice recordings in detail" id="voice-detail">
          <p>A voice recording is personal data, and it can reveal more than the words in it. FESTIVA asks for consent each time, sends the recording only to its own server and then to Sarvam, keeps it in memory only while the request runs, and never stores or logs it. Only the transcript you approve is saved. If Sarvam is not connected, voice input is switched off and nothing is recorded.</p>
          <p>Each transcript, translation or set of suggested details that FESTIVA saves under Sarvam&rsquo;s name carries a signed record from FESTIVA&rsquo;s server proving it came from Sarvam; FESTIVA also records whether you edited it.</p>
        </Block>
        <Block title="Children" id="children">
          <p>FESTIVA&rsquo;s guide, games and greeting cards can be used without giving any personal information. Gift Circle and accounts are meant for adults: a parent or guardian should set up and join on a child&rsquo;s behalf rather than a child joining directly. When the Matchmaker asks which age groups are coming, it uses the answer only to shape the plan in your browser; it does not ask for names or ages of individuals.</p>
          <p>Indian law requires verifiable consent from a parent or guardian before processing the personal data of anyone under 18. An operator who lets children use Gift Circle directly must put that consent in place first.</p>
        </Block>
        <Block title="Keeping and deleting information" id="retention">
          <p>Information on your device stays until you clear it. A gift circle stays on the server until its organiser deletes it; a participant can delete their own preferences and wishlist items or leave at any time. Operational measurements are kept in memory and in a short rolling log for troubleshooting. Rate-limit counters are kept in memory for a few minutes and contain no names.</p>
        </Block>
        <Block title="Status of this page" id="status">
          <p>This page describes how the software behaves. It is not a legal privacy policy. A draft policy, and a list of questions that need a lawyer, are in the project&rsquo;s documentation (docs/PRIVACY_POLICY_DRAFT.md and docs/LEGAL_REVIEW.md). Anyone running a public deployment is responsible for publishing a reviewed policy with their own contact details.</p>
        </Block>
        <Block title="Greeting cards" id="cards">
          <p>Cards are drawn in your browser. Names and messages typed into Wishes never leave your device unless you share the result yourself.</p>
        </Block>
      </div>
    </article>
  );
}
