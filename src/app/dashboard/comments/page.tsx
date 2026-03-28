import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CommentsListClient from "./CommentsListClient";

export const dynamic = "force-static";

export default async function AdminCommentsPage() {
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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Модерация на коментари</h1>

      <p className="mb-6">Последни коментари — изтрий нежеланото съдържание.</p>

      <CommentsListClient comments={serialized} />
    </div>
  );
}
