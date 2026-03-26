"use client";

import { PencilLine, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteRecipeCommentAction, updateRecipeCommentAction } from "@/app/recipes/[slug]/comments-actions";
import { RecipeCommentForm } from "@/app/recipes/[slug]/recipe-comment-form";

type RecipeCommentCardProps = {
  comment: {
    id: string;
    body: string;
    rating: number | null;
    createdAtLabel: string;
    authorName: string;
  };
  recipeSlug: string;
  canManage: boolean;
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < rating ? "text-amber-500" : "text-stone-300"}>
      ★
    </span>
  ));
}

function DeleteCommentButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:border-red-100 disabled:bg-red-50/70 disabled:text-red-400"
    >
      <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
      {pending ? "Изтриване..." : "Изтрий"}
    </button>
  );
}

export function RecipeCommentCard({ comment, recipeSlug, canManage }: RecipeCommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  function handleDeleteSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm("Наистина ли искаш да изтриеш този коментар?");

    if (!confirmed) {
      event.preventDefault();
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-[1.5rem] bg-stone-50 px-5 py-5">
        <RecipeCommentForm
          recipeSlug={recipeSlug}
          commentId={comment.id}
          action={updateRecipeCommentAction}
          initialBody={comment.body}
          initialRating={comment.rating ?? 5}
          submitLabel="Запази промените"
          onSuccess={() => setIsEditing(false)}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-black/20 hover:bg-stone-100"
          >
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Отказ
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-[1.5rem] bg-stone-50 px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-950">{comment.authorName}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{comment.createdAtLabel}</p>
        </div>
        <div className="flex items-center gap-1 text-lg">{renderStars(comment.rating ?? 0)}</div>
      </div>

      <p className="mt-4 text-sm leading-7 text-stone-700">{comment.body}</p>

      {canManage ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-black/20 hover:bg-stone-100"
          >
            <PencilLine aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Редактирай
          </button>
          <form action={deleteRecipeCommentAction} onSubmit={handleDeleteSubmit}>
            <input type="hidden" name="commentId" value={comment.id} />
            <DeleteCommentButton />
          </form>
        </div>
      ) : null}
    </article>
  );
}