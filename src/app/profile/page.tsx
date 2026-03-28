import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(buildAuthRedirectPath("/signin", { callbackUrl: "/profile" }));
  }

  const user = session.user;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <section className="rounded-2xl border border-black/8 bg-white/90 px-6 py-6 shadow-[0_18px_60px_rgba(56,44,24,0.06)]">
        <h1 className="font-serif text-2xl text-stone-950">Моят профил</h1>
        <p className="mt-2 text-sm text-stone-700">Актуализирай твоето име и профилна снимка.</p>

        <div className="mt-6">
          <ProfileForm initialName={user.name ?? ""} initialEmail={user.email ?? ""} initialImage={user.image ?? null} />
        </div>
      </section>
    </main>
  );
}
