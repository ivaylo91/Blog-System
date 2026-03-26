import { auth, signOut } from "@/auth";
import { SiteFooter, SiteHeader } from "@/components/site-chrome-shell";

export async function SiteHeaderChrome() {
  const session = await auth();

  async function handleSignOut() {
    "use server";

    await signOut({ redirectTo: "/" });
  }

  return <SiteHeader isAuthenticated={Boolean(session?.user)} onSignOut={handleSignOut} />;
}

export async function SiteFooterChrome() {
  const currentYear = new Date().getFullYear();

  return <SiteFooter currentYear={currentYear} />;
}