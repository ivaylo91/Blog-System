import { RecipeImage } from "@/components/recipe-image";
import Link from "next/link";
import { HomepageSearchForm } from "@/app/homepage-search-form";
import { getRecipes } from "@/lib/recipe-repository";

type TodayInKitchenCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

function getFeaturedRecipeSelection<T extends { slug: string }>(recipes: T[], count: number, excludedSlugs: string[] = []) {
  const eligibleRecipes = recipes.filter((recipe) => !excludedSlugs.includes(recipe.slug));

  if (eligibleRecipes.length === 0) {
    return [];
  }

  const offset = recipes.reduce((sum, recipe) => {
    return sum + Array.from(recipe.slug).reduce((slugSum, character) => slugSum + character.charCodeAt(0), 0);
  }, 0) % eligibleRecipes.length;

  return Array.from({ length: Math.min(count, eligibleRecipes.length) }, (_, index) => eligibleRecipes[(offset + index) % eligibleRecipes.length]);
}

export default async function Home() {
  const recipes = await getRecipes();
  const latestRecipes = recipes.slice(0, 3);
  const mostViewedRecipe = recipes[0];
  const randomRecipes = getFeaturedRecipeSelection(
    recipes,
    3,
    [latestRecipes[0]?.slug, mostViewedRecipe?.slug].filter((slug): slug is string => Boolean(slug)),
  );
  const todayInKitchenCards: TodayInKitchenCard[] = [
    latestRecipes[0]
      ? {
          eyebrow: "Най-нова рецепта",
          title: latestRecipes[0].title,
          description: latestRecipes[0].excerpt,
          href: `/recipes/${latestRecipes[0].slug}`,
          cta: "Прочети",
        }
      : null,
    mostViewedRecipe
      ? {
          eyebrow: "Избор на деня",
          title: mostViewedRecipe.title,
          description: mostViewedRecipe.description,
          href: `/recipes/${mostViewedRecipe.slug}`,
          cta: "Виж",
        }
      : null,
    randomRecipes[0]
      ? {
          eyebrow: "Случайно предложение",
          title: randomRecipes[0].title,
          description: randomRecipes[0].excerpt,
          href: `/recipes/${randomRecipes[0].slug}`,
          cta: "Опитай",
        }
      : null,
  ].filter((card): card is TodayInKitchenCard => Boolean(card));

  return (
    <main className="grain relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage: 'url("/cooking-theme-bg.svg")',
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(234,88,12,0.28)_0%,_rgba(234,88,12,0)_72%)] blur-2xl" />
        <div className="absolute right-[-5rem] top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.22)_0%,_rgba(245,158,11,0)_70%)] blur-2xl" />
        <div className="absolute bottom-16 left-[8%] h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(22,101,52,0.14)_0%,_rgba(22,101,52,0)_72%)] blur-2xl" />
        <div className="absolute bottom-0 right-[10%] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(120,53,15,0.18)_0%,_rgba(120,53,15,0)_75%)] blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,_rgba(255,251,235,0.82)_0%,_rgba(255,251,235,0)_100%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-10 lg:gap-14 lg:px-8 lg:pt-14 xl:gap-16">
        <section className="grid gap-8 rounded-[2.25rem] border border-black/8 bg-white/70 p-7 shadow-[0_24px_90px_rgba(56,44,24,0.08)] backdrop-blur sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:p-10 xl:gap-10 xl:p-12">
          <div className="space-y-6 xl:space-y-8">
            <div className="inline-flex rounded-full border border-amber-400/40 bg-amber-100/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-900">
              Българска домашна кухня
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] text-stone-950 sm:text-6xl lg:text-7xl">
                Домашни рецепти, подбрани за българската трапеза.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                Намери класически ястия, сезонни идеи и любими вкусове, подредени така, че бързо да стигнеш до точната рецепта.
              </p>
            </div>
            <div className="max-w-2xl">
              <HomepageSearchForm recipes={recipes.map((recipe) => ({ slug: recipe.slug, title: recipe.title }))} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/8 bg-white/80 p-6 shadow-[0_18px_60px_rgba(56,44,24,0.06)] xl:p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Днес в кухнята</p>
            <p className="mt-3 text-sm leading-7 text-stone-700">
              Подбрахме няколко бързи предложения, за да стигнеш веднага до точната рецепта.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:gap-4">
              {todayInKitchenCards.map((card) => (
                <Link
                  key={`${card.eyebrow}-${card.href}`}
                  href={card.href}
                  className="group rounded-[1.5rem] border border-black/6 bg-stone-50 px-4 py-4 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">{card.eyebrow}</p>
                  <h2 className="mt-2 font-serif text-xl text-stone-950">{card.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{card.description}</p>
                  <span className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition group-hover:border-amber-300 group-hover:bg-amber-100 group-hover:text-amber-950">
                    {card.cta}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Най-нови рецепти</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Последно добавени рецепти в блога.</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latestRecipes.map((recipe) => (
              <article
                key={recipe.slug}
                className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_60px_rgba(56,44,24,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(56,44,24,0.1)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <RecipeImage src={recipe.imagePath} alt={recipe.title} />
                  <div
                    className="absolute inset-0 opacity-35"
                    style={{
                      background: `linear-gradient(135deg, ${recipe.heroPalette.from}, ${recipe.heroPalette.via}, ${recipe.heroPalette.to})`,
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    <span>{recipe.category}</span>
                    <span>{recipe.prepMinutes + recipe.cookMinutes} мин</span>
                  </div>
                  <h3 className="font-serif text-3xl text-stone-950">{recipe.title}</h3>
                  <p className="flex-1 text-sm leading-7 text-stone-700">{recipe.excerpt}</p>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="mt-auto inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
                  >
                    Виж
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {mostViewedRecipe ? (
          <section className="rounded-[2rem] border border-amber-200/60 bg-[linear-gradient(135deg,rgba(255,247,237,0.96)_0%,rgba(254,243,199,0.92)_50%,rgba(255,255,255,0.96)_100%)] p-8 text-stone-900 shadow-[0_24px_80px_rgba(180,83,9,0.14)] lg:p-10 xl:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center xl:gap-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Най-гледана рецепта</p>
                <h2 className="mt-3 font-serif text-4xl text-stone-950 lg:text-5xl">{mostViewedRecipe.title}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">{mostViewedRecipe.description}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-stone-500">
                  <span>{mostViewedRecipe.category}</span>
                  <span>{mostViewedRecipe.prepMinutes + mostViewedRecipe.cookMinutes} мин</span>
                  <span>{mostViewedRecipe.difficulty}</span>
                </div>
                <Link
                  href={`/recipes/${mostViewedRecipe.slug}`}
                  className="mt-6 inline-flex items-center justify-center rounded-full border border-amber-200/80 bg-amber-50/90 px-6 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
                >
                  Виж рецептата
                </Link>
              </div>

              <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-amber-200/60">
                <RecipeImage src={mostViewedRecipe.imagePath} alt={mostViewedRecipe.title} />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${mostViewedRecipe.heroPalette.from}, ${mostViewedRecipe.heroPalette.via}, ${mostViewedRecipe.heroPalette.to})`,
                  }}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-4 grid gap-6 rounded-[2rem] border border-black/8 bg-white/55 px-6 py-8 shadow-[0_18px_60px_rgba(56,44,24,0.05)] lg:mt-6 lg:px-8 xl:px-10 xl:py-10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Случайни рецепти</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Опитай нещо различно от нашия архив.</h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {randomRecipes.map((recipe) => (
              <article
                key={recipe.slug}
                className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_60px_rgba(56,44,24,0.06)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(56,44,24,0.1)]"
              >
                <div className="relative h-44 overflow-hidden">
                  <RecipeImage src={recipe.imagePath} alt={recipe.title} />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(135deg, ${recipe.heroPalette.from}, ${recipe.heroPalette.via}, ${recipe.heroPalette.to})`,
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    <span>{recipe.category}</span>
                    <span>{recipe.prepMinutes + recipe.cookMinutes} мин</span>
                  </div>
                  <h3 className="font-serif text-3xl text-stone-950">{recipe.title}</h3>
                  <p className="flex-1 text-sm leading-7 text-stone-700">{recipe.excerpt}</p>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="mt-auto inline-flex items-center justify-center rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
                  >
                    Виж
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
