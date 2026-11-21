import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Block, DetailHero, LinkRows } from "@/components/PageIntro";
import { SaveButton } from "@/components/SaveButton";
import { SourceLink } from "@/components/Sources";
import { countryName } from "@/data/countries";
import { destinationBySlug, destinations, osmUrl } from "@/data/destinations";
import { festivalBySlug } from "@/data/festivals";
import { paletteFor, type SlugProps } from "@/lib/view";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const place = destinationBySlug.get(slug);
  if (!place) return { title: "Destination not found" };
  return { title: `${place.name}, ${countryName(place.country)}`, description: place.summary, alternates: { canonical: `/journeys/${place.slug}` } };
}

export default async function DestinationPage({ params }: SlugProps) {
  const { slug } = await params;
  const place = destinationBySlug.get(slug);
  if (!place) notFound();
  const festivals = place.festivals.map((s) => festivalBySlug.get(s)).filter((f) => f !== undefined);
  const nearby = destinations.filter((d) => d.country === place.country && d.slug !== place.slug);
  return (
    <article>
      <DetailHero
        back={{ href: "/journeys", label: "Journeys" }}
        title={place.name}
        subtitle={countryName(place.country)}
        summary={place.summary}
        seed={place.slug}
        palette={paletteFor(place.slug, place.festivals)}
        art={{ kind: "locator", lat: place.lat, lon: place.lon }}
        transitionName={`art-place-${place.slug}`}
        actions={
          <>
            <a href={osmUrl(place.lat, place.lon)} className="btn btn-plum" target="_blank" rel="noopener noreferrer">
              Open map (OpenStreetMap)
            </a>
            <SaveButton kind="place" id={place.slug} name={place.name} />
          </>
        }
      />
      <div className="shell pb-20">
        <Block title="Festivals here" id="festivals">
          <LinkRows items={festivals.map((f) => ({ href: `/discover/${f.slug}`, title: f.name, text: f.tagline }))} />
        </Block>
        <Block title="Landmarks" id="landmarks">
          <ul className="list-disc pl-5">
            {place.landmarks.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Block>
        <Block title="Local experiences" id="experiences">
          <ul className="list-disc pl-5">
            {place.experiences.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Block>
        <Block title="A cultural day" id="itinerary">
          <ol className="grid gap-2">
            {place.itinerary.map((step, i) => (
              <li key={step} className="grid grid-cols-[1.75rem_1fr]">
                <span className="tabular-nums text-ink">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="note">A suggested order for a festival day. FESTIVA does not list prices, opening hours or bookings; confirm them with official sources.</p>
        </Block>
        <Block title="More in this country" id="more">
          <LinkRows
            items={[
              { href: `/journeys/country/${place.country.toLowerCase()}`, title: `${countryName(place.country)}: festivals, food and dress` },
              ...nearby.map((d) => ({ href: `/journeys/${d.slug}`, title: d.name, text: d.summary })),
            ]}
          />
        </Block>
        <div className="rule border-t pt-6">
          <SourceLink source={place.source} />
          <p className="note mt-2">
            Coordinates {place.lat.toFixed(2)}, {place.lon.toFixed(2)}. <Link className="link" href="/about#data">How FESTIVA handles sources</Link>.
          </p>
        </div>
      </div>
    </article>
  );
}
