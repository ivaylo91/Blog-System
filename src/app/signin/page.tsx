import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { z } from "zod";

export const metadata = {
  title: "Вход | Кулинарният блог на Иво",
  description: "Вход в Кулинарният блог на Иво с имейл и парола.",
};

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    registered?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const resolvedSearchParams = (await searchParams) ?? {};

  if (session?.user) {
    redirect("/dashboard");
  }

  async function signInWithCredentials(formData: FormData) {
    "use server";

    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      redirect("/signin?error=credentials");
    }

    try {
      await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/signin?error=credentials");
      }

      throw error;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-[0_30px_120px_rgba(56,44,24,0.16)] backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Добре дошъл отново
          </p>
          <h1 className="font-serif text-4xl text-stone-900">Влез в своя кулинарен профил</h1>
          <p className="text-sm leading-7 text-stone-600">
            Използвай имейл и парола, за да продължиш към своите рецепти.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {resolvedSearchParams.registered === "1" ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
              Профилът е създаден успешно. Влез с новите си данни.
            </p>
          ) : null}

          {resolvedSearchParams.error === "credentials" ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
              Невалиден имейл или парола.
            </p>
          ) : null}

          <form action={signInWithCredentials} className="space-y-3">
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
                minLength={5}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-950"
                placeholder="Минимум 5 символа"
              />
            </label>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#9a3412,#c2410c)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[linear-gradient(135deg,#7c2d12,#9a3412)]"
            >
              Влез
            </button>
          </form>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-medium text-stone-600">
          <Link href="/" className="transition hover:text-stone-950">
            Към началото
          </Link>
          <Link href="/register" className="transition hover:text-stone-950">
            Нямаш профил? Създай нов
          </Link>
        </div>
      </div>
    </main>
  );
}