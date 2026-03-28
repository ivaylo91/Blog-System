import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";

type ResetProps = {
  searchParams?: { token?: string; email?: string };
};

export default async function ResetPasswordPage({ searchParams }: ResetProps) {
  const token = searchParams?.token;
  const email = searchParams?.email;

  if (!token || !email) {
    return <p className="text-red-600">Невалиден линк.</p>;
  }

  async function handleReset(formData: FormData) {
    "use server";

    const newPassword = String(formData.get("password") ?? "");
    const emailValue = String(email);
    const tokenValue = String(token);
    if (newPassword.length < 8) return;

    const record = await prisma.verificationToken.findUnique({ where: { identifier_token: { identifier: `pw:${emailValue}`, token: tokenValue } } });
    if (!record || new Date(record.expires) < new Date()) {
      redirect(buildAuthRedirectPath("/signin", { callbackUrl: "/" }));
    }

    const passwordHash = await hash(newPassword, 12);
    await prisma.user.update({ where: { email: emailValue }, data: { passwordHash } });
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier: `pw:${emailValue}`, token: tokenValue } } });

    redirect(buildAuthRedirectPath("/signin", { callbackUrl: "/" }));
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <form action={handleReset} className="rounded-2xl border bg-white p-6">
        <h1 className="font-serif text-2xl">Нови парола</h1>
        <p className="mt-2 text-sm text-stone-700">Въведи новата си парола.</p>

        <label className="mt-4 block text-sm font-semibold">Нова парола</label>
        <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-md border px-3 py-2" />

        <div className="mt-4">
          <button type="submit" className="rounded-full bg-amber-600 px-4 py-2 text-white">Запази</button>
        </div>
      </form>
    </main>
  );
}
