"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";

export type CreateRecipeActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const recipeFormSchema = z.object({
  title: z.string().min(3, "Заглавието трябва да е поне 3 символа."),
  slug: z
    .string()
    .min(3, "Уеб адресът трябва да е поне 3 символа.")
    .regex(/^[a-z0-9-]+$/, "Уеб адресът трябва да съдържа само малки латински букви, цифри и тирета."),
  excerpt: z.string().min(12, "Краткото описание трябва да е по-подробно."),
  content: z.string().min(24, "Подробното описание трябва да е по-подробно."),
  category: z.string().min(2, "Категорията е задължителна."),
  difficulty: z.enum(["Easy", "Medium", "Advanced"]),
  prepMinutes: z.coerce.number().int().min(0),
  cookMinutes: z.coerce.number().int().min(0),
  servings: z.coerce.number().int().min(1),
  published: z.boolean(),
  tags: z.string().optional(),
  ingredients: z.string().min(3, "Добави поне един продукт."),
  steps: z.string().min(3, "Добави поне една стъпка."),
});

const uploadsDirectory = path.join(process.cwd(), "public", "uploads", "recipes");
const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseLineList(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseIngredientLine(line: string) {
  const match = line.match(/^(.+?)\s+-\s+(.+)$/);

  return {
    amount: match?.[1]?.trim() ?? "На вкус",
    name: match?.[2]?.trim() ?? line,
  };
}

function isUploadPath(imagePath?: string | null) {
  return Boolean(imagePath && imagePath.startsWith("/uploads/recipes/"));
}

async function deleteUploadedImage(imagePath?: string | null) {
  if (!imagePath || !isUploadPath(imagePath)) {
    return;
  }

  const uploadedFilePath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
  await unlink(uploadedFilePath).catch(() => undefined);
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

function canManageRecipe(user: { id: string; role: Role }, authorId: string) {
  return user.role === "ADMIN" || user.id === authorId;
}

function createSuccessState(message: string): CreateRecipeActionState {
  return {
    status: "success",
    message,
  };
}

function createErrorState(message: string): CreateRecipeActionState {
  return {
    status: "error",
    message,
  };
}

function extractRecipeFormData(formData: FormData) {
  return {
    values: {
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      content: formData.get("content"),
      category: formData.get("category"),
      difficulty: formData.get("difficulty"),
      prepMinutes: formData.get("prepMinutes"),
      cookMinutes: formData.get("cookMinutes"),
      servings: formData.get("servings"),
      published: formData.get("published") === "on",
      tags: formData.get("tags"),
      ingredients: formData.get("ingredients"),
      steps: formData.get("steps"),
    },
    imageFile: formData.get("image"),
  };
}

function handleRecipeMutationError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return createErrorState("Рецепта с този уеб адрес вече съществува.");
  }

  return createErrorState(error instanceof Error ? error.message : "Неуспешна промяна по рецептата.");
}

function revalidateRecipePaths() {
  revalidatePath("/");
  revalidatePath("/recipes");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/recipes");
}

function getImageExtension(file: File) {
  const extensionByType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };

  const mimeExtension = extensionByType[file.type];

  if (mimeExtension) {
    return mimeExtension;
  }

  const fileExtension = path.extname(file.name || "").toLowerCase();
  return fileExtension || ".img";
}

async function saveRecipeImage(file: File) {
  if (file.size === 0) {
    return null;
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Изображението трябва да е JPG, PNG, WebP или SVG.");
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error("Изображението трябва да е до 5 MB.");
  }

  await mkdir(uploadsDirectory, { recursive: true });

  const fileName = `${randomUUID()}${getImageExtension(file)}`;
  const filePath = path.join(uploadsDirectory, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return `/uploads/recipes/${fileName}`;
}

export async function createRecipeAction(
  _initialState: CreateRecipeActionState,
  formData: FormData,
): Promise<CreateRecipeActionState> {
  const user = await getAuthorizedUser();

  if (!user) {
    return createErrorState("Трябва да си влязъл в профила си, за да създаваш рецепти.");
  }

  if (!process.env.DATABASE_URL) {
    return createErrorState("Задай DATABASE_URL и изпълни npm run db:push преди да създаваш рецепти.");
  }

  const { values, imageFile } = extractRecipeFormData(formData);

  const parsed = recipeFormSchema.safeParse(values);

  if (!parsed.success) {
    return createErrorState(parsed.error.issues[0]?.message ?? "Невалидни данни за рецептата.");
  }

  const categorySlug = toSlug(parsed.data.category);
  const tagList = parseLineList(parsed.data.tags ?? "");
  const ingredientList = parseLineList(parsed.data.ingredients);
  const stepList = parseLineList(parsed.data.steps);
  let uploadedImagePath: string | null = null;

  if (imageFile && !(imageFile instanceof File)) {
    return createErrorState("Невалиден файл за изображение.");
  }

  try {
    uploadedImagePath = imageFile instanceof File ? await saveRecipeImage(imageFile) : null;

    await prisma.recipe.create({
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        heroImage: uploadedImagePath,
        prepMinutes: parsed.data.prepMinutes,
        cookMinutes: parsed.data.cookMinutes,
        servings: parsed.data.servings,
        difficulty: parsed.data.difficulty,
        published: parsed.data.published,
        author: {
          connect: {
            id: user.id,
          },
        },
        category: {
          connectOrCreate: {
            where: { slug: categorySlug },
            create: {
              name: parsed.data.category,
              slug: categorySlug,
            },
          },
        },
        ingredients: {
          create: ingredientList.map((line, index) => ({
            ...parseIngredientLine(line),
            position: index,
          })),
        },
        steps: {
          create: stepList.map((line, index) => ({
            instructions: line,
            position: index,
          })),
        },
        tags: {
          create: tagList.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { slug: toSlug(tag) },
                create: {
                  name: tag,
                  slug: toSlug(tag),
                },
              },
            },
          })),
        },
      },
    });
  } catch (error) {
    await deleteUploadedImage(uploadedImagePath);
    return handleRecipeMutationError(error);
  }

  revalidateRecipePaths();

  return createSuccessState(
    uploadedImagePath
      ? parsed.data.published
        ? "Рецептата е създадена, изображението е качено и публикацията е публикувана."
        : "Рецептата е записана като чернова и изображението е качено успешно."
      : parsed.data.published
        ? "Рецептата е създадена и публикувана."
        : "Рецептата е записана като чернова.",
  );
}

export async function updateRecipeAction(
  _initialState: CreateRecipeActionState,
  formData: FormData,
): Promise<CreateRecipeActionState> {
  const user = await getAuthorizedUser();

  if (!user) {
    return createErrorState("Трябва да си влязъл в профила си, за да редактираш рецепти.");
  }

  if (!process.env.DATABASE_URL) {
    return createErrorState("Задай DATABASE_URL и изпълни npm run db:push преди да редактираш рецепти.");
  }

  const recipeId = formData.get("recipeId");

  if (typeof recipeId !== "string" || recipeId.trim().length === 0) {
    return createErrorState("Липсва идентификатор на рецептата.");
  }

  const existingRecipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, heroImage: true, authorId: true },
  });

  if (!existingRecipe) {
    return createErrorState("Рецептата не беше намерена.");
  }

  if (!canManageRecipe(user, existingRecipe.authorId)) {
    return createErrorState("Нямаш права да редактираш тази рецепта.");
  }

  const { values, imageFile } = extractRecipeFormData(formData);
  const parsed = recipeFormSchema.safeParse(values);

  if (!parsed.success) {
    return createErrorState(parsed.error.issues[0]?.message ?? "Невалидни данни за рецептата.");
  }

  if (imageFile && !(imageFile instanceof File)) {
    return createErrorState("Невалиден файл за изображение.");
  }

  const categorySlug = toSlug(parsed.data.category);
  const tagList = parseLineList(parsed.data.tags ?? "");
  const ingredientList = parseLineList(parsed.data.ingredients);
  const stepList = parseLineList(parsed.data.steps);
  let uploadedImagePath: string | null = null;

  try {
    uploadedImagePath = imageFile instanceof File ? await saveRecipeImage(imageFile) : null;

    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        heroImage: uploadedImagePath ?? existingRecipe.heroImage,
        prepMinutes: parsed.data.prepMinutes,
        cookMinutes: parsed.data.cookMinutes,
        servings: parsed.data.servings,
        difficulty: parsed.data.difficulty,
        published: parsed.data.published,
        category: {
          connectOrCreate: {
            where: { slug: categorySlug },
            create: {
              name: parsed.data.category,
              slug: categorySlug,
            },
          },
        },
        ingredients: {
          deleteMany: {},
          create: ingredientList.map((line, index) => ({
            ...parseIngredientLine(line),
            position: index,
          })),
        },
        steps: {
          deleteMany: {},
          create: stepList.map((line, index) => ({
            instructions: line,
            position: index,
          })),
        },
        tags: {
          deleteMany: {},
          create: tagList.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { slug: toSlug(tag) },
                create: {
                  name: tag,
                  slug: toSlug(tag),
                },
              },
            },
          })),
        },
      },
    });
  } catch (error) {
    await deleteUploadedImage(uploadedImagePath);
    return handleRecipeMutationError(error);
  }

  if (uploadedImagePath && existingRecipe.heroImage !== uploadedImagePath) {
    await deleteUploadedImage(existingRecipe.heroImage);
  }

  revalidateRecipePaths();
  revalidatePath(`/recipes/${parsed.data.slug}`);
  revalidatePath(`/dashboard/recipes/${parsed.data.slug}`);

  return createSuccessState(parsed.data.published ? "Рецептата е обновена успешно." : "Рецептата е обновена и остава като чернова.");
}

export async function deleteRecipeAction(formData: FormData) {
  const user = await getAuthorizedUser();

  if (!user || !process.env.DATABASE_URL) {
    return;
  }

  const recipeId = formData.get("recipeId");

  if (typeof recipeId !== "string" || recipeId.trim().length === 0) {
    return;
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, slug: true, heroImage: true, authorId: true },
  });

  if (!recipe) {
    return;
  }

  if (!canManageRecipe(user, recipe.authorId)) {
    return;
  }

  await prisma.recipe.delete({
    where: { id: recipe.id },
  });

  await deleteUploadedImage(recipe.heroImage);

  revalidateRecipePaths();
  revalidatePath(`/recipes/${recipe.slug}`);
  revalidatePath(`/dashboard/recipes/${recipe.slug}`);
}