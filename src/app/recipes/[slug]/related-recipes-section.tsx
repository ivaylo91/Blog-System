"use client";

import Link from "next/link";
import { useState } from "react";
import { RecipeImage } from "@/components/recipe-image";
import type { AppRecipe } from "@/lib/recipe-repository";

type RelatedRecipesSectionProps = {
  relatedRecipes: AppRecipe[];
  category: string;
};

const RECIPES_PER_PAGE = 3;

export function RelatedRecipesSection({ relatedRecipes, category }: RelatedRecipesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(relatedRecipes.length / RECIPES_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const visibleRecipes = relatedRecipes.slice(pageStartIndex, pageStartIndex + RECIPES_PER_PAGE);
  const visibleStart = relatedRecipes.length === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(pageStartIndex + RECIPES_PER_PAGE, relatedRecipes.length);
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
                className="mt-auto inline-flex w-fit items-center justify-center self-start whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-7 py-4 font-serif text-sm font-semibold tracking-[0.08em] text-center text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition duration-200 ease-out hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
              >
                Виж рецептата
              </Link>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-4 border-t border-amber-300/40 pt-5 text-sm text-stone-700 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Показани {visibleStart}-{visibleEnd} от {relatedRecipes.length} идеи
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-full border border-amber-950 bg-amber-950 px-5 py-3 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(120,53,15,0.2)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-amber-900 hover:bg-amber-800 hover:shadow-[0_14px_30px_rgba(120,53,15,0.24)] disabled:cursor-not-allowed disabled:border-amber-200 disabled:bg-amber-100 disabled:text-amber-400 disabled:shadow-none disabled:hover:translate-y-0"
            >
              Назад
            </button>
            <span className="rounded-full border border-amber-300/60 bg-white/80 px-4 py-2 font-semibold text-stone-700">
              Страница {currentPage} от {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded-full border border-amber-950 bg-amber-950 px-5 py-3 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(120,53,15,0.2)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-amber-900 hover:bg-amber-800 hover:shadow-[0_14px_30px_rgba(120,53,15,0.24)] disabled:cursor-not-allowed disabled:border-amber-200 disabled:bg-amber-100 disabled:text-amber-400 disabled:shadow-none disabled:hover:translate-y-0"
            >
              Напред
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}