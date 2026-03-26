import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { deleteRecipeAction } from "@/app/dashboard/recipes/actions";
import { DashboardRecipeDeleteButton } from "@/app/dashboard/recipes/delete-recipe-button";
import { DashboardRecipeForm } from "@/app/dashboard/recipes/recipe-form";
import { getDashboardRecipes } from "@/lib/recipe-repository";

export const metadata = {
  title: "Управление на рецепти | Кулинарният блог на Иво",
  description: "Създавай и управлявай рецепти за Кулинарният блог на Иво.",
};

export default async function DashboardRecipesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const recipes = await getDashboardRecipes();
  const usingDatabase = Boolean(process.env.DATABASE_URL);
  const databaseRecipes = recipes.filter((recipe) => recipe.source === "database").length;
  const sampleRecipes = recipes.filter((recipe) => recipe.source === "sample").length;
  const publishedRecipes = recipes.filter((recipe) => recipe.published).length;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.16)_0%,_rgba(217,119,6,0)_70%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(22,101,52,0.14)_0%,_rgba(22,101,52,0)_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-12 xl:gap-10 xl:px-8">
        <section className="overflow-hidden rounded-[2.25rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,250,243,0.9),rgba(255,247,237,0.96))] text-stone-900 shadow-[0_30px_100px_rgba(56,44,24,0.12)]">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-10 xl:px-12 xl:py-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Управление на рецепти</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight lg:text-5xl">Създавай, публикувай и подреждай архива на блога</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                Оттук можеш да добавяш нови рецепти, да качваш изображения и да следиш кое е публикувано и кое остава като чернова.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-full border border-black/12 bg-white px-5 py-3 text-sm font-semibold text-stone-800 shadow-[0_10px_24px_rgba(56,44,24,0.05)] transition hover:border-black/15 hover:bg-stone-50"
                >
                  Към таблото
                </Link>
                <Link
                  href="/recipes"
                  className="rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
                >
                  Към публичния архив
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:self-start">
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Общо</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{recipes.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Публикувани</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{publishedRecipes}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">В базата</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{databaseRecipes}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-black/6 px-8 py-5 text-sm text-stone-700 lg:px-10 xl:px-12 xl:gap-4">
            <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-[0_8px_18px_rgba(56,44,24,0.04)]">Потребител: {session.user.email ?? "няма имейл"}</span>
            <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-[0_8px_18px_rgba(56,44,24,0.04)]">Примерни рецепти: {sampleRecipes}</span>
            <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-[0_8px_18px_rgba(56,44,24,0.04)]">{usingDatabase ? "Базата данни е активна" : "Работи се с примерни данни"}</span>
          </div>
        </section>

        {!usingDatabase ? (
          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-7 text-amber-900 shadow-[0_18px_60px_rgba(56,44,24,0.05)]">
            Задай DATABASE_URL и изпълни npm run db:push, за да записваш рецепти в PostgreSQL. Дотогава публичните страници ще показват локалните примерни рецепти.
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.96fr)] xl:gap-8">
          <div className="self-start">
            <DashboardRecipeForm />
          </div>

          <aside className="flex flex-col rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,250,249,0.96))] p-7 shadow-[0_20px_80px_rgba(56,44,24,0.08)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden xl:p-8">
            <div className="border-b border-black/6 pb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Текущ архив</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Всички рецепти</h2>
              <p className="mt-3 max-w-[18rem] text-sm leading-6 text-stone-700">
                Бърз преглед на архива с по-ясно разделение между публикувани рецепти, чернови и примерни записи.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-[1.4rem] border border-black/8 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(56,44,24,0.04)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">Общо</p>
                  <p className="mt-2 font-serif text-3xl text-stone-950">{recipes.length}</p>
                </div>
                <div className="rounded-[1.4rem] border border-emerald-200/80 bg-emerald-50/90 px-4 py-4 shadow-[0_8px_20px_rgba(16,185,129,0.06)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Публикувани</p>
                  <p className="mt-2 font-serif text-3xl text-emerald-950">{publishedRecipes}</p>
                </div>
                <div className="rounded-[1.4rem] border border-stone-200/90 bg-stone-100/90 px-4 py-4 shadow-[0_8px_20px_rgba(56,44,24,0.04)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">Чернови</p>
                  <p className="mt-2 font-serif text-3xl text-stone-950">{recipes.length - publishedRecipes}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid min-h-0 gap-4 lg:flex-1 lg:overflow-y-auto lg:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-300/80 [&::-webkit-scrollbar-track]:bg-transparent">
              {recipes.map((recipe) => {
                const canManageRecipe = recipe.source === "database" && recipe.id && (session.user.role === "ADMIN" || recipe.authorId === session.user.id);

                return (
                  <div key={recipe.slug} className="rounded-[1.5rem] border border-black/8 bg-white/95 px-4 py-4 shadow-[0_10px_28px_rgba(56,44,24,0.04)] transition duration-200 ease-out hover:border-black/10 hover:shadow-[0_14px_34px_rgba(56,44,24,0.07)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                          <span className="rounded-full border border-black/8 bg-stone-50 px-2.5 py-1 text-stone-700">{recipe.category}</span>
                          <span className="rounded-full border border-black/8 bg-stone-50 px-2.5 py-1 text-stone-700">{recipe.source === "database" ? "база данни" : "примерни"}</span>
                        </div>
                        <h3 className="mt-3 font-serif text-2xl leading-tight text-stone-950">{recipe.title}</h3>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 ${recipe.published ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>
                        {recipe.published ? "публикувана" : "чернова"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4">
                      <p className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">Обновена {recipe.updatedAt}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {canManageRecipe ? (
                          <>
                            <Link
                              href={`/dashboard/recipes/${recipe.slug}`}
                              className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
                            >
                              Редактирай
                            </Link>
                            {recipe.id ? <DashboardRecipeDeleteButton action={deleteRecipeAction} recipeId={recipe.id} recipeTitle={recipe.title} /> : null}
                          </>
                        ) : (
                          <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                            {recipe.source === "database" ? "Без права за промяна" : "Само преглед"}
                          </span>
                        )}
                        {recipe.published ? (
                          <Link
                            href={`/recipes/${recipe.slug}`}
                            className="inline-flex rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(217,119,6,0.18)] transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
                          >
                            Виж
                          </Link>
                        ) : (
                          <span className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-600">
                            Скрито от сайта
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}