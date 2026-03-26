"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type RecipeCommentActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const recipeCommentSchema = z.object({
  recipeSlug: z.string().min(1),
  body: z.string().min(8, "Коментарът трябва да е поне 8 символа.").max(1000, "Коментарът е твърде дълъг."),
  rating: z.coerce.number().int().min(1, "Избери оценка от 1 до 5.").max(5, "Избери оценка от 1 до 5."),
});

const recipeRatingSchema = z.object({
  recipeSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Избери оценка от 1 до 5.").max(5, "Избери оценка от 1 до 5."),
});

const recipeRatingClearSchema = z.object({
  recipeSlug: z.string().min(1),
});

function createErrorState(message: string): RecipeCommentActionState {
  return {
    status: "error",
    message,
  };
}

function createSuccessState(message: string): RecipeCommentActionState {
  return {
    status: "success",
    message,
  };
}

async function getAuthorizedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    role: session.user.role,
  };
}

function canManageComment(user: { id: string; role: string }, authorId: string) {
  return user.role === "ADMIN" || user.id === authorId;
}

async function findExistingTopLevelComment(recipeId: string, authorId: string) {
  return prisma.comment.findFirst({
    where: {
      recipeId,
      authorId,
      parentId: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      body: true,
    },
  });
}

async function findRecipeBySlug(recipeSlug: string) {
  return prisma.recipe.findUnique({
    where: { slug: recipeSlug },
    select: { id: true },
  });
}

export async function rateRecipeAction(
  _initialState: RecipeCommentActionState,
  formData: FormData,
): Promise<RecipeCommentActionState> {
  if (!process.env.DATABASE_URL) {
    return createErrorState("Оценките са достъпни след настройка на базата данни.");
  }

  const user = await getAuthorizedUser();

  if (!user) {
    return createErrorState("Трябва да влезеш в профила си, за да дадеш оценка.");
  }

  const intent = formData.get("intent");

  if (intent === "clear") {
    const parsed = recipeRatingClearSchema.safeParse({
      recipeSlug: formData.get("recipeSlug"),
    });

    if (!parsed.success) {
      return createErrorState("Рецептата не беше намерена.");
    }

    const recipe = await findRecipeBySlug(parsed.data.recipeSlug);

    if (!recipe) {
      return createErrorState("Рецептата не беше намерена.");
    }

    const existingComment = await findExistingTopLevelComment(recipe.id, user.id);

    if (!existingComment || existingComment.body.trim().length === 0 && existingComment.id.length === 0) {
      return createErrorState("Нямаш запазена оценка за премахване.");
    }

    if (existingComment.body.trim().length > 0) {
      await prisma.comment.update({
        where: { id: existingComment.id },
        data: {
          rating: null,
        },
      });
    } else {
      await prisma.comment.delete({
        where: { id: existingComment.id },
      });
    }

    revalidatePath(`/recipes/${parsed.data.recipeSlug}`);

    return createSuccessState("Оценката ти беше премахната.");
  }

  const parsed = recipeRatingSchema.safeParse({
    recipeSlug: formData.get("recipeSlug"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    return createErrorState(parsed.error.issues[0]?.message ?? "Невалидни данни за оценката.");
  }

  const recipe = await findRecipeBySlug(parsed.data.recipeSlug);

  if (!recipe) {
    return createErrorState("Рецептата не беше намерена.");
  }

  const existingComment = await findExistingTopLevelComment(recipe.id, user.id);

  if (existingComment) {
    await prisma.comment.update({
      where: { id: existingComment.id },
      data: {
        rating: parsed.data.rating,
      },
    });

    revalidatePath(`/recipes/${parsed.data.recipeSlug}`);

    return createSuccessState("Оценката ти беше обновена.");
  }

  await prisma.comment.create({
    data: {
      recipeId: recipe.id,
      authorId: user.id,
      body: "",
      rating: parsed.data.rating,
    },
  });

  revalidatePath(`/recipes/${parsed.data.recipeSlug}`);

  return createSuccessState("Оценката ти беше запазена.");
}

export async function addRecipeCommentAction(
  _initialState: RecipeCommentActionState,
  formData: FormData,
): Promise<RecipeCommentActionState> {
  if (!process.env.DATABASE_URL) {
    return createErrorState("Коментарите и оценките са достъпни след настройка на базата данни.");
  }

  const user = await getAuthorizedUser();

  if (!user) {
    return createErrorState("Трябва да влезеш в профила си, за да оставиш коментар и оценка.");
  }

  const parsed = recipeCommentSchema.safeParse({
    recipeSlug: formData.get("recipeSlug"),
    body: formData.get("body"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    return createErrorState(parsed.error.issues[0]?.message ?? "Невалидни данни за коментара.");
  }

  const recipe = await findRecipeBySlug(parsed.data.recipeSlug);

  if (!recipe) {
    return createErrorState("Рецептата не беше намерена.");
  }

  const existingComment = await findExistingTopLevelComment(recipe.id, user.id);

  if (existingComment) {
    await prisma.comment.update({
      where: { id: existingComment.id },
      data: {
        body: parsed.data.body.trim(),
        rating: parsed.data.rating,
      },
    });

    revalidatePath(`/recipes/${parsed.data.recipeSlug}`);

    return createSuccessState("Твоят коментар и оценка бяха обновени.");
  }

  await prisma.comment.create({
    data: {
      recipeId: recipe.id,
      authorId: user.id,
      body: parsed.data.body.trim(),
      rating: parsed.data.rating,
    },
  });

  revalidatePath(`/recipes/${parsed.data.recipeSlug}`);

  return createSuccessState("Коментарът и оценката бяха публикувани.");
}

export async function updateRecipeCommentAction(
  _initialState: RecipeCommentActionState,
  formData: FormData,
): Promise<RecipeCommentActionState> {
  if (!process.env.DATABASE_URL) {
    return createErrorState("Коментарите и оценките са достъпни след настройка на базата данни.");
  }

  const user = await getAuthorizedUser();

  if (!user) {
    return createErrorState("Трябва да влезеш в профила си, за да редактираш коментари.");
  }

  const commentId = formData.get("commentId");

  if (typeof commentId !== "string" || commentId.trim().length === 0) {
    return createErrorState("Липсва идентификатор на коментара.");
  }

  const parsed = recipeCommentSchema.safeParse({
    recipeSlug: formData.get("recipeSlug"),
    body: formData.get("body"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    return createErrorState(parsed.error.issues[0]?.message ?? "Невалидни данни за коментара.");
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      recipe: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!existingComment) {
    return createErrorState("Коментарът не беше намерен.");
  }

  if (!canManageComment(user, existingComment.authorId)) {
    return createErrorState("Нямаш права да редактираш този коментар.");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      body: parsed.data.body.trim(),
      rating: parsed.data.rating,
    },
  });

  revalidatePath(`/recipes/${existingComment.recipe.slug}`);

  return createSuccessState("Коментарът беше обновен.");
}

export async function deleteRecipeCommentAction(formData: FormData) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const user = await getAuthorizedUser();

  if (!user) {
    return;
  }

  const commentId = formData.get("commentId");

  if (typeof commentId !== "string" || commentId.trim().length === 0) {
    return;
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      authorId: true,
      recipe: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!existingComment || !canManageComment(user, existingComment.authorId)) {
    return;
  }

  await prisma.comment.delete({
    where: { id: existingComment.id },
  });

  revalidatePath(`/recipes/${existingComment.recipe.slug}`);
}