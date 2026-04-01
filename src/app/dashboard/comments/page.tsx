import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CommentsListClient from "./CommentsListClient";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (!hasDatabase) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-10">
        <h1 className="font-serif text-2xl">Модерация на коментари</h1>
        <p className="text-sm text-red-700">Базата данни не е конфигурирана. Коментарите не могат да бъдат заредени.</p>
        <Link href="/dashboard" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">
          Към таблото
        </Link>
      </main>
    );
  }

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true, email: true } }, recipe: { select: { id: true, title: true, slug: true } } },
    take: 100,
  });

  const serialized = comments.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    author: { name: c.author?.name ?? null, email: c.author?.email ?? null },
    recipe: { slug: c.recipe.slug, title: c.recipe.title },
  }));

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(217,119,6,0.16)_0%,_rgba(217,119,6,0)_70%)] blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(22,101,52,0.14)_0%,_rgba(22,101,52,0)_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-12 xl:gap-10 xl:px-8">
        <section className="overflow-hidden rounded-[2.25rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,250,243,0.9),rgba(255,247,237,0.96))] text-stone-900 shadow-[0_30px_100px_rgba(56,44,24,0.12)]">
          <div className="px-8 py-10 xl:px-12 xl:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Модерация</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight lg:text-5xl">Модерация на коментари</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
              Последни коментари — изтрий нежеланото съдържание.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-black/12 bg-white px-5 py-3 text-sm font-semibold text-stone-800 shadow-[0_10px_24px_rgba(56,44,24,0.05)] transition hover:border-black/15 hover:bg-stone-50"
              >
                Към таблото
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-black/8 bg-white/80 p-8 shadow-[0_20px_60px_rgba(56,44,24,0.06)] backdrop-blur xl:p-10">
          <CommentsListClient comments={serialized} />
        </section>
      </div>
    </main>
  );
}
