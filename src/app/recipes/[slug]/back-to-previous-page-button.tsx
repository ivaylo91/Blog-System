"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";

export function BackToPreviousPageButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/recipes");
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-[0_8px_18px_rgba(56,44,24,0.06)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-black/20 hover:bg-stone-50"
    >
      <FaArrowLeftLong aria-hidden="true" className="h-4 w-4" />
      Назад
    </button>
  );
}