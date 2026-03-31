import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Apply NextAuth auth middleware first, then attach security headers.
export default auth(function middleware(request) {
  const response = NextResponse.next();

  // Basic security headers
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=()");

  // A reasonably strict CSP — use report-only if requested by env
  const csp =
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:";

  if (process.env.CSP_REPORT_ONLY === '1') {
    response.headers.set('Content-Security-Policy-Report-Only', csp + "; report-uri /csp-report");
  } else {
    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
});

export const config = {
  matcher: ["/:path*"],
};
