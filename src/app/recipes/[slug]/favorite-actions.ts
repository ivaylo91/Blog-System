"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type RecipeFavoriteActionState = {
  status: "idle" | "success" | "error";
  message: string;
  isFavorite: boolean;
  favoriteCount: number;
};

const toggleFavoriteSchema = z.object({
  recipeSlug: z.string().min(1),
});

function createErrorState(message: string, snapshot: Pick<RecipeFavoriteActionState, "isFavorite" | "favoriteCount">): RecipeFavoriteActionState {
  return {
    status: "error",
    message,
    ...snapshot,
  };
}

function createSuccessState(message: string, snapshot: Pick<RecipeFavoriteActionState, "isFavorite" | "favoriteCount">): RecipeFavoriteActionState {
  return {
    status: "success",
    message,
    ...snapshot,
  };
}

export async function toggleRecipeFavoriteAction(
  previousState: RecipeFavoriteActionState,
  formData: FormData,
): Promise<RecipeFavoriteActionState> {
  if (!process.env.DATABASE_URL) {
    return createErrorState("Любимите рецепти са достъпни след настройка на базата данни.", previousState);
  }

  const session = await auth();

  if (!session?.user?.id) {
    return createErrorState("Трябва да влезеш в профила си, за да запазваш рецепти.", previousState);
  }

  const parsed = toggleFavoriteSchema.safeParse({
    recipeSlug: formData.get("recipeSlug"),
  });

  if (!parsed.success) {
    return createErrorState("Рецептата не беше намерена.", previousState);
  }

  const recipe = await prisma.recipe.findFirst({
    where: {
      slug: parsed.data.recipeSlug,
      published: true,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!recipe) {
    return createErrorState("Рецептата не беше намерена.", previousState);
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_recipeId: {
        userId: session.user.id,
        recipeId: recipe.id,
      },
    },
    select: {
      recipeId: true,
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipe.id,
        },
      },
    });
  } else {
    await prisma.favorite.create({
      data: {
        userId: session.user.id,
        recipeId: recipe.id,
      },
    });
  }

  const favoriteCount = await prisma.favorite.count({
    where: {
      recipeId: recipe.id,
    },
  });

  revalidatePath(`/recipes/${parsed.data.recipeSlug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/favorites");

  return createSuccessState(
    existingFavorite ? `Премахна ${recipe.title} от любимите си рецепти.` : `Запази ${recipe.title} в любимите си рецепти.`,
    {
      isFavorite: !existingFavorite,
      favoriteCount,
    },
  );
}