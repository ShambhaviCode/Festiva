import type { Metadata } from "next";
import { WorldMap } from "@/components/WorldMap";
import { festivals } from "@/data/festivals";
import { countries } from "@/data/countries";
import { indiaDivisions } from "@/data/geo-india";
import { mapCountries, mapFestivals, mapIndia } from "@/lib/map-data";

export const metadata: Metadata = {
  title: "World: explore festivals on the map",
  description: "An interactive world map of the festivals in FESTIVA's guide. Open any country, and explore India down to its 28 states and 8 union territories.",
  alternates: { canonical: "/world" },
};

export default function WorldPage() {
  return (
    <div className="shell pb-20 pt-8 lg:pt-12">
      <header className="mb-6 max-w-3xl">
        <p className="eyebrow">World · {countries.length} countries · {festivals.length} festivals</p>
        <h1 className="display-1 mt-2">
          Where is the world <span className="mark">celebrating?</span>
        </h1>
        <p className="lede mt-3 text-ink">
          Zoom, drag and click any country. Colour shows how many festivals the guide holds there. India opens into its {indiaDivisions.filter((d) => d.kind === "state").length} states and {indiaDivisions.filter((d) => d.kind === "union-territory").length} union territories.
        </p>
      </header>
      <WorldMap festivals={mapFestivals()} countries={mapCountries()} india={mapIndia()} />
    </div>
  );
}
