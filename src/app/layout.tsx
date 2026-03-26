import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { SiteFooterChrome, SiteHeaderChrome } from "@/components/site-chrome";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Кулинарният блог на Иво",
  description: "A cooking blog system built with Next.js, Tailwind CSS, PostgreSQL, Prisma, and Auth.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeaderChrome />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooterChrome />
      </body>
    </html>
  );
}
