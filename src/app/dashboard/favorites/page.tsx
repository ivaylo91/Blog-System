import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RecipeImage } from "@/components/recipe-image";
import { getFavoriteRecipes } from "@/lib/recipe-repository";

export const metadata = {
  title: "Любими рецепти | Кулинарният блог на Иво",
  description: "Запазените рецепти в твоя профил.",
};

export default async function DashboardFavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=%2Fdashboard%2Ffavorites");
  }

  const favorites = await getFavoriteRecipes(session.user.id);
  const usingDatabase = Boolean(process.env.DATABASE_URL);

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(190,24,93,0.16)_0%,_rgba(190,24,93,0)_72%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.14)_0%,_rgba(217,119,6,0)_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-12 xl:gap-10 xl:px-8">
        <section className="overflow-hidden rounded-[2.25rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,248,250,0.92),rgba(255,247,237,0.96))] text-stone-900 shadow-[0_30px_100px_rgba(56,44,24,0.12)]">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10 xl:px-12 xl:py-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">Любими рецепти</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight lg:text-5xl">Запази вкусовете, към които искаш да се върнеш</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                Тук са събрани всички публикувани рецепти, които си отбелязал като любими от публичния сайт.
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
                  className="rounded-full bg-[linear-gradient(135deg,#be123c,#e11d48)] px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-[linear-gradient(135deg,#9f1239,#be123c)]"
                >
                  Разгледай още рецепти
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:self-start">
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Запазени рецепти</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{favorites.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Профил</p>
                <p className="mt-2 break-all text-lg font-semibold text-stone-950">{session.user.email ?? "няма имейл"}</p>
              </div>
            </div>
          </div>
        </section>

        {!usingDatabase ? (
          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-7 text-amber-900 shadow-[0_18px_60px_rgba(56,44,24,0.05)]">
            Любимите рецепти са достъпни, когато приложението работи с активна PostgreSQL база данни.
          </div>
        ) : favorites.length === 0 ? (
          <section className="rounded-[2rem] border border-black/8 bg-white/90 p-8 shadow-[0_20px_80px_rgba(56,44,24,0.08)] xl:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Все още няма запазени рецепти</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-950">Добави първата си любима рецепта</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Отвори някоя рецепта в публичния архив и използвай бутона за любими. Запазените рецепти ще се появяват тук автоматично.
            </p>
            <div className="mt-6">
              <Link
                href="/recipes"
                className="inline-flex rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-6 py-3 text-sm font-semibold text-amber-50 transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
              >
                Отвори архива
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {favorites.map((recipe) => (
              <article
                key={recipe.slug}
                className="group grid h-full overflow-hidden rounded-[2rem] border border-black/8 bg-white/90 shadow-[0_20px_80px_rgba(56,44,24,0.08)] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(56,44,24,0.12)] lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-1"
              >
                <div className="relative h-56 overflow-hidden lg:h-full 2xl:h-56">
                  <RecipeImage src={recipe.imagePath} alt={recipe.title} sizes="(min-width: 1536px) 30vw, (min-width: 1024px) 24vw, (min-width: 768px) 46vw, 100vw" />
                </div>
                <div className="flex flex-1 flex-col px-6 py-6 lg:px-7 lg:py-7 2xl:px-6 2xl:py-6">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-600">
                    <span className="rounded-full border border-black/8 bg-stone-50 px-2.5 py-1 text-stone-700">{recipe.category}</span>
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-800">Запазена {recipe.savedAt}</span>
                  </div>
                  <h2 className="mt-4 font-serif text-3xl leading-tight text-stone-950">{recipe.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-stone-600 lg:max-w-xl 2xl:max-w-none">{recipe.excerpt}</p>
                  <div className="mt-6 flex flex-wrap gap-3 lg:mt-5">
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="inline-flex rounded-full bg-[linear-gradient(135deg,#be123c,#e11d48)] px-5 py-3 text-sm font-semibold text-rose-50 transition hover:bg-[linear-gradient(135deg,#9f1239,#be123c)]"
                    >
                      Отвори рецептата
                    </Link>
                    <Link
                      href="/recipes"
                      className="inline-flex rounded-full border border-black/12 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-black/15 hover:bg-stone-50"
                    >
                      Още рецепти
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}