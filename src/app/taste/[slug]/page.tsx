import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, DetailHero, LinkRows } from "@/components/PageIntro";
import { SourceLink } from "@/components/Sources";
import { countryName } from "@/data/countries";
import { festivalBySlug } from "@/data/festivals";
import { ALLERGEN_LABELS, foodBySlug, foods } from "@/data/foods";
import { paletteFor, type SlugProps } from "@/lib/view";

export function generateStaticParams() {
  return foods.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: SlugProps): Promise<Metadata> {
  const { slug } = await params;
  const food = foodBySlug.get(slug);
  if (!food) return { title: "Dish not found" };
  return { title: `${food.name}: festival food from ${countryName(food.country)}`, description: food.background, alternates: { canonical: `/taste/${food.slug}` } };
}

export default async function FoodPage({ params }: SlugProps) {
  const { slug } = await params;
  const food = foodBySlug.get(slug);
  if (!food) notFound();
  const festivals = food.festivals.map((s) => festivalBySlug.get(s)).filter((f) => f !== undefined);
  const diet = food.vegan ? "Vegan in its typical recipe" : food.vegetarian ? "Vegetarian in its typical recipe" : "Not vegetarian in its typical recipe";
  const recipeQuery = encodeURIComponent(`${food.name} traditional recipe`);
  return (
    <article>
      <DetailHero
        back={{ href: "/taste", label: "Taste" }}
        title={food.name}
        subtitle={`From ${countryName(food.country)}`}
        summary={food.background}
        seed={food.slug}
        palette={paletteFor(food.slug, food.festivals)}
        art={{ kind: "plate", course: food.type, hint: `${food.name} ${food.background}` }}
        transitionName={`art-dish-${food.slug}`}
      />
      <div className="shell pb-20">
        <Block title="Typical ingredients" id="ingredients">
          <ul className="list-disc pl-5">
            {food.ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </Block>
        <Block title="Dietary notes" id="diet">
          <p>{diet}.</p>
          <p>{food.contains.length > 0 ? `Usually contains: ${food.contains.map((c) => ALLERGEN_LABELS[c]).join(", ")}.` : "No common allergens are flagged for the typical recipe."}</p>
          <p className="note">These notes are a guide to the usual preparation and are not allergy advice. Recipes vary by household, region and manufacturer.</p>
        </Block>
        <Block title="Served at" id="festivals">
          <LinkRows items={festivals.map((f) => ({ href: `/discover/${f.slug}`, title: f.name, text: f.tagline }))} />
        </Block>
        <Block title="Cook it" id="recipes">
          <p>
            FESTIVA does not publish recipes it has not tested. For a method, look for a recipe from a cook who grew up with the dish, or from an established food publication.
          </p>
          <p>
            <a className="link link-accent" href={`https://duckduckgo.com/?q=${recipeQuery}`} target="_blank" rel="noopener noreferrer">
              Search the web for {food.name} recipes
            </a>
          </p>
        </Block>
        <div className="rule border-t pt-6">
          <SourceLink source={food.source} />
        </div>
      </div>
    </article>
  );
}
