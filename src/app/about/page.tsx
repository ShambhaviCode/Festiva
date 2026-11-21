import type { Metadata } from "next";
import Link from "next/link";
import { Block } from "@/components/PageIntro";
import { DATES_CHECKED, festivals } from "@/data/festivals";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About FESTIVA",
  description: "What FESTIVA is, who founded it, how its data is sourced and what it does not yet do.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article>
      <section className="shell pb-10 pt-14 lg:pt-20">
        <h1 className="display-1 max-w-4xl">{site.tagline}</h1>
        <p className="mt-4 font-[family-name:var(--font-display)] text-2xl italic text-ink">{site.supporting}</p>
        <p className="lede mt-8 max-w-2xl">
          FESTIVA is a place to discover the world&rsquo;s celebrations and the food, dress, music and places around them, and then to plan a celebration of your own with the Matchmaker.
        </p>
      </section>
      <div className="shell pb-24">
        <Block title="Founder" id="founder">
          <p>
            FESTIVA is founded by {site.founder.name}, {site.founder.role}.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {site.founder.links.map((link) => (
              <li key={link.url}>
                <a href={link.url} className="link link-accent" target="_blank" rel="me noopener">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Block>
        <Block title="The journey" id="journey">
          <p>Discover a festival. Learn its story. Explore its places, food and dress. Plan your own celebration. Personalise it. Celebrate. Share it.</p>
          <p>
            <Link href="/discover" className="link link-accent">
              Start with Discover
            </Link>{" "}
            or go straight to the{" "}
            <Link href="/matchmaker" className="link link-accent">
              Matchmaker
            </Link>
            .
          </p>
        </Block>
        <Block title="How the data is sourced" id="data">
          <p>
            The guide currently holds {festivals.length} festivals, with related dishes, attire, destinations, brands and artists. It is curated by hand and deliberately small rather than scraped.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Dates.</strong> Fixed and rule-based dates are calculated. Lunar and regionally observed dates come from published calendars, each stored with its source, a status (checked, projected or not yet checked) and the date it was last checked, most recently {DATES_CHECKED}. FESTIVA never extrapolates a lunar date it has not checked.
            </li>
            <li>
              <strong>Descriptions.</strong> Festival, food, attire and destination text is written from general reference knowledge and links a reference for further reading. These links are pointers, not audited citations, and are labelled that way.
            </li>
            <li>
              <strong>Shop.</strong> Brands are catalogue examples with links to their own sites. There are no partnerships, prices, ratings or stock data.
            </li>
            <li>
              <strong>Music.</strong> FESTIVA links out to licensed services and hosts no audio.
            </li>
          </ul>
        </Block>
        <Block title="Respect" id="respect">
          <p>
            Cultures are not costumes, and no festival is celebrated the same way everywhere. Pages note regional variation, mark sacred or solemn observances as such, and include guidance on taking part respectfully. If something here is wrong or incomplete, that is a fault in the guide and should be corrected.
          </p>
        </Block>
        <Block title="What FESTIVA does not do yet" id="limits">
          <ul className="list-disc space-y-2 pl-5">
            <li>There is no native mobile app. The site is responsive and its core logic is written to be reused in one.</li>
            <li>The interface is in English. Dates, numbers and currencies follow your chosen format.</li>
            <li>There is no live product, price, travel or ticket data.</li>
            <li>Accounts, cloud storage and AI writing only work when the site owner has connected those services. Without them, FESTIVA says so and uses on-device storage and its built-in rules.</li>
          </ul>
        </Block>
        <Block title="Privacy" id="privacy">
          <p>
            Saved items and plans stay in your browser unless you sign in. Sharing is always something you choose, and share links can be revoked.{" "}
            <Link href="/privacy" className="link link-accent">
              Read the privacy notes
            </Link>
            .
          </p>
        </Block>
      </div>
    </article>
  );
}
