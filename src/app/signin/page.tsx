import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SignInCredentialsForm } from "@/app/signin/sign-in-credentials-form";
import { buildAuthRedirectPath, resolveSafeCallbackUrl } from "@/lib/auth-redirect";
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
    callbackUrl?: string;
    error?: string;
    registered?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl = resolveSafeCallbackUrl(resolvedSearchParams.callbackUrl);
  const googleAuthEnabled = Boolean(process.env.DATABASE_URL && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  if (session?.user) {
    redirect(callbackUrl);
  }

  async function signInWithCredentials(formData: FormData) {
    "use server";

    const redirectTo = resolveSafeCallbackUrl(formData.get("callbackUrl")?.toString());

    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      redirect(buildAuthRedirectPath("/signin", { error: "credentials", callbackUrl: redirectTo }));
    }

    // rate-limit by IP to mitigate brute-force attempts
    try {
      const { headers } = await import("next/headers");
      const hdrs = await headers();
      const ip = (hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "local") as string;
      const { rateLimit } = await import("@/lib/rate-limit");
      const rl = await rateLimit(`signin:${ip}`, 10, 60_000);
      if (!rl.allowed) {
        redirect(buildAuthRedirectPath("/signin", { error: "Rate limit exceeded. Try again later.", callbackUrl: redirectTo }));
      }
    } catch {
      // continue if rate-limit helpers fail
    }

    try {
      await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        callbackUrl: redirectTo,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(buildAuthRedirectPath("/signin", { error: "credentials", callbackUrl: redirectTo }));
      }

      throw error;
    }
  }

  async function signInWithGoogle(formData: FormData) {
    "use server";

    const redirectTo = resolveSafeCallbackUrl(formData.get("callbackUrl")?.toString());

    await signIn("google", {
      callbackUrl: redirectTo,
    });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
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

          {resolvedSearchParams.callbackUrl?.startsWith("/recipes/") ? (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              След вход ще се върнеш обратно към рецептата.
            </p>
          ) : null}

          {googleAuthEnabled ? (
            <form action={signInWithGoogle}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-black/15 hover:bg-stone-50"
              >
                Продължи с Google
              </button>
            </form>
          ) : null}

          <SignInCredentialsForm action={signInWithCredentials} callbackUrl={callbackUrl} />
        </div>

          <div className="mt-8 flex items-center gap-3 text-sm font-medium max-[420px]:flex-col max-[420px]:items-stretch">
          <Link
            href="/"
            className="whitespace-nowrap rounded-full border border-emerald-200/80 bg-emerald-50 px-5 py-2.5 text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-950"
          >
            Към началото
          </Link>
          <Link
            href={buildAuthRedirectPath("/register", { callbackUrl })}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition border border-rose-200/70 bg-rose-50/85 text-rose-800 hover:border-rose-300 hover:bg-rose-100/90 hover:text-rose-950"
          >
            Нямаш профил? Създай нов
          </Link>
        </div>
      </div>
    </main>
  );
}