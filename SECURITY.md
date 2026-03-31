# Security Guidelines

This document summarizes immediate security hardening steps for the application and recommended operational practices.

## What I changed
- Added HTTP security headers in `middleware.ts` (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP).
- Made CSP configurable as `report-only` with `CSP_REPORT_ONLY=1` and a `/csp-report` endpoint can be added to collect reports.
- Hardened NextAuth session and cookie settings (`httpOnly`, `sameSite`, `secure`).
- Added IP-based rate-limiting for registration and signin server actions.
- Added Dependabot config and a GitHub Actions workflow to run `npm audit` daily.

## Immediate actions you should take
- Rotate secrets: `NEXTAUTH_SECRET`, database credentials, SMTP credentials. Use your provider's secret store (Netlify env vars already used).
- Enable `CSP_REPORT_ONLY=1` in staging first, monitor reports, then enforce CSP in production.
- Configure your SMTP provider to validate recipients and use TLS.
- Review `npm audit` artifacts and approve or update dependencies in PRs created by Dependabot.

## Recommended long-term steps
- Run migrations and schema changes from CI rather than during build.
- Use a managed secrets store (e.g., Netlify environment variables, AWS Secrets Manager) and limit access.
- Enable automated dependency updates and require reviews for dependency PRs.
- Configure monitoring/alerts for failed login/registration spikes.

If you want, I can:
- Add an endpoint `/csp-report` to collect CSP reports.
- Run and open PRs for the direct vulnerable packages (e.g., `nodemailer`, `prisma`, `drizzle-kit`).
- Add more granular rate-limiting backed by Redis for production.
