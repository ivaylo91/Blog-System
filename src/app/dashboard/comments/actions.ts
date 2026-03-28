"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const CommentIdSchema = z.string().min(1);

export async function deleteCommentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return;
  }

  // basic rate limit per admin user to prevent accidental floods
  const rl = rateLimit(`admin:${session.user.id}:deleteComment`, 10, 60_000);
  if (!rl.allowed) return;

  const commentId = formData.get("commentId");

  const parse = CommentIdSchema.safeParse(commentId);
  if (!parse.success) return;

  const id = parse.data;

  const existing = await prisma.comment.findUnique({ where: { id }, select: { id: true, recipe: { select: { slug: true } } } });

  if (!existing) return;
  try {
    await prisma.comment.delete({ where: { id } });
    // revalidate affected pages
    revalidatePath(`/recipes/${existing.recipe.slug}`);
    revalidatePath(`/dashboard`);
  } catch (err) {
    const { logger } = await import('@/lib/logger')
    logger.error(err)
  }
}
