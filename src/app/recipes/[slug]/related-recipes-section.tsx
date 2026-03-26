"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RecipeImage } from "@/components/recipe-image";
import type { AppRecipe } from "@/lib/recipe-repository";

type RelatedRecipesSectionProps = {
  relatedRecipes: AppRecipe[];
  category: string;
};

const INITIAL_VISIBLE_COUNT = 3;

export function RelatedRecipesSection({ relatedRecipes, category }: RelatedRecipesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMoreRecipes = relatedRecipes.length > INITIAL_VISIBLE_COUNT;
  const visibleRecipes = useMemo(
    () => (isExpanded ? relatedRecipes : relatedRecipes.slice(0, INITIAL_VISIBLE_COUNT)),
    [isExpanded, relatedRecipes],
  );
  const categoryLink = `/recipes?category=${encodeURIComponent(category)}`;

  if (relatedRecipes.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-6 rounded-[2rem] border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,245,230,0.92)_0%,rgba(255,238,214,0.82)_100%)] px-6 py-6 shadow-[0_18px_50px_rgba(120,53,15,0.08)] sm:px-8 sm:py-8 xl:px-10 xl:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Още идеи</p>
          <h2 className="mt-2 font-serif text-3xl text-stone-950">Още рецепти от тази категория</h2>
        </div>
        <Link
          href={categoryLink}
          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition duration-200 ease-out hover:border-black/20 hover:bg-stone-50"
        >
          Виж всички в {category}
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
        {visibleRecipes.map((relatedRecipe) => (
          <article
            key={relatedRecipe.slug}
            className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_60px_rgba(56,44,24,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(56,44,24,0.10)]"
          >
            <div className="relative h-44 overflow-hidden">
              <RecipeImage src={relatedRecipe.imagePath} alt={relatedRecipe.title} sizes="(max-width: 768px) 100vw, 50vw" />
              <div
                className="absolute inset-0 opacity-30 transition duration-200 ease-out group-hover:opacity-40"
                style={{
                  background: `linear-gradient(135deg, ${relatedRecipe.heroPalette.from}, ${relatedRecipe.heroPalette.via}, ${relatedRecipe.heroPalette.to})`,
                }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-5 p-7 sm:p-8">
              <h3 className="font-serif text-2xl text-stone-950">{relatedRecipe.title}</h3>
              <p className="flex-1 text-sm leading-7 text-stone-700">{relatedRecipe.excerpt}</p>
              <Link
                href={`/recipes/${relatedRecipe.slug}`}
                className="mt-auto inline-flex w-fit items-center justify-center self-start rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-7 py-4 font-serif text-sm font-semibold tracking-[0.08em] text-white transition duration-200 ease-out hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
              >
                Виж рецептата
              </Link>
            </div>
          </article>
        ))}
      </div>

      {hasMoreRecipes ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded((currentValue) => !currentValue)}
            className="inline-flex items-center justify-center rounded-full border border-amber-300/70 bg-[linear-gradient(135deg,#fff4e6,#ffe1bd)] px-6 py-3.5 text-sm font-semibold text-amber-950 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-amber-400 hover:bg-[linear-gradient(135deg,#ffeacc,#ffd4a1)] hover:shadow-[0_14px_30px_rgba(217,119,6,0.18)]"
          >
            {isExpanded ? "Покажи по-малко" : `Покажи още ${relatedRecipes.length - INITIAL_VISIBLE_COUNT} идеи`}
          </button>
        </div>
      ) : null}
    </section>
  );
}