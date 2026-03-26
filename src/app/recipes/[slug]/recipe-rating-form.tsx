"use client";

import { Sparkles, Star, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { rateRecipeAction, type RecipeCommentActionState } from "@/app/recipes/[slug]/comments-actions";

const initialState: RecipeCommentActionState = {
  status: "idle",
  message: "",
  currentRating: null,
};

type RecipeRatingFormProps = {
  recipeSlug: string;
  initialRating?: number;
};

function renderStarLabel(value: number, selectedRating: number) {
  return value <= selectedRating ? "text-amber-500" : "text-stone-300";
}

function getRatingDescription(rating: number) {
  const labels: Record<number, string> = {
    1: "Слаба",
    2: "По-скоро слаба",
    3: "Добра",
    4: "Много добра",
    5: "Отлична",
  };

  return labels[rating] ?? "Избери оценка";
}

export function RecipeRatingForm({ recipeSlug, initialRating = 0 }: RecipeRatingFormProps) {
  const [rating, setRating] = useState(initialRating > 0 ? initialRating : 5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(rateRecipeAction, {
    ...initialState,
    currentRating: initialRating > 0 ? initialRating : null,
  });
  const savedRating = state.currentRating !== undefined ? state.currentRating : initialRating > 0 ? initialRating : null;
  const displayedRating = hoveredRating ?? rating;

  return (
    <form action={formAction} className="grid gap-4 rounded-[1.75rem] border border-black/8 bg-stone-50/80 p-6">
      <input type="hidden" name="recipeSlug" value={recipeSlug} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Оцени рецептата</p>
        <h3 className="mt-2 font-serif text-3xl text-stone-950">{savedRating ? "Промени оценката си" : "Дай бърза оценка"}</h3>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Избери от 1 до 5 звезди. Ако искаш, после можеш да добавиш и текстов коментар.
        </p>
        {savedRating ? (
          <p className="mt-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Твоята текуща оценка е {savedRating} / 5.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2" onMouseLeave={() => setHoveredRating(null)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onFocus={() => setHoveredRating(value)}
            onBlur={() => setHoveredRating(null)}
            aria-label={`Оцени с ${value} ${value === 1 ? "звезда" : "звезди"}`}
            aria-pressed={value === rating}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-black/20 hover:bg-stone-100"
          >
            <span>{value}</span>
            <Star aria-hidden="true" className={`h-4 w-4 ${renderStarLabel(value, displayedRating)}`} fill="currentColor" strokeWidth={1.8} />
          </button>
        ))}
      </div>

      <p className="text-sm font-medium text-stone-700">
        Избрано: <span className="text-stone-950">{displayedRating} / 5</span> · {getRatingDescription(displayedRating)}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {state.message || ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {savedRating ? (
            <button
              type="submit"
              name="intent"
              value="clear"
              onClick={() => {
                setRating(5);
                setHoveredRating(null);
              }}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-red-100 disabled:bg-red-50/70 disabled:text-red-400"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              {pending ? "Премахване..." : "Премахни оценката"}
            </button>
          ) : null}
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            {pending ? "Запазване..." : savedRating ? "Обнови оценката" : "Запази оценката"}
          </button>
        </div>
      </div>
    </form>
  );
}