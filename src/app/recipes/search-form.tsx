"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RecipesSearchFormProps = {
  initialQuery: string;
  initialCategory: string;
  initialDifficulty: string;
  initialSort: string;
  categoryOptions: string[];
  difficultyOptions: string[];
};

export function RecipesSearchForm({
  initialQuery,
  initialCategory,
  initialDifficulty,
  initialSort,
  categoryOptions,
  difficultyOptions,
}: RecipesSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [sort, setSort] = useState(initialSort);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextQuery = query.trim();
      const nextCategory = category.trim();
      const nextDifficulty = difficulty.trim();
      const nextSort = sort.trim();
      const currentQuery = searchParams.get("q")?.trim() ?? "";
      const currentCategory = searchParams.get("category")?.trim() ?? "";
      const currentDifficulty = searchParams.get("difficulty")?.trim() ?? "";
      const currentSort = searchParams.get("sort")?.trim() ?? "";

      if (nextQuery === currentQuery && nextCategory === currentCategory && nextDifficulty === currentDifficulty && nextSort === currentSort) {
        return;
      }

      const nextSearchParams = new URLSearchParams(searchParams.toString());

      if (nextQuery) {
        nextSearchParams.set("q", nextQuery);
      } else {
        nextSearchParams.delete("q");
      }

      if (nextCategory) {
        nextSearchParams.set("category", nextCategory);
      } else {
        nextSearchParams.delete("category");
      }

      if (nextDifficulty) {
        nextSearchParams.set("difficulty", nextDifficulty);
      } else {
        nextSearchParams.delete("difficulty");
      }

      if (nextSort) {
        nextSearchParams.set("sort", nextSort);
      } else {
        nextSearchParams.delete("sort");
      }

      const nextUrl = nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [category, difficulty, pathname, query, router, searchParams, sort]);

  function submitSearch() {
    const nextQuery = query.trim();
    const nextCategory = category.trim();
    const nextDifficulty = difficulty.trim();
    const nextSort = sort.trim();
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      nextSearchParams.set("q", nextQuery);
    } else {
      nextSearchParams.delete("q");
    }

    if (nextCategory) {
      nextSearchParams.set("category", nextCategory);
    } else {
      nextSearchParams.delete("category");
    }

    if (nextDifficulty) {
      nextSearchParams.set("difficulty", nextDifficulty);
    } else {
      nextSearchParams.delete("difficulty");
    }

    if (nextSort) {
      nextSearchParams.set("sort", nextSort);
    } else {
      nextSearchParams.delete("sort");
    }

    const nextUrl = nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch();
  }

  function resetFilters() {
    setQuery("");
    setCategory("");
    setDifficulty("");
    setSort("");

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  const hasActiveFilters = query.trim().length > 0 || category.trim().length > 0 || difficulty.trim().length > 0 || sort.trim().length > 0;

  return (
    <div className="mt-2 flex w-full max-w-5xl flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-[1.75rem] border border-black/10 bg-white p-3 shadow-[0_12px_30px_rgba(56,44,24,0.08)] md:grid-cols-[minmax(0,1.35fr)_0.8fr_0.8fr] lg:grid-cols-[minmax(0,1.7fr)_0.9fr_0.9fr_0.9fr_auto] lg:gap-4 lg:p-4 lg:shadow-[0_18px_40px_rgba(56,44,24,0.08)] lg:items-center"
      >
        <div className="flex items-center overflow-hidden rounded-full border border-black/10 bg-stone-50">
          <label htmlFor="recipes-search" className="sr-only">
            Търсене на рецепта
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="ml-4 h-4 w-4 shrink-0 text-stone-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="recipes-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Напиши име на рецепта, продукт или категория"
            className="w-full bg-transparent px-3 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400"
          />
        </div>

        <label className="sr-only" htmlFor="recipes-category-filter">
          Филтър по категория
        </label>
        <select
          id="recipes-category-filter"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-full border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
        >
          <option value="">Всички категории</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="recipes-difficulty-filter">
          Филтър по трудност
        </label>
        <select
          id="recipes-difficulty-filter"
          name="difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
          className="rounded-full border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
        >
          <option value="">Всички нива</option>
          {difficultyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="recipes-sort-filter">
          Сортиране
        </label>
        <select
          id="recipes-sort-filter"
          name="sort"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-full border border-black/10 bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
        >
          <option value="">Без сортиране</option>
          <option value="newest">Най-нови</option>
          <option value="fastest">Най-бързи</option>
          <option value="easiest">Най-лесни</option>
        </select>

        <button
          type="submit"
          className="rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-5 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-50 shadow-[0_8px_20px_rgba(217,119,6,0.18)] transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
        >
          {isPending ? "Търси..." : "Търсене"}
        </button>
      </form>

      {hasActiveFilters ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm text-stone-700 lg:flex-wrap lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-track]:bg-transparent">
            {query ? <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100/80 px-4 py-2 font-semibold text-amber-900">Текст: {query}</span> : null}
            {category ? <span className="shrink-0 whitespace-nowrap rounded-full bg-orange-100/80 px-4 py-2 font-semibold text-orange-900">Категория: {category}</span> : null}
            {difficulty ? <span className="shrink-0 whitespace-nowrap rounded-full bg-stone-200 px-4 py-2 font-semibold text-stone-700">Трудност: {difficulty}</span> : null}
            {sort ? <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-800">Сортиране: {sort === "newest" ? "Най-нови" : sort === "fastest" ? "Най-бързи" : "Най-лесни"}</span> : null}
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="shrink-0 self-start whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-2 font-semibold text-stone-700 transition hover:border-black/20 hover:bg-stone-50 lg:self-auto"
          >
            Изчисти филтрите
          </button>
        </div>
      ) : null}
    </div>
  );
}