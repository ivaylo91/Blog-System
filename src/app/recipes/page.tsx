import Link from "next/link";
import { getRecipes } from "@/lib/recipe-repository";
import { RecipesSearchForm } from "@/app/recipes/search-form";
import { RecipeImage } from "@/components/recipe-image";

type RecipesPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    difficulty?: string;
    sort?: string;
  }>;
};

const difficultyRank: Record<string, number> = {
  "Лесно": 0,
  "Средно": 1,
  "За напреднали": 2,
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchesRecipeQuery(recipe: Awaited<ReturnType<typeof getRecipes>>[number], query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableFields = [
    recipe.title,
    recipe.excerpt,
    recipe.description,
    recipe.category,
    recipe.difficulty,
    ...recipe.tags,
    ...recipe.ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.name}`),
  ];

  return searchableFields.some((field) => normalizeSearchText(field).includes(normalizedQuery));
}

function matchesSelectedFilter(value: string, selectedValue: string) {
  if (!selectedValue) {
    return true;
  }

  return normalizeSearchText(value) === normalizeSearchText(selectedValue);
}

export const metadata = {
  title: "Рецепти | Кулинарният блог на Иво",
  description: "Разгледай колекцията с традиционни рецепти в Кулинарният блог на Иво.",
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
  const selectedCategory = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category.trim() : "";
  const selectedDifficulty = typeof resolvedSearchParams.difficulty === "string" ? resolvedSearchParams.difficulty.trim() : "";
  const selectedSort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort.trim() : "";
  const recipes = await getRecipes();
  const categoryOptions = Array.from(new Set(recipes.map((recipe) => recipe.category))).sort((left, right) => left.localeCompare(right, "bg"));
  const difficultyOptions = Array.from(new Set(recipes.map((recipe) => recipe.difficulty)));
  const filteredRecipes = recipes
    .filter(
      (recipe) =>
        matchesRecipeQuery(recipe, query) &&
        matchesSelectedFilter(recipe.category, selectedCategory) &&
        matchesSelectedFilter(recipe.difficulty, selectedDifficulty),
    )
    .sort((left, right) => {
      if (selectedSort === "newest") {
        return right.publishedAt.localeCompare(left.publishedAt);
      }

      if (selectedSort === "fastest") {
        return (left.prepMinutes + left.cookMinutes) - (right.prepMinutes + right.cookMinutes);
      }

      if (selectedSort === "easiest") {
        const difficultyDelta = (difficultyRank[left.difficulty] ?? 99) - (difficultyRank[right.difficulty] ?? 99);

        if (difficultyDelta !== 0) {
          return difficultyDelta;
        }

        return (left.prepMinutes + left.cookMinutes) - (right.prepMinutes + right.cookMinutes);
      }

      return 0;
    });
  const exactMatch = query
    ? filteredRecipes.find((recipe) => normalizeSearchText(recipe.title) === normalizeSearchText(query))
    : null;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-16 pt-10 lg:gap-12 lg:pt-14">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-black/8 bg-white/85 px-8 py-8 shadow-[0_24px_90px_rgba(56,44,24,0.08)] lg:px-10 lg:py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Архив с рецепти</p>
        <h1 className="font-serif text-5xl text-stone-950">Традиционни български рецепти за всеки ден.</h1>
        <p className="max-w-2xl text-base leading-8 text-stone-700">
          Подбрана колекция от любими български ястия, които можеш да приготвиш у дома и да запазиш като част от своя кулинарен архив.
        </p>
        <RecipesSearchForm
          key={[query, selectedCategory, selectedDifficulty, selectedSort].join("|")}
          initialQuery={query}
          initialCategory={selectedCategory}
          initialDifficulty={selectedDifficulty}
          initialSort={selectedSort}
          categoryOptions={categoryOptions}
          difficultyOptions={difficultyOptions}
        />

        {query || selectedCategory || selectedDifficulty || selectedSort ? (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 text-sm text-stone-700 lg:flex-wrap lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-track]:bg-transparent">
              {query ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-amber-100/80 px-4 py-2 font-semibold text-amber-900">
                  Резултати за: {query}
                </span>
              ) : null}
              {selectedCategory ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-orange-100/80 px-4 py-2 font-semibold text-orange-900">
                  Категория: {selectedCategory}
                </span>
              ) : null}
              {selectedDifficulty ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-stone-200 px-4 py-2 font-semibold text-stone-700">
                  Трудност: {selectedDifficulty}
                </span>
              ) : null}
              {selectedSort ? (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-800">
                  Сортиране: {selectedSort === "newest" ? "Най-нови" : selectedSort === "fastest" ? "Най-бързи" : "Най-лесни"}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 text-sm text-stone-700 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-track]:bg-transparent">
              <span className="shrink-0 whitespace-nowrap font-medium">Намерени рецепти: {filteredRecipes.length}</span>
              {exactMatch ? (
                <Link
                  href={`/recipes/${exactMatch.slug}`}
                  className="shrink-0 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                >
                  Отвори {exactMatch.title}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {filteredRecipes.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <article
              key={recipe.slug}
              className="overflow-hidden rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_60px_rgba(56,44,24,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(56,44,24,0.1)]"
            >
              <div className="relative h-56 overflow-hidden">
                <RecipeImage src={recipe.imagePath} alt={recipe.title} />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${recipe.heroPalette.from}, ${recipe.heroPalette.via}, ${recipe.heroPalette.to})`,
                  }}
                />
              </div>
              <div className="space-y-5 p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <span>{recipe.category}</span>
                  <span>{recipe.difficulty}</span>
                  <span>{recipe.prepMinutes + recipe.cookMinutes} мин</span>
                </div>
                <div className="space-y-3">
                  <h2 className="font-serif text-3xl text-stone-950">{recipe.title}</h2>
                  <p className="text-sm leading-7 text-stone-700">{recipe.excerpt}</p>
                </div>
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="inline-flex rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-5 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-50 transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
                >
                  Виж рецептата
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-black/8 bg-white/85 px-8 py-10 shadow-[0_24px_90px_rgba(56,44,24,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Няма резултати</p>
          <h2 className="mt-2 font-serif text-4xl text-stone-950">
            Не намерихме рецепта{query ? ` за „${query}“` : " за избраните филтри"}.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-700">
            Опитай с друго име, продукт или категория. Можеш да търсиш например по ястие, съставка или тип рецепта.
          </p>
          <Link
            href="/recipes"
            className="mt-6 inline-flex rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-5 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-50 transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
          >
            Виж всички рецепти
          </Link>
        </section>
      )}
    </main>
  );
}