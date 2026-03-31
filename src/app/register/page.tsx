import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { RegisterForm } from "@/app/register/register-form";
import { buildAuthRedirectPath, resolveSafeCallbackUrl } from "@/lib/auth-redirect";
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
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth();
  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl = resolveSafeCallbackUrl(resolvedSearchParams.callbackUrl);

  if (session?.user) {
    redirect(callbackUrl);
  }

  async function registerWithEmail(formData: FormData) {
    "use server";

      // Basic IP rate limiting to slow down automated registration attempts
      try {
        const hdrs = headers();
        const ip = (hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "local") as string;
        const rl = rateLimit(`register:${ip}`, 5, 60_000);
        if (!rl.allowed) {
          redirect(
            buildAuthRedirectPath("/register", { error: "Rate limit exceeded. Try again later.", callbackUrl: redirectTo }),
          );
        }
      } catch (e) {
        // don't block registration on rate-limit internal errors
      }

    const redirectTo = resolveSafeCallbackUrl(formData.get("callbackUrl")?.toString());

    if (!process.env.DATABASE_URL) {
      redirect(buildAuthRedirectPath("/register", { error: "database", callbackUrl: redirectTo }));
    }

    const parsed = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      redirect(
        buildAuthRedirectPath("/register", {
          error: parsed.error.issues[0]?.message ?? "Невалидни данни.",
          callbackUrl: redirectTo,
        }),
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existingUser) {
      redirect(buildAuthRedirectPath("/register", { error: "Потребител с този имейл вече съществува.", callbackUrl: redirectTo }));
    }

    const passwordHash = await hash(parsed.data.password, 12);

    await prisma.user.create({
      try {
        const hdrs = await headers();
        const ip = (hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "local") as string;
        passwordHash,
      },
    });

    // create verification token and send email if SMTP configured
    try {
      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

      if (user) {
        const token = String(randomUUID());
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        await prisma.verificationToken.create({
          data: {
            identifier: parsed.data.email,
            token,
            expires,
          },
        });

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          const { sendMail } = await import("@/lib/mailer");
          const base = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
          const verifyUrl = `${base}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(parsed.data.email)}`;

          await sendMail({
            to: parsed.data.email,
            subject: "Потвърди имейла си",
            html: `Моля потвърди имейла си като посетиш: <a href="${verifyUrl}">${verifyUrl}</a>`,
            text: `Потвърди имейла си: ${verifyUrl}`,
          });
        }
      }
    } catch (err) {
      // fail silently — registration succeeds even if email fails
      console.warn("Failed to send verification email:", err);
    }

    redirect(buildAuthRedirectPath("/signin", { registered: "1", callbackUrl: redirectTo }));
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

        {resolvedSearchParams.callbackUrl?.startsWith("/recipes/") ? (
          <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            След регистрация ще можеш да влезеш и да се върнеш обратно към рецептата.
          </p>
        ) : null}

        <RegisterForm action={registerWithEmail} callbackUrl={callbackUrl} />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={buildAuthRedirectPath("/signin", { callbackUrl })}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-sky-200/80 bg-sky-50/90 px-6 py-3 font-serif text-sm font-semibold tracking-[0.08em] text-center text-sky-900 shadow-[0_10px_24px_rgba(2,132,199,0.12)] transition hover:border-sky-300 hover:bg-sky-100 hover:text-sky-950"
          >
            Имам профил
          </Link>
          <Link
            href="/"
            className="rounded-full border border-emerald-200/70 bg-emerald-50/85 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100/90 hover:text-emerald-950"
          >
            Към началото
          </Link>
        </div>
      </div>
    </main>
  );
}