import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";

type VerifyPageProps = {
  searchParams?: Promise<{ token?: string; email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const token = resolvedParams.token;
  const email = resolvedParams.email;

  if (!token || !email) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <p className="text-sm text-red-600">Невалиден линк за потвърждение.</p>
      </main>
    );
  }

  let failed = false;
  let expired = false;

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token } },
    });

    if (!record || new Date(record.expires) < new Date()) {
      expired = true;
    } else {
      await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
      await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } });
    }
  } catch {
    failed = true;
  }

  if (failed) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <p className="text-sm text-red-600">Грешка при потвърждаване на имейл.</p>
      </main>
    );
  }

  if (expired) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <p className="text-sm text-red-600">Линкът е изтекъл или е невалиден.</p>
      </main>
    );
  }

  // redirect to sign-in with verified message
  redirect(buildAuthRedirectPath("/signin", { registered: "1", callbackUrl: "/" }));
}
