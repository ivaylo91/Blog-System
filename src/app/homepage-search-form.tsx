"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";


type SearchableRecipe = {
  slug: string;
  title: string;
  category: string;
  difficulty: string;
};

type HomepageSearchFormProps = {
  recipes: SearchableRecipe[];
  categoryOptions: string[];
  difficultyOptions: string[];
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function HomepageSearchForm({ recipes, categoryOptions, difficultyOptions }: HomepageSearchFormProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");

  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const normalizedDeferredQuery = normalizeSearchText(deferredQuery);
  const suggestions = normalizedDeferredQuery
    ? recipes
        .filter((recipe) =>
          normalizeSearchText(recipe.title).includes(normalizedDeferredQuery) &&
          (category ? recipe.category === category : true) &&
          (difficulty ? recipe.difficulty === difficulty : true)
        )
        .slice(0, 5)
    : [];
  const shouldShowSuggestions = isOpen && suggestions.length > 0;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function openRecipe(slug: string) {
    setIsOpen(false);
    setQuery("");

    startTransition(() => {
      router.push(`/recipes/${slug}`);
    });
  }


  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const trimmedCategory = category.trim();
    const trimmedDifficulty = difficulty.trim();

    setIsOpen(false);

    // Build search params
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("q", trimmedQuery);
    if (trimmedCategory) params.set("category", trimmedCategory);
    if (trimmedDifficulty) params.set("difficulty", trimmedDifficulty);

    startTransition(() => {
      if (trimmedQuery) {
        const normalizedQuery = normalizeSearchText(trimmedQuery);
        const exactRecipe = recipes.find((recipe) => normalizeSearchText(recipe.title) === normalizedQuery);
        if (exactRecipe && (!trimmedCategory || exactRecipe.category === trimmedCategory) && (!trimmedDifficulty || exactRecipe.difficulty === trimmedDifficulty)) {
          router.push(`/recipes/${exactRecipe.slug}`);
          return;
        }
      }
      const url = params.toString() ? `/recipes?${params.toString()}` : "/recipes";
      router.push(url);
    });
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-2xl mx-auto px-1 sm:px-2 md:px-0"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-center overflow-hidden rounded-2xl md:rounded-full border border-black/10 bg-white shadow-[0_12px_30px_rgba(56,44,24,0.08)] p-2 md:p-3"
        style={{ boxSizing: 'border-box' }}
      >
        <div className="flex items-center flex-1 min-w-0 bg-white rounded-xl md:rounded-full px-2 py-1 md:px-0 md:py-0">
          <label htmlFor="homepage-search" className="sr-only">
            Търсене
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="ml-2 h-5 w-5 shrink-0 text-stone-500 md:ml-4 md:h-4 md:w-4"
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
            id="homepage-search"
            name="q"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(event.target.value.trim().length > 0);
            }}
            onFocus={() => setIsOpen(normalizeSearchText(query).length > 0)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder="Търсене"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="homepage-search-suggestions"
            className="w-full bg-transparent px-2 py-2 text-base text-stone-700 outline-none placeholder:text-stone-400 md:px-3 md:py-4 md:text-base"
            style={{ minWidth: 0 }}
          />
        </div>
        <div className="flex flex-col gap-2 w-full md:flex-row md:gap-2 md:w-auto">
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-black/10 bg-stone-50 px-4 py-2 text-base text-stone-700 outline-none transition focus:border-stone-400 md:rounded-full md:text-sm"
          >
            <option value="">Всички категории</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            name="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-xl border border-black/10 bg-stone-50 px-4 py-2 text-base text-stone-700 outline-none transition focus:border-stone-400 md:rounded-full md:text-sm"
          >
            <option value="">Всички нива</option>
            {difficultyOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-5 py-2 font-serif text-base font-semibold tracking-[0.08em] text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950 md:rounded-full md:text-sm"
          >
            {isPending ? "Търси..." : "Търсене"}
          </button>
        </div>
      </form>

      {shouldShowSuggestions ? (
        <div
          id="homepage-search-suggestions"
          className="mt-3 max-h-80 overflow-auto rounded-[1.5rem] border border-black/8 bg-white/95 shadow-[0_24px_90px_rgba(56,44,24,0.12)] backdrop-blur"
        >
          <div className="border-b border-black/6 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Предложения
          </div>
          <div className="grid gap-1 p-2">
            {suggestions.map((recipe) => (
              <button
                key={recipe.slug}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  openRecipe(recipe.slug);
                }}
                className="flex items-center justify-between rounded-[1rem] px-4 py-3 text-left transition hover:bg-stone-50"
              >
                <span className="font-serif text-lg text-stone-950">{recipe.title}</span>
                <span className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
                  Виж
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}