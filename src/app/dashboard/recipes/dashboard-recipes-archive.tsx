"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteRecipeAction } from "@/app/dashboard/recipes/actions";
import { DashboardRecipeDeleteButton } from "@/app/dashboard/recipes/delete-recipe-button";

type ArchiveRecipe = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  source: "database" | "sample";
  published: boolean;
  updatedAt: string;
  authorId?: string;
};

type DashboardRecipesArchiveProps = {
  recipes: ArchiveRecipe[];
  currentUserId?: string;
  currentUserRole?: string;
};

const RECIPES_PER_PAGE = 4;

export function DashboardRecipesArchive({ recipes, currentUserId, currentUserRole }: DashboardRecipesArchiveProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(recipes.length / RECIPES_PER_PAGE));
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const visibleRecipes = recipes.slice(startIndex, startIndex + RECIPES_PER_PAGE);
  const rangeStart = recipes.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + RECIPES_PER_PAGE, recipes.length);

  return (
    <>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {visibleRecipes.map((recipe) => {
          const canManageRecipe = recipe.source === "database" && recipe.id && (currentUserRole === "ADMIN" || recipe.authorId === currentUserId);

          return (
            <div
              key={recipe.slug}
              className="flex h-full flex-col rounded-[1.5rem] border border-black/8 bg-white/95 px-4 py-4 shadow-[0_10px_28px_rgba(56,44,24,0.04)] transition duration-200 ease-out hover:border-black/10 hover:shadow-[0_14px_34px_rgba(56,44,24,0.07)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                    <span className="rounded-full border border-black/8 bg-stone-50 px-2.5 py-1 text-stone-700">{recipe.category}</span>
                    <span className="rounded-full border border-black/8 bg-stone-50 px-2.5 py-1 text-stone-700">{recipe.source === "database" ? "база данни" : "примерни"}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl leading-tight text-stone-950">{recipe.title}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 ${recipe.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>
                  {recipe.published ? "публикувана" : "чернова"}
                </span>
              </div>

              <div className="mt-4 flex flex-1 flex-wrap items-end justify-between gap-3 border-t border-black/6 pt-4">
                <p className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Обновена {recipe.updatedAt}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {canManageRecipe ? (
                    <>
                      <Link
                        href={`/dashboard/recipes/${recipe.slug}`}
                        className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
                      >
                        Редактирай
                      </Link>
                      {recipe.id ? <DashboardRecipeDeleteButton action={deleteRecipeAction} recipeId={recipe.id} recipeTitle={recipe.title} /> : null}
                    </>
                  ) : (
                    <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                      {recipe.source === "database" ? "Без права за промяна" : "Само преглед"}
                    </span>
                  )}
                  {recipe.published ? (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="inline-flex rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(217,119,6,0.18)] transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
                    >
                      Виж
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600">
                      Скрито от сайта
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-black/6 pt-5 text-sm text-stone-700 lg:flex-row lg:items-center lg:justify-between">
          <p>
            Показани {rangeStart}-{rangeEnd} от {recipes.length} рецепти
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex rounded-full border border-stone-900 bg-stone-950 px-4 py-2 font-semibold text-stone-50 transition hover:border-stone-950 hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
            >
              Назад
            </button>
            <span className="rounded-full border border-black/8 bg-stone-50 px-4 py-2 font-semibold text-stone-700">
              Страница {currentPage} от {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex rounded-full border border-stone-900 bg-stone-950 px-4 py-2 font-semibold text-stone-50 transition hover:border-stone-950 hover:bg-stone-800 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
            >
              Напред
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
