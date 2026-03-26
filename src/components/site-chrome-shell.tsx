"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";

const primaryLinks = [
  { href: "/", label: "Начало" },
  { href: "/recipes", label: "Рецепти" },
];

const footerLinks = [
  { href: "/", label: "Начало" },
  { href: "/recipes", label: "Архив" },
  { href: "/signin", label: "Вход" },
  { href: "/register", label: "Регистрация" },
];

const dashboardFooterLinks = [
  { href: "/dashboard", label: "Табло" },
  { href: "/dashboard/recipes", label: "Рецепти" },
  { href: "/dashboard/favorites", label: "Любими" },
  { href: "/recipes", label: "Публичен архив" },
  { href: "/", label: "Към сайта" },
];

const hiddenChromeRoutes = new Set(["/signin", "/register"]);

type SiteChromeShellProps = {
  isAuthenticated: boolean;
  currentYear: number;
  onSignOut?: () => Promise<void>;
};

function isLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function getNavLinkClassName(href: string, active: boolean) {
  if (href === "/") {
    return active
      ? "rounded-full bg-[linear-gradient(135deg,#166534,#16a34a)] px-4 py-2 text-sm font-semibold text-emerald-50 shadow-[0_10px_24px_rgba(22,101,52,0.22)]"
      : "rounded-full border border-emerald-200/70 bg-emerald-50/85 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100/90 hover:text-emerald-950";
  }

  if (href === "/recipes") {
    return active
      ? "rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(217,119,6,0.22)]"
      : "rounded-full border border-amber-200/70 bg-amber-50/85 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100/90 hover:text-amber-950";
  }

  if (href === "/dashboard") {
    return active
      ? "rounded-full bg-[linear-gradient(135deg,#b45309,#d97706)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(180,83,9,0.22)]"
      : "rounded-full border border-amber-200/70 bg-amber-50/85 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100/90 hover:text-amber-950";
  }

  return active
    ? "rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(28,25,23,0.18)]"
    : "rounded-full border border-stone-200/70 bg-white/85 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-100/90 hover:text-stone-950";
}

function getFooterLinkClassName(href: string, active: boolean) {
  if (href === "/") {
    return active
      ? "border border-emerald-300/70 bg-emerald-200/80 text-emerald-950 shadow-[0_10px_24px_rgba(22,101,52,0.12)]"
      : "border border-emerald-200/70 bg-emerald-50/85 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100/90 hover:text-emerald-950";
  }

  if (href === "/recipes") {
    return active
      ? "border border-amber-300/70 bg-amber-200/80 text-amber-950 shadow-[0_10px_24px_rgba(217,119,6,0.14)]"
      : "border border-amber-200/70 bg-amber-50/85 text-amber-800 hover:border-amber-300 hover:bg-amber-100/90 hover:text-amber-950";
  }

  if (href === "/signin") {
    return active
      ? "border border-sky-300/70 bg-sky-200/80 text-sky-950 shadow-[0_10px_24px_rgba(14,116,144,0.12)]"
      : "border border-sky-200/70 bg-sky-50/85 text-sky-800 hover:border-sky-300 hover:bg-sky-100/90 hover:text-sky-950";
  }

  if (href === "/register") {
    return active
      ? "border border-rose-300/70 bg-rose-200/80 text-rose-950 shadow-[0_10px_24px_rgba(190,24,93,0.12)]"
      : "border border-rose-200/70 bg-rose-50/85 text-rose-800 hover:border-rose-300 hover:bg-rose-100/90 hover:text-rose-950";
  }

  return active
    ? "border border-stone-300/70 bg-stone-200/80 text-stone-950 shadow-[0_10px_24px_rgba(41,37,36,0.1)]"
    : "border border-stone-200/70 bg-white/85 text-stone-700 hover:border-stone-300 hover:bg-stone-100/90 hover:text-stone-950";
}

export function SiteHeader({ isAuthenticated, onSignOut }: Omit<SiteChromeShellProps, "currentYear">) {
  const pathname = usePathname();

  if (hiddenChromeRoutes.has(pathname)) {
    return null;
  }

  const dashboardActive = isAuthenticated && isLinkActive(pathname, "/dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-[rgba(255,250,243,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark className="h-12 w-12 rounded-[1.25rem] shadow-[0_14px_32px_rgba(28,25,23,0.18)]" />
          <div>
            <p className="font-serif text-lg uppercase tracking-[0.16em] text-stone-950 sm:text-xl">
              Кулинарният блог на Иво
            </p>
            <p className="text-xs text-stone-600 sm:text-sm">Български рецепти за всеки ден</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 lg:gap-4">
          <nav className="hidden items-center gap-2 md:flex">
            {primaryLinks.map((item) => (
              <Link key={item.href} href={item.href} className={getNavLinkClassName(item.href, isLinkActive(pathname, item.href))}>
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Link href="/dashboard" className={getNavLinkClassName("/dashboard", dashboardActive)}>
                Табло
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition md:hidden ${
                    dashboardActive
                      ? "border-amber-700 bg-[linear-gradient(135deg,#b45309,#d97706)] text-amber-50"
                      : "border-amber-200/70 bg-amber-50/85 text-amber-800 hover:border-amber-300 hover:bg-amber-100/90 hover:text-amber-950"
                  }`}
                >
                  Табло
                </Link>
                {onSignOut ? (
                  <form action={onSignOut}>
                    <button
                      type="submit"
                      className="rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_22px_rgba(217,119,6,0.2)] transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
                    >
                      Изход
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isLinkActive(pathname, "/signin")
                      ? "border-stone-950 bg-stone-950 text-white"
                      : "border-black/10 bg-white/80 text-stone-800 hover:border-black/15 hover:bg-white"
                  }`}
                >
                  Вход
                </Link>
                <Link
                  href="/register"
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-[0_10px_22px_rgba(217,119,6,0.2)] transition ${
                    isLinkActive(pathname, "/register")
                      ? "bg-stone-950 text-white"
                      : "bg-[linear-gradient(135deg,#d97706,#ea580c)] text-amber-50 hover:bg-[linear-gradient(135deg,#b45309,#c2410c)]"
                  }`}
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ currentYear }: Pick<SiteChromeShellProps, "currentYear">) {
  const pathname = usePathname();

  if (hiddenChromeRoutes.has(pathname)) {
    return null;
  }

  if (isDashboardRoute(pathname)) {
    return (
      <footer className="mt-auto border-t border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,247,237,0.92))] text-stone-800">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] lg:px-8">
          <div className="space-y-3">
            <p className="font-serif text-2xl text-stone-950">Административна зона</p>
            <p className="max-w-2xl text-sm leading-7 text-stone-600">
              Управлявай рецептите, следи публикуваното съдържание и преминавай бързо между таблото и публичния архив.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
            {dashboardFooterLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-center text-sm font-semibold transition lg:px-5 lg:py-2.5 ${
                  item.href === "/dashboard" && isLinkActive(pathname, item.href)
                    ? "border-amber-700 bg-[linear-gradient(135deg,#b45309,#d97706)] text-amber-50 shadow-[0_10px_24px_rgba(180,83,9,0.22)]"
                    : isLinkActive(pathname, item.href)
                      ? "border-stone-300/70 bg-stone-200/80 text-stone-950 shadow-[0_10px_24px_rgba(41,37,36,0.1)]"
                      : item.href === "/dashboard"
                      ? "border-amber-200/70 bg-amber-50/85 text-amber-800 hover:border-amber-300 hover:bg-amber-100/90 hover:text-amber-950"
                      : item.href === "/dashboard/recipes" || item.href === "/dashboard/favorites"
                        ? "border-amber-200/70 bg-amber-50/85 text-amber-800 hover:border-amber-300 hover:bg-amber-100/90 hover:text-amber-950"
                        : item.href === "/recipes"
                          ? "border-emerald-200/70 bg-emerald-50/85 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100/90 hover:text-emerald-950"
                          : "border-sky-200/70 bg-sky-50/85 text-sky-800 hover:border-sky-300 hover:bg-sky-100/90 hover:text-sky-950"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-black/6 px-6 py-4 text-center text-sm text-stone-500 lg:px-8">
          {currentYear} Кулинарният блог на Иво. Панел за управление на съдържанието.
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,247,237,0.92))]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] lg:px-8">
        <div className="space-y-3">
          <p className="font-serif text-2xl text-stone-950">Кулинарният блог на Иво</p>
          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            Домашни български рецепти, сезонни идеи и познати вкусове, подредени така, че да ги намираш бързо и да се връщаш лесно към тях.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-center text-sm font-semibold transition lg:px-5 lg:py-2.5 ${getFooterLinkClassName(item.href, isLinkActive(pathname, item.href))}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-black/6 px-6 py-4 text-center text-sm text-stone-500 lg:px-8">
        {currentYear} Кулинарният блог на Иво. Домашна кухня, събрана на едно място.
      </div>
    </footer>
  );
}