"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRecipeAction, type CreateRecipeActionState } from "@/app/dashboard/recipes/actions";

const initialState: CreateRecipeActionState = {
  status: "idle",
  message: "",
};

export type DashboardRecipeFormValues = {
  recipeId?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  tags: string;
  ingredients: string;
  steps: string;
  published: boolean;
  imagePath?: string | null;
};

type DashboardRecipeFormProps = {
  action?: (state: CreateRecipeActionState, formData: FormData) => Promise<CreateRecipeActionState>;
  initialValues?: DashboardRecipeFormValues;
  mode?: "create" | "edit";
};

const inputClassName =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950 focus:ring-4 focus:ring-amber-100";

const sectionClassName = "grid gap-5 rounded-[1.75rem] border border-black/6 bg-stone-50 p-5 shadow-[0_10px_30px_rgba(56,44,24,0.04)] xl:gap-6 xl:p-7";

const transliterationMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sht",
  ъ: "a",
  ь: "y",
  ю: "yu",
  я: "ya",
};

function buildSlug(input: string) {
  const transliterated = input
    .trim()
    .toLowerCase()
    .split("")
    .map((character) => transliterationMap[character] ?? character)
    .join("");

  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const defaultValues: DashboardRecipeFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  difficulty: "Easy",
  prepMinutes: 15,
  cookMinutes: 30,
  servings: 4,
  tags: "",
  ingredients: "",
  steps: "",
  published: false,
  imagePath: null,
};

export function DashboardRecipeForm({
  action = createRecipeAction,
  initialValues = defaultValues,
  mode = "create",
}: DashboardRecipeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [slugValue, setSlugValue] = useState(initialValues.slug);
  const [slugEditedManually, setSlugEditedManually] = useState(initialValues.slug.length > 0);

  useEffect(() => {
    if (mode === "edit" && state.status === "success") {
      router.push("/dashboard/recipes");
      router.refresh();
    }
  }, [mode, router, state.status]);

  function handleTitleChange(title: string) {
    if (!slugEditedManually) {
      setSlugValue(buildSlug(title));
    }
  }

  function handleSlugChange(value: string) {
    const normalizedSlug = buildSlug(value);

    setSlugValue(normalizedSlug);
    setSlugEditedManually(normalizedSlug.length > 0);
  }

  const isEditMode = mode === "edit";

  return (
    <form action={formAction} className="grid gap-7 rounded-[2rem] border border-black/8 bg-white/90 p-8 shadow-[0_20px_80px_rgba(56,44,24,0.08)] xl:gap-8 xl:p-10">
      {initialValues.recipeId ? <input type="hidden" name="recipeId" value={initialValues.recipeId} /> : null}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{isEditMode ? "Редакция на рецепта" : "Нова рецепта"}</p>
        <h2 className="mt-2 font-serif text-3xl text-stone-950">{isEditMode ? "Обнови съществуваща рецепта" : "Добави нова рецепта в блога"}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
          {isEditMode
            ? "Промени текста, продуктите, стъпките или изображението. След запазване архивът ще се обнови автоматично."
            : "Попълни основната информация, продуктите и стъпките. След публикуване рецептата ще се появи в публичния архив."}
        </p>
      </div>

      <section className={sectionClassName}>
        <div className="flex flex-col gap-2 xl:max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Основна информация</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Заглавие
            <input
              name="title"
              required
              className={inputClassName}
              placeholder="Боб чорба по манастирски"
              defaultValue={initialValues.title}
              onChange={(event) => handleTitleChange(event.target.value)}
            />
            <span aria-hidden="true" className="text-xs leading-6 text-transparent select-none">
              Попълва се автоматично от заглавието. Можеш и да го редактираш ръчно с малки латински букви, цифри и тирета.
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Уеб адрес
            <input
              name="slug"
              required
              className={inputClassName}
              placeholder="bob-chorba-po-manastirski"
              value={slugValue}
              onChange={(event) => handleSlugChange(event.target.value)}
            />
            <span className="text-xs leading-6 text-stone-600">Попълва се автоматично от заглавието. Можеш и да го редактираш ръчно с малки латински букви, цифри и тирета.</span>
          </label>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Кратко описание
            <textarea name="excerpt" required rows={5} className={inputClassName} placeholder="Кратък текст за картите и предварителния преглед." defaultValue={initialValues.excerpt} />
          </label>

          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Подробно описание
            <textarea name="content" required rows={5} className={inputClassName} placeholder="По-дълго въведение за страницата на рецептата." defaultValue={initialValues.content} />
          </label>
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="flex flex-col gap-2 xl:max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Настройки на рецептата</p>
        </div>

        <label className="grid gap-2 rounded-[1.5rem] border border-black/6 bg-white/80 p-5 text-sm font-medium text-stone-700 shadow-[0_10px_24px_rgba(56,44,24,0.04)] xl:p-6">
          Изображение на рецептата
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className={`${inputClassName} file:mr-4 file:rounded-full file:border-0 file:bg-stone-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
          />
          <span className="text-xs leading-6 text-stone-600">
            {initialValues.imagePath
              ? `Текущо изображение: ${initialValues.imagePath}. Качи нов файл само ако искаш да го замениш.`
              : "По избор. Качи JPG, PNG, WebP или SVG до 5 MB."}
          </span>
        </label>

        <div className="grid gap-5 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Категория
            <input name="category" required className={inputClassName} placeholder="Основни ястия" defaultValue={initialValues.category} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Трудност
            <select name="difficulty" defaultValue={initialValues.difficulty} className={inputClassName}>
              <option value="Easy">Лесно</option>
              <option value="Medium">Средно</option>
              <option value="Advanced">За напреднали</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Минути за подготовка
            <input name="prepMinutes" type="number" min="0" defaultValue={initialValues.prepMinutes} className={inputClassName} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Минути за готвене
            <input name="cookMinutes" type="number" min="0" defaultValue={initialValues.cookMinutes} className={inputClassName} />
          </label>
        </div>

        <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Порции
            <input name="servings" type="number" min="1" defaultValue={initialValues.servings} className={inputClassName} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Етикети
            <textarea name="tags" rows={4} className={inputClassName} placeholder={"Бързо\nДомашно\nЗа делник"} defaultValue={initialValues.tags} />
          </label>
        </div>

        <label className="flex items-start gap-4 rounded-[1.5rem] border border-black/6 bg-white/80 p-5 text-sm text-stone-700 shadow-[0_10px_24px_rgba(56,44,24,0.04)] xl:p-6">
          <input
            name="published"
            type="checkbox"
            defaultChecked={initialValues.published}
            className="mt-1 h-5 w-5 rounded border border-black/20 text-emerald-700 focus:ring-emerald-200"
          />
          <span className="grid gap-1">
            <span className="font-semibold text-stone-900">Публикувай рецептата</span>
            <span className="text-xs leading-6 text-stone-600">
              Когато отметката е изключена, рецептата остава като чернова и няма да се показва в публичния архив.
            </span>
          </span>
        </label>
      </section>

      <section className={sectionClassName}>
        <div className="flex flex-col gap-2 xl:max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Съдържание</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-6">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Продукти
            <textarea
              name="ingredients"
              required
              rows={10}
              className={inputClassName}
              placeholder={"500 г - боб\n1 глава - лук\n1 бр. - морков"}
              defaultValue={initialValues.ingredients}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Стъпки
            <textarea
              name="steps"
              required
              rows={10}
              className={inputClassName}
              placeholder={"Запържи зеленчуците до омекване.\nДобави водата и остави да къкри.\nПоднеси горещо с пресен магданоз."}
              defaultValue={initialValues.steps}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-black/8 bg-stone-100 p-5 shadow-[0_12px_28px_rgba(56,44,24,0.05)] sm:flex-row sm:items-center sm:justify-between xl:px-6 xl:py-5">
        <p
          aria-live="polite"
          className={`min-h-6 text-sm font-medium ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}
        >
          {state.message || ""}
        </p>
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-400 sm:w-auto ${
            isEditMode
              ? "bg-stone-950 hover:bg-stone-800"
              : "border border-green-900/20 bg-green-700 shadow-[0_12px_28px_rgba(21,128,61,0.22)] hover:bg-green-800"
          }`}
        >
          {pending ? "Запазване..." : isEditMode ? "Запази промените" : "Запази рецептата"}
        </button>
      </div>
    </form>
  );
}