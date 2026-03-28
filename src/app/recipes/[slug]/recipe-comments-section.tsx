import Link from "next/link";
import { auth } from "@/auth";
import { RecipeCommentCard } from "@/app/recipes/[slug]/recipe-comment-card";
import { RecipeCommentForm } from "@/app/recipes/[slug]/recipe-comment-form";
import { RecipeRatingForm } from "@/app/recipes/[slug]/recipe-rating-form";
import { prisma } from "@/lib/prisma";

type RecipeCommentsSectionProps = {
  recipeSlug: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={index < rating ? "text-amber-500" : "text-stone-300"}>
      ★
    </span>
  ));
}

export async function RecipeCommentsSection({ recipeSlug }: RecipeCommentsSectionProps) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const session = await auth();
  const recipe = await prisma.recipe.findUnique({
    where: { slug: recipeSlug },
    select: {
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!recipe) {
    return null;
  }

  const existingViewerComment = session?.user?.id
    ? recipe.comments.find((comment) => comment.authorId === session.user.id)
    : null;
  const commentsWithBody = recipe.comments.filter((comment) => comment.body.trim().length > 0);

  const ratings = recipe.comments.map((comment) => comment.rating).filter((rating): rating is number => typeof rating === "number");
  const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

  return (
    <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <aside className="grid gap-5 rounded-[2rem] border border-black/8 bg-white/85 p-8 shadow-[0_18px_60px_rgba(56,44,24,0.06)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Оценка на рецептата</p>
          <h2 className="mt-2 font-serif text-3xl text-stone-950">Какво казват читателите</h2>
        </div>

        <div className="rounded-[1.75rem] bg-stone-50 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Средна оценка</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="font-serif text-5xl text-stone-950">{averageRating ? averageRating.toFixed(1) : "—"}</span>
            <span className="pb-2 text-sm text-stone-500">/ 5</span>
          </div>
          <div className="mt-3 flex text-xl">{renderStars(Math.round(averageRating ?? 0))}</div>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            {ratings.length > 0 ? `${ratings.length} оценки и ${commentsWithBody.length} коментара от общността.` : "Все още няма оценки. Бъди първият, който ще сподели мнение."}
          </p>
          {session?.user && typeof existingViewerComment?.rating === "number" ? (
            <p className="mt-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
              Твоята оценка: {existingViewerComment.rating} / 5.
            </p>
          ) : null}
        </div>

        {session?.user ? (
          <>
            <RecipeRatingForm key={`${recipeSlug}-${existingViewerComment?.rating ?? 0}`} recipeSlug={recipeSlug} initialRating={existingViewerComment?.rating ?? 0} />
            <RecipeCommentForm
              recipeSlug={recipeSlug}
              commentId={existingViewerComment?.id}
              initialBody={existingViewerComment?.body ?? ""}
              initialRating={existingViewerComment?.rating ?? 5}
              existingCommentHasText={Boolean(existingViewerComment?.body.trim())}
              submitLabel={existingViewerComment?.body.trim() ? "Обнови коментара си" : "Публикувай коментар"}
            />
          </>
        ) : (
          <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-7 text-amber-900">
            За да оставиш оценка или коментар, влез в профила си.
            <div className="mt-4">
              <Link
                href={`/signin?callbackUrl=${encodeURIComponent(`/recipes/${recipeSlug}`)}`}
                className="inline-flex rounded-full border border-amber-200/80 bg-amber-50/90 px-5 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-amber-900 shadow-[0_10px_24px_rgba(217,119,6,0.12)] transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-950"
              >
                Вход за коментар
              </Link>
            </div>
          </div>
        )}
      </aside>

      <div className="rounded-[2rem] border border-black/8 bg-white/85 p-8 shadow-[0_18px_60px_rgba(56,44,24,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Коментари</p>
        <div className="mt-6 grid gap-4">
          {commentsWithBody.length > 0 ? (
            commentsWithBody.map((comment) => (
              <RecipeCommentCard
                key={comment.id}
                recipeSlug={recipeSlug}
                canManage={Boolean(session?.user && (session.user.role === "ADMIN" || session.user.id === comment.authorId))}
                comment={{
                  id: comment.id,
                  body: comment.body,
                  rating: comment.rating,
                  createdAtLabel: formatDate(comment.createdAt),
                  authorName: comment.author.name ?? comment.author.email ?? "Читател",
                }}
              />
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-stone-50 px-5 py-5 text-sm leading-7 text-stone-600">
              Все още няма коментари по тази рецепта. Напиши първото мнение и помогни на следващите читатели.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}