import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";
// Apply NextAuth auth middleware first, then attach security headers.
export async function middleware(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (auth as any)(request);

  try {
    // If the auth middleware returned a NextResponse-like object, attach headers.
    const maybe = response as unknown;
    if (maybe && typeof (maybe as { headers?: { set?: unknown } })?.headers?.set === "function") {
      const res = maybe as unknown as NextResponse;

      // Basic security headers
      res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
      res.headers.set("X-Frame-Options", "DENY");
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "geolocation=(), microphone=()");

      // A reasonably strict CSP — use report-only if requested by env
      const csp =
        "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; frame-ancestors 'none'";

      if (process.env.CSP_REPORT_ONLY === '1') {
        res.headers.set('Content-Security-Policy-Report-Only', csp + "; report-uri /csp-report");
      } else {
        res.headers.set('Content-Security-Policy', csp);
      }

      return res;
    }
  } catch (_err) {
    // ignore and continue to return whatever auth returned
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
