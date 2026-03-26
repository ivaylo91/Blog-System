import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToPreviousPageButton } from "@/app/recipes/[slug]/back-to-previous-page-button";
import { RecipeCommentsSection } from "@/app/recipes/[slug]/recipe-comments-section";
import { RelatedRecipesSection } from "@/app/recipes/[slug]/related-recipes-section";
import { RecipeShareButtons } from "@/app/recipes/[slug]/recipe-share-buttons";
import { RecipeImage } from "@/components/recipe-image";
import { getRecipeBySlug, getRecipes, getRelatedRecipes } from "@/lib/recipe-repository";

type RecipePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const recipes = await getRecipes();
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return {
      title: "Рецептата не е намерена | Кулинарният блог на Иво",
    };
  }

  return {
    title: `${recipe.title} | Кулинарният блог на Иво`,
    description: recipe.description,
  };
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const relatedRecipes = await getRelatedRecipes(recipe.slug, recipe.categorySlug);
  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  const baseUrl = process.env.AUTH_URL ?? (host ? `${protocol}://${host}` : "http://localhost:3000");
  const recipeUrl = new URL(`/recipes/${recipe.slug}`, baseUrl).toString();
  const recipeImageUrl = new URL(recipe.imagePath, baseUrl).toString();
  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    author: {
      "@type": "Person",
      name: recipe.author,
    },
    datePublished: recipe.publishedAt,
    recipeCategory: recipe.category,
    recipeYield: `${recipe.servings} порции`,
    totalTime: `PT${totalMinutes}M`,
    prepTime: `PT${recipe.prepMinutes}M`,
    cookTime: `PT${recipe.cookMinutes}M`,
    recipeIngredient: recipe.ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.name}`),
    recipeInstructions: recipe.steps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.description,
    })),
    keywords: recipe.tags.join(", "),
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-16 pt-10 lg:gap-12 lg:px-8 lg:pt-14 xl:gap-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="overflow-hidden rounded-[2.4rem] border border-black/8 bg-white/80 shadow-[0_24px_90px_rgba(56,44,24,0.08)]">
        <div className="relative h-72 w-full overflow-hidden lg:h-[28rem] xl:h-[32rem]">
          <RecipeImage src={recipe.imagePath} alt={recipe.title} sizes="100vw" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, ${recipe.heroPalette.from}, ${recipe.heroPalette.via}, ${recipe.heroPalette.to})`,
            }}
          />
        </div>
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:px-8 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:gap-10 xl:px-10 xl:py-10">
          <div className="space-y-6 xl:space-y-7">
            <div className="flex justify-start lg:justify-end">
              <BackToPreviousPageButton />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              <Link href="/recipes" className="transition hover:text-stone-900">
                Рецепти
              </Link>
              <span>{recipe.category}</span>
              <span>{recipe.difficulty}</span>
            </div>
            <div className="space-y-4">
              <h1 className="font-serif text-5xl text-stone-950 lg:text-6xl">{recipe.title}</h1>
              <p className="max-w-3xl text-base leading-8 text-stone-700">{recipe.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-black/8 bg-stone-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <RecipeShareButtons title={recipe.title} url={recipeUrl} imageUrl={recipeImageUrl} />
          </div>

          <aside className="grid gap-4 self-start rounded-[2rem] bg-[linear-gradient(180deg,#7c2d12_0%,#9a3412_100%)] p-6 text-amber-50 shadow-[0_20px_60px_rgba(124,45,18,0.22)] lg:sticky lg:top-24 xl:p-7">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Подготовка</p>
              <p className="mt-1 text-3xl font-semibold">{recipe.prepMinutes} мин</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Готвене</p>
              <p className="mt-1 text-3xl font-semibold">{recipe.cookMinutes} мин</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Порции</p>
              <p className="mt-1 text-3xl font-semibold">{recipe.servings}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Автор</p>
              <p className="mt-1 text-lg font-semibold">{recipe.author}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr] xl:gap-8">
        <div className="rounded-[2rem] border border-black/8 bg-white/85 p-8 xl:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Продукти</p>
          <ul className="mt-6 grid gap-4">
            {recipe.ingredients.map((ingredient) => (
              <li key={`${ingredient.amount}-${ingredient.name}`} className="flex gap-3 text-sm leading-7 text-stone-700">
                <span className="min-w-22 font-semibold text-stone-950">{ingredient.amount}</span>
                <span>{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-black/8 bg-white/85 p-8 xl:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Начин на приготвяне</p>
          <ol className="mt-6 grid gap-5">
            {recipe.steps.map((step, index) => (
              <li key={step.title} className="grid gap-3 rounded-[1.5rem] bg-stone-50 px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(217,119,6,0.28)]">
                    {index + 1}
                  </span>
                  <h2 className="font-serif text-2xl text-stone-950">{step.title}</h2>
                </div>
                <p className="text-sm leading-7 text-stone-700">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <RecipeCommentsSection recipeSlug={recipe.slug} />

      <RelatedRecipesSection relatedRecipes={relatedRecipes} category={recipe.category} />
    </main>
  );
}