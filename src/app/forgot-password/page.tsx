import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { sendMail } from "@/lib/mailer";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { rateLimit } from "@/lib/rate-limit";

export default async function ForgotPasswordPage() {
  async function handleRequest(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");

    // Rate-limit password reset requests
    try {
      const hdrs = await headers();
      const ip = (hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "local") as string;
      const rl = await rateLimit(`forgot:${ip}`, 3, 60_000);
      if (!rl.allowed) {
        redirect(buildAuthRedirectPath("/signin", { callbackUrl: "/" }));
      }
    } catch (err) {
      if (err && typeof err === "object" && "digest" in err) throw err; // re-throw redirect
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // don't reveal existence
      redirect(buildAuthRedirectPath("/signin", { callbackUrl: "/" }));
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.verificationToken.create({ data: { identifier: `pw:${email}`, token, expires } });

    const base = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendMail({ to: email, subject: "Нулиране на парола", html: `Нулирайте паролата тук: <a href="${resetUrl}">${resetUrl}</a>`, text: `Нулирайте паролата: ${resetUrl}` });
    }

    redirect(buildAuthRedirectPath("/signin", { callbackUrl: "/" }));
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <form action={handleRequest} className="rounded-2xl border bg-white p-6">
        <h1 className="font-serif text-2xl">Нулиране на парола</h1>
        <p className="mt-2 text-sm text-stone-700">Въведи имейла си и ще ти изпратим линк за нулиране на парола.</p>

        <label className="mt-4 block text-sm font-semibold">Имейл</label>
        <input name="email" type="email" required className="mt-1 w-full rounded-md border px-3 py-2" />

        <div className="mt-4">
          <button type="submit" className="rounded-full bg-amber-600 px-4 py-2 text-white">Изпрати</button>
        </div>
      </form>
    </main>
  );
}
