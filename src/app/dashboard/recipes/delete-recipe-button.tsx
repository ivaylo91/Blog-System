"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function DeleteSubmitButton() {
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

type DashboardRecipeDeleteButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  recipeId: string;
  recipeTitle: string;
};

export function DashboardRecipeDeleteButton({ action, recipeId, recipeTitle }: DashboardRecipeDeleteButtonProps) {
  function handleDeleteConfirmation(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(`Наистина ли искаш да изтриеш „${recipeTitle}“? Това действие не може да бъде върнато.`);

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleDeleteConfirmation}>
      <input type="hidden" name="recipeId" value={recipeId} />
      <DeleteSubmitButton />
    </form>
  );
}