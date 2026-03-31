import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth configuration (no Node.js-only imports like Prisma or bcrypt).
 * Used by middleware. The full auth config in auth.ts extends this with the adapter and providers.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.SESSION_COOKIE_NAME ?? "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/signin",
  },
  trustHost: true,
  providers: [], // Providers are added in the full auth.ts config
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      if (nextUrl.pathname.startsWith("/dashboard")) {
        return Boolean(session?.user);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
