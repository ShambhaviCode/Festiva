import type { Metadata } from "next";
import { CatalogExplorer, type CatalogItem, type Facet } from "@/components/CatalogExplorer";
import { PageIntro } from "@/components/PageIntro";
import { countries, countryName } from "@/data/countries";
import { festivalBySlug } from "@/data/festivals";
import { foods } from "@/data/foods";
import { paletteFor } from "@/lib/view";

export const metadata: Metadata = {
  title: "Taste: festival food and traditional dishes",
  description: "Festival dishes and sweets from around the world, with ingredients, cultural background and dietary notes.",
  alternates: { canonical: "/taste" },
};

const TYPE = { sweet: "Sweet", main: "Main dish", snack: "Snack", drink: "Drink" } as const;

function dietTags(food: (typeof foods)[number]): string[] {
  const tags: string[] = [];
  if (food.vegetarian) tags.push("vegetarian");
  if (food.vegan) tags.push("vegan");
  if (!food.contains.includes("gluten")) tags.push("no-gluten");
  if (!food.contains.includes("nuts")) tags.push("no-nuts");
  if (!food.contains.includes("dairy")) tags.push("no-dairy");
  return tags;
}

const items: CatalogItem[] = foods.map((f) => ({
  id: f.slug,
  href: `/taste/${f.slug}`,
  title: f.name,
  kicker: `${TYPE[f.type]} from ${countryName(f.country)}`,
  summary: f.background,
  seed: f.slug,
  palette: paletteFor(f.slug, f.festivals),
  keywords: [...f.ingredients, ...f.festivals.map((s) => festivalBySlug.get(s)?.name ?? "")].join(" "),
  facets: { type: [f.type], country: [f.country], diet: dietTags(f), festival: f.festivals },
  art: { kind: "plate", course: f.type, hint: `${f.name} ${f.background}` },
  transitionName: `art-dish-${f.slug}`,
}));

const used = new Set(foods.map((f) => f.country));
const facets: Facet[] = [
  { key: "type", label: "Course", options: Object.entries(TYPE).map(([value, label]) => ({ value, label })) },
  {
    key: "diet",
    label: "Dietary preference",
    options: [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "no-gluten", label: "Typically without gluten" },
      { value: "no-nuts", label: "Typically without nuts" },
      { value: "no-dairy", label: "Typically without dairy" },
    ],
  },
  { key: "country", label: "Country", options: countries.filter((c) => used.has(c.code)).map((c) => ({ value: c.code, label: c.name })).sort((a, b) => a.label.localeCompare(b.label)) },
  { key: "festival", label: "Festival", options: [...new Set(foods.flatMap((f) => f.festivals))].map((s) => ({ value: s, label: festivalBySlug.get(s)?.name ?? s })).sort((a, b) => a.label.localeCompare(b.label)) },
];

export default function TastePage() {
  return (
    <>
      <PageIntro title="Taste" lede="The dishes that make a festival taste like itself. Dietary notes describe the typical recipe only; households differ, so always confirm ingredients with the cook, especially for allergies." />
      <section className="shell pb-20" aria-label="Dishes">
        <CatalogExplorer items={items} facets={facets} searchLabel="Search dishes and ingredients" placeholder="Try “saffron”, “dumpling” or “Mexico”" noun={["dish", "dishes"]} />
      </section>
    </>
  );
}
