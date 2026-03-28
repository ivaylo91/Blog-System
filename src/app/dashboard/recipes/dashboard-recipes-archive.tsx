"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";
import { deleteRecipeAction } from "@/app/dashboard/recipes/actions";
import { DashboardRecipeDeleteButton } from "@/app/dashboard/recipes/delete-recipe-button";

type ArchiveRecipe = {
  id?: string | null;
  slug: string;
  title: string;
  category: string;
  source: "database" | "sample";
  published: boolean;
  updatedAt: string;
  authorId?: string | null;
};

type DashboardRecipesArchiveProps = {
  recipes: ArchiveRecipe[];
  currentUserId?: string;
  currentUserRole?: string;
};

const RECIPES_PER_PAGE = 4;

export function DashboardRecipesArchive({ recipes, currentUserId, currentUserRole }: DashboardRecipesArchiveProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modal, setModal] = useState<{ open: boolean; recipeId?: string; recipeTitle?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(recipes.length / RECIPES_PER_PAGE));
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const visibleRecipes = recipes.slice(startIndex, startIndex + RECIPES_PER_PAGE);
  const rangeStart = recipes.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + RECIPES_PER_PAGE, recipes.length);

  function handleDelete(recipeId: string, recipeTitle: string) {
    setModal({ open: true, recipeId, recipeTitle });
  }

  async function confirmDelete(recipeId: string, recipeTitle: string) {
    setDeletingId(recipeId);
    setModal(null);
    try {
      const formData = new FormData();
      formData.append("recipeId", recipeId);
      await deleteRecipeAction(formData);
      setFeedback({ type: "success", message: `Рецептата „${recipeTitle}“ беше изтрита успешно.` });
    } catch (e) {
      setFeedback({ type: "error", message: `Възникна грешка при изтриване на „${recipeTitle}“.` });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {feedback && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-semibold ${feedback.type === "success" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
          {feedback.message}
          <button className="ml-4 text-xs underline" onClick={() => setFeedback(null)}>Затвори</button>
        </div>
      )}
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
                    <span className="rounded-full bg-stone-50 px-2.5 py-1 text-stone-700">{recipe.source === "database" ? "" : "примерни"}</span>
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
                        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
                      >
                        <FaEdit className="h-4 w-4" /> Редактирай
                      </Link>
                      {recipe.id ? (
                        <button
                          type="button"
                          className={`inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-red-100 disabled:bg-red-50/70 disabled:text-red-400 ${deletingId === recipe.id ? "opacity-60 pointer-events-none" : ""}`}
                          onClick={() => handleDelete(recipe.id!, recipe.title)}
                          disabled={!!deletingId}
                        >
                          <FaTrash className="h-4 w-4" /> {deletingId === recipe.id ? "Изтриване..." : "Изтрий"}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    recipe.source === "database" ? null : (
                      <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                        Само преглед
                      </span>
                    )
                  )}
                  {recipe.published ? (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
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
      {modal?.open && (
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="rounded-2xl bg-white p-8 shadow-xl max-w-sm w-full">
              <h2 className="font-serif text-lg mb-4 text-stone-900">Потвърди изтриване</h2>
              <p className="mb-6 text-stone-700">Наистина ли искаш да изтриеш „{modal.recipeTitle}“? Това действие не може да бъде върнато.</p>
              <div className="flex gap-3 justify-end">
                <button
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-stone-400 hover:bg-stone-100"
                  onClick={() => setModal(null)}
                  type="button"
                >
                  Отказ
                </button>
                <button
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:border-red-300 hover:bg-red-100"
                  onClick={() => confirmDelete(modal.recipeId!, modal.recipeTitle!)}
                  type="button"
                  disabled={!!deletingId}
                >
                  Изтрий
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}

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
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
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
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-stone-500"
            >
              Напред
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
