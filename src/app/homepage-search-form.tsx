"use client";

import { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SearchableRecipe = {
  slug: string;
  title: string;
};

type HomepageSearchFormProps = {
  recipes: SearchableRecipe[];
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function HomepageSearchForm({ recipes }: HomepageSearchFormProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const normalizedDeferredQuery = normalizeSearchText(deferredQuery);
  const suggestions = normalizedDeferredQuery
    ? recipes
        .filter((recipe) => normalizeSearchText(recipe.title).includes(normalizedDeferredQuery))
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

    if (!trimmedQuery) {
      setIsOpen(false);

      startTransition(() => {
        router.push("/recipes");
      });

      return;
    }

    const normalizedQuery = normalizeSearchText(trimmedQuery);
    const exactRecipe = recipes.find((recipe) => normalizeSearchText(recipe.title) === normalizedQuery);
    setIsOpen(false);

    startTransition(() => {
      if (exactRecipe) {
        router.push(`/recipes/${exactRecipe.slug}`);
        return;
      }

      router.push(`/recipes?q=${encodeURIComponent(trimmedQuery)}`);
    });
  }

  return (
    <div ref={containerRef} className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex items-center overflow-hidden rounded-full border border-black/10 bg-white shadow-[0_12px_30px_rgba(56,44,24,0.08)]">
        <label htmlFor="homepage-search" className="sr-only">
          Търсене
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
          className="w-full bg-transparent px-3 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400"
        />
        <button
          type="submit"
          className="mr-1 rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-5 py-2 font-serif text-sm font-semibold tracking-[0.08em] text-amber-50 shadow-[0_8px_20px_rgba(217,119,6,0.18)] transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
        >
          {isPending ? "Търси..." : "Търсене"}
        </button>
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