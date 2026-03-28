import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getDashboardRecipes, getFavoriteRecipes } from "@/lib/recipe-repository";

export const metadata = {
  title: "Табло | Кулинарният блог на Иво",
  description: "Административно табло за управление на рецепти, профил и съдържание.",
};

const quickLinks = [
  {
    title: "Управление на рецепти",
    description: "Добавяй нови рецепти, изображения и съдържание за архива.",
    href: "/dashboard/recipes",
    cta: "Отвори",
  },
  {
    title: "Публичен архив",
    description: "Прегледай как изглеждат рецептите в сайта за посетителите.",
    href: "/recipes",
    cta: "Виж архива",
  },
  {
    title: "Начална страница",
    description: "Провери началното представяне на блога и основните секции.",
    href: "/",
    cta: "Към началото",
  },
  {
    title: "Любими рецепти",
    description: "Прегледай рецептите, които си запазил от публичния архив.",
    href: "/dashboard/favorites",
    cta: "Отвори любими",
  },
];

const roleLabels = {
  ADMIN: "Администратор",
  USER: "Потребител",
} as const;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const recipes = await getDashboardRecipes();
  const favoriteRecipes = await getFavoriteRecipes(session.user.id);

  async function handleSignOut() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  const localizedRole = roleLabels[session.user.role as keyof typeof roleLabels] ?? session.user.role;
  const publishedRecipes = recipes.filter((recipe) => recipe.published).length;
  const databaseRecipes = recipes.filter((recipe) => recipe.source === "database").length;
  const sampleRecipes = recipes.filter((recipe) => recipe.source === "sample").length;
  const favoriteRecipesCount = favoriteRecipes.length;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.18)_0%,_rgba(217,119,6,0)_70%)] blur-3xl" />
        <div className="absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(234,88,12,0.16)_0%,_rgba(234,88,12,0)_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-12 xl:gap-10 xl:px-8">
        <section className="overflow-hidden rounded-[2.25rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,250,243,0.9),rgba(255,247,237,0.96))] text-stone-900 shadow-[0_30px_100px_rgba(56,44,24,0.12)]">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-10 xl:px-12 xl:py-12">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Административно табло</p>
              <div className="space-y-3">
                <h1 className="font-serif text-4xl leading-tight lg:text-5xl">Добре дошъл, {session.user.name ?? "Готвач"}</h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-600">
                  Управлявай съдържанието на блога, следи архива с рецепти и поддържай публикуваните материали от едно място.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/recipes"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-7 py-3.5 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
                >
                  Управление на рецепти
                </Link>
                <Link
                  href="/recipes"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-6 py-3 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
                >
                  Публичен архив
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:self-start">
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Общо рецепти</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{recipes.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Публикувани</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{publishedRecipes}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                {/* Removed 'База данни' label as requested */}
                <p className="mt-2 font-serif text-4xl text-stone-950">{databaseRecipes}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Любими</p>
                <p className="mt-2 font-serif text-4xl text-stone-950">{favoriteRecipesCount}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-black/6 px-8 py-5 text-sm text-stone-700 lg:flex-row lg:items-center lg:justify-between lg:px-10 xl:px-12">
            <div className="flex flex-wrap items-center gap-3 xl:gap-4">
              <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-[0_8px_18px_rgba(56,44,24,0.04)]">Потребител: {session.user.email ?? "няма имейл"}</span>
              <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-[0_8px_18px_rgba(56,44,24,0.04)]">Роля: {localizedRole}</span>
              <span className="rounded-full border border-black/8 bg-white/90 px-3 py-1.5 shadow-[0_8px_18px_rgba(56,44,24,0.04)]">Примерни рецепти: {sampleRecipes}</span>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-full border border-black/12 bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-[0_10px_24px_rgba(56,44,24,0.05)] transition hover:border-black/15 hover:bg-stone-50"
              >
                Изход
              </button>
            </form>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_380px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1.05fr)_420px]">
          <div className="rounded-[2rem] border border-black/8 bg-white/90 p-8 shadow-[0_20px_80px_rgba(56,44,24,0.08)] xl:p-9">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Бързи действия</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-900">Избери какво да управляваш</h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              {quickLinks.map((item, index) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex h-full flex-col rounded-[1.9rem] border px-6 py-6 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(56,44,24,0.1)] ${
                    index === 0
                      ? "justify-between border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,247,237,0.96),rgba(254,243,199,0.88))] shadow-[0_18px_40px_rgba(217,119,6,0.12)] lg:row-span-2 lg:min-h-[22rem]"
                      : index === 1
                        ? "border-emerald-200/80 bg-[linear-gradient(145deg,rgba(236,253,245,0.96),rgba(255,255,255,0.92))] shadow-[0_12px_30px_rgba(22,163,74,0.08)]"
                        : index === 2
                          ? "border-sky-200/80 bg-[linear-gradient(145deg,rgba(240,249,255,0.96),rgba(255,255,255,0.92))] shadow-[0_12px_30px_rgba(2,132,199,0.08)]"
                          : "border-rose-200/80 bg-[linear-gradient(145deg,rgba(255,241,242,0.96),rgba(255,255,255,0.92))] shadow-[0_12px_30px_rgba(225,29,72,0.08)]"
                  }`}
                >
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                        index === 0
                          ? "text-amber-800"
                          : index === 1
                            ? "text-emerald-700"
                            : index === 2
                              ? "text-sky-700"
                              : "text-rose-700"
                      }`}
                    >
                      {item.cta}
                    </p>
                    <h3 className={`mt-3 font-serif ${index === 0 ? "text-4xl" : "text-2xl"} text-stone-950`}>{item.title}</h3>
                    <p className={`mt-3 text-sm leading-7 ${index === 0 ? "max-w-md text-stone-700" : "text-stone-600"}`}>{item.description}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition group-hover:border-amber-300 group-hover:bg-amber-100 group-hover:text-amber-950"
                    >
                      Отвори секцията
                    </span>
                    <span className="text-sm font-semibold text-stone-500 transition group-hover:text-stone-800">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="grid gap-6 lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(254,243,199,0.72),rgba(255,255,255,0.94))] p-8 shadow-[0_20px_80px_rgba(56,44,24,0.08)] xl:p-9">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Профил</p>
              <dl className="mt-6 grid gap-5">
                <div className="rounded-[1.4rem] border border-black/8 bg-white/90 px-5 py-4 shadow-[0_10px_24px_rgba(56,44,24,0.04)]">
                  <dt className="text-xs uppercase tracking-[0.18em] text-stone-600">Име</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-950">{session.user.name ?? "Няма въведено"}</dd>
                </div>
                <div className="rounded-[1.4rem] border border-black/8 bg-white/90 px-5 py-4 shadow-[0_10px_24px_rgba(56,44,24,0.04)]">
                  <dt className="text-xs uppercase tracking-[0.18em] text-stone-600">Имейл</dt>
                  <dd className="mt-1 break-all text-lg font-semibold text-stone-950">{session.user.email ?? "Няма въведен"}</dd>
                </div>
                <div className="rounded-[1.4rem] border border-black/8 bg-white/90 px-5 py-4 shadow-[0_10px_24px_rgba(56,44,24,0.04)]">
                  <dt className="text-xs uppercase tracking-[0.18em] text-stone-600">Роля</dt>
                  <dd className="mt-1 text-lg font-semibold text-stone-950">{localizedRole}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}