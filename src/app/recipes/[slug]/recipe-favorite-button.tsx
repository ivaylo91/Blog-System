"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useActionState } from "react";
import { toggleRecipeFavoriteAction, type RecipeFavoriteActionState } from "@/app/recipes/[slug]/favorite-actions";

type RecipeFavoriteButtonProps = {
  recipeSlug: string;
  isAuthenticated: boolean;
  featureEnabled: boolean;
  initialIsFavorite: boolean;
  initialFavoriteCount: number;
};

function getFavoriteCountLabel(count: number) {
  if (count === 1) {
    return "1 запазване";
  }

  return `${count} запазвания`;
}

export function RecipeFavoriteButton({
  recipeSlug,
  isAuthenticated,
  featureEnabled,
  initialIsFavorite,
  initialFavoriteCount,
}: RecipeFavoriteButtonProps) {
  const [state, formAction, pending] = useActionState(toggleRecipeFavoriteAction, {
    status: "idle",
    message: "",
    isFavorite: initialIsFavorite,
    favoriteCount: initialFavoriteCount,
  } satisfies RecipeFavoriteActionState);

  if (!featureEnabled) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="grid gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50/90 px-5 py-5 text-sm leading-7 text-amber-900 shadow-[0_12px_32px_rgba(217,119,6,0.08)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
          <Heart aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          Любими рецепти
        </div>
        <p>Влез в профила си, за да запазиш тази рецепта и да я намериш по-късно в таблото.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/signin?callbackUrl=${encodeURIComponent(`/recipes/${recipeSlug}`)}`}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
          >
            <Heart aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Вход за запазване
          </Link>
          <span className="rounded-full border border-amber-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
            {getFavoriteCountLabel(initialFavoriteCount)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-3 rounded-[1.5rem] border border-rose-200/70 bg-rose-50/70 px-5 py-5 shadow-[0_14px_40px_rgba(190,24,93,0.08)]">
      <input type="hidden" name="recipeSlug" value={recipeSlug} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Любими рецепти</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">
            {state.isFavorite ? "Рецептата е запазена в профила ти." : "Запази рецептата, за да я намериш по-късно."}
          </p>
        </div>
        <span className="rounded-full border border-rose-200/80 bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          {getFavoriteCountLabel(state.favoriteCount)}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {state.message || ""}
        </p>
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 ${
            state.isFavorite
              ? "bg-[linear-gradient(135deg,#be123c,#e11d48)] text-rose-50 shadow-[0_12px_28px_rgba(190,24,93,0.24)] hover:bg-[linear-gradient(135deg,#9f1239,#be123c)]"
              : "border border-rose-300/70 bg-white text-rose-700 hover:border-rose-400 hover:bg-rose-100"
          }`}
        >
          <Heart aria-hidden="true" className={`h-4 w-4 ${state.isFavorite ? "fill-current" : ""}`} strokeWidth={2} />
          {pending ? "Запазване..." : state.isFavorite ? "Премахни от любими" : "Запази в любими"}
        </button>
      </div>
    </form>
  );
}