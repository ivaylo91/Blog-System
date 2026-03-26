import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAllRecipes as getSampleRecipes, getRecipeBySlug as getSampleRecipeBySlug } from "@/data/recipes";

export type AppRecipe = {
  slug: string;
  title: string;
  imagePath: string;
  excerpt: string;
  description: string;
  category: string;
  categorySlug: string;
  difficulty: "Лесно" | "Средно" | "За напреднали";
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  publishedAt: string;
  author: string;
  heroPalette: {
    from: string;
    via: string;
    to: string;
  };
  tags: string[];
  ingredients: Array<{
    amount: string;
    name: string;
  }>;
  steps: Array<{
    title: string;
    description: string;
  }>;
};

const categoryImagePaths: Record<string, string> = {
  zakuski: "/recipes/banitsa.svg",
  salati: "/recipes/shopska.svg",
  "osnovni-yastiya": "/recipes/kavarma.svg",
};

function resolveImagePath(slug: string, categorySlug: string, heroImage?: string | null) {
  if (heroImage) {
    return heroImage;
  }

  const sampleImageBySlug: Record<string, string> = {
    "banitsa-sas-sirene": "/recipes/banitsa.svg",
    "shopska-salata": "/recipes/shopska.svg",
    "svinska-kavarma": "/recipes/kavarma.svg",
  };

  return sampleImageBySlug[slug] ?? categoryImagePaths[categorySlug] ?? "/recipes/default.svg";
}

export type DashboardRecipeSummary = {
  id: string | null;
  authorId: string | null;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  updatedAt: string;
  source: "database" | "sample";
};

const categoryPalettes: Record<string, AppRecipe["heroPalette"]> = {
  dinner: { from: "#7c2d12", via: "#c2410c", to: "#fde68a" },
  seafood: { from: "#164e63", via: "#0f766e", to: "#a7f3d0" },
  chicken: { from: "#78350f", via: "#b45309", to: "#fdba74" },
  breakfast: { from: "#854d0e", via: "#f59e0b", to: "#fde68a" },
  dessert: { from: "#7c2d12", via: "#ea580c", to: "#fdba74" },
  zakuski: { from: "#92400e", via: "#d97706", to: "#fde68a" },
  salati: { from: "#166534", via: "#16a34a", to: "#bef264" },
  "osnovni-yastiya": { from: "#7c2d12", via: "#b45309", to: "#fdba74" },
};

function defaultPalette(categorySlug: string): AppRecipe["heroPalette"] {
  return categoryPalettes[categorySlug] ?? {
    from: "#292524",
    via: "#57534e",
    to: "#d6d3d1",
  };
}

function normalizeDifficulty(value?: string | null): AppRecipe["difficulty"] {
  if (value === "Лесно" || value === "Средно" || value === "За напреднали") {
    return value;
  }

  if (value === "Easy") {
    return "Лесно";
  }

  if (value === "Medium") {
    return "Средно";
  }

  if (value === "Advanced") {
    return "За напреднали";
  }

  return "Лесно";
}

function hasDatabaseConfig() {
  return Boolean(process.env.DATABASE_URL);
}

function mapSampleRecipes(): AppRecipe[] {
  return getSampleRecipes();
}

async function mapDatabaseRecipes(): Promise<AppRecipe[]> {
  const databaseRecipes = await prisma.recipe.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      author: true,
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

  return databaseRecipes.map((recipe) => ({
    slug: recipe.slug,
    title: recipe.title,
    imagePath: resolveImagePath(recipe.slug, recipe.category?.slug ?? "uncategorized", recipe.heroImage),
    excerpt: recipe.excerpt ?? "Нова рецепта от кухнята на Кулинарният блог на Иво.",
    description: recipe.content ?? recipe.excerpt ?? recipe.title,
    category: recipe.category?.name ?? "Без категория",
    categorySlug: recipe.category?.slug ?? "uncategorized",
    difficulty: normalizeDifficulty(recipe.difficulty),
    prepMinutes: recipe.prepMinutes ?? 0,
    cookMinutes: recipe.cookMinutes ?? 0,
    servings: recipe.servings ?? 1,
    publishedAt: recipe.createdAt.toISOString().slice(0, 10),
    author: recipe.author.name ?? recipe.author.email ?? "Кулинарният блог на Иво",
    heroPalette: defaultPalette(recipe.category?.slug ?? "uncategorized"),
    tags: recipe.tags.map((recipeTag) => recipeTag.tag.name),
    ingredients: recipe.ingredients.map((ingredient) => ({
      amount: ingredient.amount ?? "На вкус",
      name: ingredient.name,
    })),
    steps: recipe.steps.map((step, index) => ({
      title: `Стъпка ${index + 1}`,
      description: step.instructions,
    })),
  }));
}

export async function getRecipes() {
  noStore();

  if (!hasDatabaseConfig()) {
    return mapSampleRecipes();
  }

  try {
    return await mapDatabaseRecipes();
  } catch {
    return mapSampleRecipes();
  }
}

export async function getFeaturedRecipes() {
  const recipes = await getRecipes();
  return recipes.slice(0, 3);
}

export async function getRecipeBySlug(slug: string) {
  const recipes = await getRecipes();
  return recipes.find((recipe) => recipe.slug === slug) ?? getSampleRecipeBySlug(slug);
}

export async function getRelatedRecipes(slug: string, categorySlug: string) {
  const recipes = await getRecipes();
  return recipes
    .filter((recipe) => recipe.slug !== slug)
    .filter((recipe) => recipe.categorySlug === categorySlug)
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export async function getDashboardRecipes(): Promise<DashboardRecipeSummary[]> {
  noStore();

  if (!hasDatabaseConfig()) {
    return mapSampleRecipes().map((recipe) => ({
      id: null,
      authorId: null,
      slug: recipe.slug,
      title: recipe.title,
      category: recipe.category,
      published: true,
      updatedAt: recipe.publishedAt,
      source: "sample",
    }));
  }

  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: [{ updatedAt: "desc" }],
      include: { category: true },
    });

    return recipes.map((recipe) => ({
      id: recipe.id,
      authorId: recipe.authorId,
      slug: recipe.slug,
      title: recipe.title,
      category: recipe.category?.name ?? "Без категория",
      published: recipe.published,
      updatedAt: recipe.updatedAt.toISOString().slice(0, 10),
      source: "database",
    }));
  } catch {
    return mapSampleRecipes().map((recipe) => ({
      id: null,
      authorId: null,
      slug: recipe.slug,
      title: recipe.title,
      category: recipe.category,
      published: true,
      updatedAt: recipe.publishedAt,
      source: "sample",
    }));
  }
}