import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

// Apply NextAuth auth middleware first, then attach security headers.
export async function middleware(request: NextRequest) {
  const response = await auth(request as any);

  // If auth returned a NextResponse, add security headers; otherwise return as-is.
  try {
    const res = (response as NextResponse) ?? NextResponse.next();

    // Basic security headers
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
    res.headers.set("Permissions-Policy", "geolocation=(), microphone=()",);
    // A reasonably strict CSP — use report-only if requested by env
    const csp =
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:";

    if (process.env.CSP_REPORT_ONLY === '1') {
      res.headers.set('Content-Security-Policy-Report-Only', csp + "; report-uri /csp-report");
    } else {
      res.headers.set('Content-Security-Policy', csp);
    }

    return res;
  } catch (err) {
    return response as Response;
  }
}

export const config = {
  matcher: ["/:path*"],
};