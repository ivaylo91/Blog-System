"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addRecipeCommentAction, type RecipeCommentActionState } from "@/app/recipes/[slug]/comments-actions";

const initialState: RecipeCommentActionState = {
  status: "idle",
  message: "",
};

type RecipeCommentFormProps = {
  recipeSlug: string;
  commentId?: string;
  action?: (state: RecipeCommentActionState, formData: FormData) => Promise<RecipeCommentActionState>;
  initialBody?: string;
  initialRating?: number;
  submitLabel?: string;
  existingCommentHasText?: boolean;
  onSuccess?: () => void;
};

export function RecipeCommentForm({
  recipeSlug,
  commentId,
  action = addRecipeCommentAction,
  initialBody = "",
  initialRating = 5,
  submitLabel = "Публикувай",
  existingCommentHasText = Boolean(initialBody.trim()),
  onSuccess,
}: RecipeCommentFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const displayedRating = hoveredRating ?? rating;

  useEffect(() => {
    setRating(initialRating);
    setHoveredRating(null);
  }, [initialRating]);

  useEffect(() => {
    if (state.status === "success") {
      if (!commentId) {
        formRef.current?.reset();
        setRating(5);
      }

      onSuccess?.();
    }
  }, [commentId, onSuccess, state.status]);

  const isEditingExistingComment = Boolean(commentId && existingCommentHasText);
  const isAddingCommentToExistingRating = Boolean(commentId && !existingCommentHasText);

  return (
    <form ref={formRef} action={formAction} className="grid gap-5 rounded-[1.75rem] border border-black/8 bg-stone-50/80 p-6">
      <input type="hidden" name="recipeSlug" value={recipeSlug} />
      {commentId ? <input type="hidden" name="commentId" value={commentId} /> : null}
      <input type="hidden" name="rating" value={rating} />

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">{commentId ? "Редакция" : "Остави мнение"}</p>
        <h3 className="mt-2 font-serif text-3xl text-stone-950">
          {isEditingExistingComment ? "Обнови коментара си" : isAddingCommentToExistingRating ? "Добави коментар към оценката си" : "Коментар и оценка"}
        </h3>
        {isEditingExistingComment ? (
          <p className="mt-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Твоят отзив за тази рецепта вече е публикуван. Оттук можеш да обновиш текста и оценката си.
          </p>
        ) : isAddingCommentToExistingRating ? (
          <p className="mt-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Вече си дал оценка. Добави и кратък коментар, ако искаш да споделиш впечатленията си.
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-stone-700">Оценка</span>
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                value <= displayedRating
                  ? "bg-[linear-gradient(135deg,#d97706,#ea580c)] text-amber-50 shadow-[0_10px_24px_rgba(217,119,6,0.2)]"
                  : "border border-black/10 bg-white text-stone-600 hover:border-black/20"
              }`}
            >
              <span>{value}</span>
              <span>★</span>
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-2 text-sm font-medium text-stone-700">
        Коментар
        <textarea
          name="body"
          required
          rows={5}
          defaultValue={initialBody}
          placeholder="Как се получи рецептата при теб, какво промени и би ли я приготвил отново?"
          className="rounded-[1.5rem] border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className={`text-sm ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>
          {state.message || ""}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {pending ? "Запазване..." : submitLabel}
        </button>
      </div>
    </form>
  );
}