"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { FaSignOutAlt } from "react-icons/fa";

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

function isSingleRecipe(pathname: string) {
  return pathname !== "/recipes" && pathname.startsWith("/recipes/");
}

function getDashboardHeaderClass(href: string) {
  switch (href) {
    case "/":
      return "rounded-full bg-[linear-gradient(135deg,#166534,#16a34a)] px-4 py-2 text-sm font-semibold text-emerald-50 shadow-[0_10px_24px_rgba(22,101,52,0.22)]";
    case "/recipes":
      return "rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(217,119,6,0.22)]";
    case "/dashboard":
      return "rounded-full bg-[linear-gradient(135deg,#0ea5e9,#0369a1)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(2,132,199,0.22)]";
    case "signout":
      return "rounded-full bg-[linear-gradient(135deg,#be185d,#fb7185)] px-4 py-2 text-sm font-semibold text-rose-50 shadow-[0_10px_24px_rgba(190,24,93,0.22)]";
    default:
      return "rounded-full bg-[linear-gradient(135deg,#b45309,#d97706)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_24px_rgba(180,83,9,0.22)]";
  }
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


  const dashboardActive = isAuthenticated && isLinkActive(pathname, "/dashboard");

  // Hamburger menu state
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

        {/* Desktop nav */}
        <div className="flex items-center gap-3 lg:gap-4">
          <nav className="hidden items-center gap-2 lg:flex">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isDashboardRoute(pathname)
                    ? getDashboardHeaderClass(item.href)
                    : `rounded-full px-4 py-2 text-sm font-semibold transition ${getFooterLinkClassName(item.href, isLinkActive(pathname, item.href))}`
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={isDashboardRoute(pathname) ? getDashboardHeaderClass("/dashboard") : `rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
                      className={isDashboardRoute(pathname) ? `${getDashboardHeaderClass("signout")} flex items-center gap-2` : "rounded-full bg-[linear-gradient(135deg,#d97706,#ea580c)] px-4 py-2 text-sm font-semibold text-amber-50 shadow-[0_10px_22px_rgba(217,119,6,0.2)] transition hover:bg-[linear-gradient(135deg,#b45309,#c2410c)] flex items-center gap-2"}
                    >
                      <FaSignOutAlt className="text-lg" />
                      Изход
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className={`mr-2 rounded-full px-4 py-2 text-sm font-semibold transition ${getFooterLinkClassName("/signin", isLinkActive(pathname, "/signin"))}`}
                >
                  Вход
                </Link>
                {pathname !== "/register" && (
                  <Link
                    href="/register"
                    className={`mr-1 rounded-full px-4 py-2 text-sm font-semibold transition ${getFooterLinkClassName("/register", isLinkActive(pathname, "/register"))}`}
                  >
                    Регистрация
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Hamburger menu for mobile and tablet */}
          <div className="lg:hidden flex items-center">
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-2xl text-stone-800 hover:bg-stone-200 focus:outline-none"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute inset-x-4 top-20 z-50 rounded-xl border border-stone-200 bg-white/95 shadow-xl flex flex-col py-2 lg:inset-x-auto lg:right-4 lg:min-w-[180px]">
                {/* Mobile menu links show active state */}
                <Link
                  href="/"
                  className={isDashboardRoute(pathname) ? getDashboardHeaderClass("/") + " px-5 py-3 text-base font-semibold" : `px-5 py-3 text-base font-semibold transition ${getFooterLinkClassName('/', isLinkActive(pathname, '/'))}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Начало
                </Link>
                <Link
                  href="/recipes"
                  className={isDashboardRoute(pathname) ? getDashboardHeaderClass("/recipes") + " px-5 py-3 text-base font-semibold" : `px-5 py-3 text-base font-semibold transition ${getFooterLinkClassName('/recipes', isLinkActive(pathname, '/recipes'))}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Рецепти
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={isDashboardRoute(pathname) ? getDashboardHeaderClass("/dashboard") + " px-5 py-3 text-base font-semibold" : `px-5 py-3 text-base font-semibold transition ${isLinkActive(pathname, '/dashboard') ? 'text-amber-900 bg-amber-50/90' : 'text-stone-900 hover:bg-stone-100'}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Табло
                    </Link>
                    {onSignOut && (
                      <button
                        type="button"
                        className={isDashboardRoute(pathname) ? `${getDashboardHeaderClass("signout")} px-5 py-3 text-base font-semibold flex items-center gap-2` : "flex w-full items-center gap-2 px-5 py-3 text-base font-semibold text-amber-700 hover:bg-amber-100"}
                        onClick={async () => {
                          setMobileMenuOpen(false);
                          await onSignOut();
                        }}
                      >
                        <FaSignOutAlt className="text-lg" />
                        Изход
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className={`px-5 py-3 text-base font-semibold transition ${getFooterLinkClassName('/signin', isLinkActive(pathname, '/signin'))}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Вход
                    </Link>
                    {pathname !== "/register" && (
                      <Link
                        href="/register"
                        className={`px-5 py-3 text-base font-semibold transition ${getFooterLinkClassName('/register', isLinkActive(pathname, '/register'))}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Регистрация
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ currentYear, isAuthenticated }: Pick<SiteChromeShellProps, "currentYear" | "isAuthenticated">) {
  const pathname = usePathname();

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
            {!isSingleRecipe(pathname) && pathname !== "/register" && footerLinks
              .filter((item) => isAuthenticated ? item.href !== "/signin" && item.href !== "/register" : true)
              .map((item) => (
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