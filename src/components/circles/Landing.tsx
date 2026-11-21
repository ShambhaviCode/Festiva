"use client";

import Link from "next/link";
import { heldCircles } from "@/lib/client/circles";
import { useStore } from "@/lib/store";
import { useMounted } from "@/lib/hooks";
import { CircleRing } from "./ui";
import { GiftCircleGate } from "./Gate";

const STEPS = [
  {
    title: "Create",
    text: "Choose the festival or occasion, the date, a total budget and how many people can join.",
  },
  {
    title: "Invite",
    text: "Share one private link. You can replace or revoke it at any time.",
  },
  {
    title: "Share preferences",
    text: "Everyone types or speaks what they would love, in their own language. Speech and translation cover 22 Indian languages and English through Sarvam, on servers where Sarvam is connected; typing always works.",
  },
  {
    title: "Organise",
    text: "Wishlists, gift ideas from FESTIVA's guide, a Secret Santa draw nobody can peek at, and who has committed what.",
  },
  {
    title: "Celebrate",
    text: "A summary of the circle and a celebration plan for the day.",
  },
];

function MyCircles() {
  const mounted = useMounted();
  const [circles] = useStore(heldCircles);
  if (!mounted || circles.length === 0) return null;
  return (
    <section className="rule border-t py-10" aria-labelledby="my-circles">
      <h2 id="my-circles" className="display-3">
        Circles on this device
      </h2>
      <ul className="mt-5" data-testid="my-circles">
        {circles.map((c) => (
          <li
            key={`${c.circleId}:${c.participantId}`}
            className="rule border-t first:border-t-0"
          >
            <Link
              href={
                c.role === "organiser"
                  ? `/circles/${c.circleId}`
                  : `/circles/${c.circleId}/me`
              }
              className="group flex flex-wrap items-baseline justify-between gap-2 py-3"
            >
              <span className="font-semibold group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
                {c.name}
              </span>
              <span className="note">
                {c.role === "organiser"
                  ? "You organise this circle"
                  : "You joined this circle"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CirclesLanding() {
  return (
    <div className="shell pb-24">
      <GiftCircleGate>
        {() => (
          <>
            <section className="grid items-center gap-10 pb-12 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
              <div>
                <h1 className="display-1">Gift Circle</h1>
                <p className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-[1.9rem] leading-tight">
                  Bring everyone together. Understand every preference.
                  Celebrate without the chaos.
                </p>
                <p className="lede mt-5 max-w-xl text-ink">
                  A shared space for a family or group gift exchange, made for
                  festivals where everyone speaks a different language at the
                  same table.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link href="/circles/new" className="btn btn-saffron">
                    Start a gift circle
                  </Link>
                  <a href="#how" className="link">
                    How it works
                  </a>
                </div>
              </div>
              <div className="mx-auto" aria-hidden="true">
                <CircleRing
                  names={[]}
                  total={8}
                  centre="Your circle"
                  size={300}
                />
              </div>
            </section>

            <MyCircles />

            <section
              id="how"
              className="rule border-t py-10"
              aria-labelledby="how-title"
            >
              <h2 id="how-title" className="display-3">
                How it works
              </h2>
              <ol className="mt-6 grid gap-x-10 gap-y-7 md:grid-cols-2 lg:grid-cols-5">
                {STEPS.map((step, i) => (
                  <li key={step.title}>
                    <span className="font-[family-name:var(--font-display)] text-4xl text-saffron-deep">
                      {i + 1}
                    </span>
                    <p className="mt-1 font-semibold">{step.title}</p>
                    <p className="note mt-1">{step.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section
              className="rule border-t py-10"
              aria-labelledby="privacy-title"
            >
              <h2 id="privacy-title" className="display-3">
                What happens to what you share
              </h2>
              <ul className="prose-festiva mt-5 list-disc pl-5">
                <li>
                  Recordings go to Sarvam for transcription only after you
                  agree, and are discarded straight away. FESTIVA never stores
                  audio.
                </li>
                <li>
                  What you said is kept in your words. A translation is stored
                  beside it and never replaces it.
                </li>
                <li>
                  You can delete your preferences, leave a circle, or (as
                  organiser) delete the whole circle.
                </li>
                <li>
                  FESTIVA records contribution commitments. It does not take,
                  hold or check payments.
                </li>
                <li>
                  Access works through private keys kept in your browser, so
                  there is no account to create.
                </li>
              </ul>
            </section>
          </>
        )}
      </GiftCircleGate>
    </div>
  );
}
