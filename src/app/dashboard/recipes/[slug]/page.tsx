import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardRecipeForm, { type DashboardRecipeFormValues } from "@/app/dashboard/recipes/recipe-form";
import { updateRecipeAction } from "@/app/dashboard/recipes/actions";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeDifficulty(value?: string | null): DashboardRecipeFormValues["difficulty"] {
  if (value === "Medium") {
    return "Medium";
  }

  if (value === "Advanced") {
    return "Advanced";
  }

  return "Easy";
}

function canManageRecipe(user: { id: string; role: Role }, authorId: string) {
  return user.role === "ADMIN" || user.id === authorId;
}

export default async function DashboardEditRecipePage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (!process.env.DATABASE_URL) {
    redirect("/dashboard/recipes");
  }

  const { slug } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      category: true,
      ingredients: {
        orderBy: { position: "asc" },
      },
      steps: {
        orderBy: { position: "asc" },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!recipe) {
    notFound();
  }

  if (!canManageRecipe({ id: session.user.id, role: session.user.role }, recipe.authorId)) {
    redirect("/dashboard/recipes");
  }

  const initialValues: DashboardRecipeFormValues = {
    recipeId: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    excerpt: recipe.excerpt ?? "",
    content: recipe.content ?? "",
    category: recipe.category?.name ?? "",
    difficulty: normalizeDifficulty(recipe.difficulty),
    prepMinutes: recipe.prepMinutes ?? 0,
    cookMinutes: recipe.cookMinutes ?? 0,
    servings: recipe.servings ?? 1,
    tags: recipe.tags.map((recipeTag) => recipeTag.tag.name).join("\n"),
    ingredients: recipe.ingredients.map((ingredient) => `${ingredient.amount ?? "На вкус"} - ${ingredient.name}`).join("\n"),
    steps: recipe.steps.map((step) => step.instructions).join("\n"),
    published: recipe.published,
    imagePath: recipe.heroImage,
  };

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.16)_0%,_rgba(217,119,6,0)_70%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(22,101,52,0.14)_0%,_rgba(22,101,52,0)_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-12 xl:px-8">
        <section className="overflow-hidden rounded-[2.25rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,250,243,0.9),rgba(255,247,237,0.96))] text-stone-900 shadow-[0_30px_100px_rgba(56,44,24,0.12)]">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 xl:grid-cols-[minmax(0,1.1fr)_360px] xl:gap-10 xl:px-12 xl:py-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Редакция</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight lg:text-5xl">Обнови {recipe.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
                Промените тук се записват директно в PostgreSQL и се отразяват в публичния архив след запазване.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/recipes"
                  className="rounded-full border border-black/12 bg-white px-5 py-3 text-sm font-semibold text-stone-800 shadow-[0_10px_24px_rgba(56,44,24,0.05)] transition hover:border-black/15 hover:bg-stone-50"
                >
                  Назад към управлението
                </Link>
                {recipe.published ? (
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
                  >
                    Виж публичната страница
                  </Link>
                ) : (
                  <span className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-600">
                    Черновата не е публична
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:self-start">
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Категория</p>
                <p className="mt-2 font-serif text-3xl text-stone-950">{recipe.category?.name ?? "Без"}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Уеб адрес</p>
                <p className="mt-2 break-all text-sm text-stone-950">/{recipe.slug}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Статус</p>
                <p className="mt-2 font-serif text-3xl text-stone-950">{recipe.published ? "Публикувана" : "Чернова"}</p>
              </div>
              <div className="rounded-[1.75rem] border border-black/8 bg-white/90 px-5 py-5 shadow-[0_10px_24px_rgba(56,44,24,0.05)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">Последна промяна</p>
                <p className="mt-2 font-serif text-3xl text-stone-950">{recipe.updatedAt.toISOString().slice(0, 10)}</p>
              </div>
            </div>
          </div>
        </section>

        <DashboardRecipeForm action={updateRecipeAction} initialValues={initialValues} mode="edit" />
      </div>
    </main>
  );
}