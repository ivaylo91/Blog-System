import { hash } from "bcryptjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Името трябва да е поне 2 символа.").max(60),
    email: z.string().email("Въведи валиден имейл адрес."),
    password: z.string().min(8, "Паролата трябва да е поне 8 символа."),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролите не съвпадат.",
    path: ["confirmPassword"],
  });

export const metadata = {
  title: "Регистрация | Кулинарният блог на Иво",
  description: "Създай профил в Кулинарният блог на Иво с имейл и парола.",
};

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();
  const resolvedSearchParams = (await searchParams) ?? {};

  if (session?.user) {
    redirect("/dashboard");
  }

  async function registerWithEmail(formData: FormData) {
    "use server";

    if (!process.env.DATABASE_URL) {
      redirect("/register?error=database");
    }

    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Невалидни данни.")}`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      redirect("/register?error=Потребител с този имейл вече съществува.");
    }

    const passwordHash = await hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });

    redirect("/signin?registered=1");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-[0_30px_120px_rgba(56,44,24,0.16)] backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Нов профил
          </p>
          <h1 className="font-serif text-4xl text-stone-900">Създай своя профил</h1>
          <p className="text-sm leading-7 text-stone-600">
            Регистрирай се с имейл и парола, за да запазваш любимите си рецепти и по-лесно да се връщаш към тях.
          </p>
        </div>

        {resolvedSearchParams.error ? (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
            {resolvedSearchParams.error === "database"
              ? "За регистрация е нужна активна DATABASE_URL връзка към базата данни."
              : resolvedSearchParams.error}
          </p>
        ) : null}

        <form action={registerWithEmail} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Име
            <input
              name="name"
              type="text"
              required
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
              placeholder="Иво"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Имейл
            <input
              name="email"
              type="email"
              required
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
              placeholder="ivo@example.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Парола
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
              placeholder="Минимум 8 символа"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-stone-700">
            Потвърди паролата
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
              placeholder="Повтори паролата"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-[linear-gradient(135deg,#047857,#10b981)] px-6 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-emerald-50 shadow-[0_12px_28px_rgba(16,185,129,0.24)] transition hover:bg-[linear-gradient(135deg,#065f46,#059669)]"
          >
            Създай профил
          </button>
        </form>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signin"
            className="rounded-full bg-[linear-gradient(135deg,#0369a1,#0284c7)] px-6 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-sky-50 shadow-[0_12px_28px_rgba(2,132,199,0.2)] transition hover:bg-[linear-gradient(135deg,#075985,#0369a1)]"
          >
            Имам профил
          </Link>
          <Link
            href="/"
            className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-black/20"
          >
            Към началото
          </Link>
        </div>
      </div>
    </main>
  );
}