Netlify deployment notes
=======================

Steps to deploy this Next.js app on Netlify:

1. Ensure you have a production database accessible (set `DATABASE_URL`).
2. Set required environment variables in Netlify (Site > Settings > Build & deploy > Environment):
   - `DATABASE_URL` (required for Prisma)
   - `NEXTAUTH_URL` (your Netlify site URL)
   - `NEXTAUTH_SECRET`
   - SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (if email features used)
   - OAuth: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (if used)
   - Optional: `SENTRY_DSN`, any other secrets

3. The build runs `prisma generate` and `prisma migrate deploy` before `next build` (configured in `package.json`).
   If you prefer not to run migrations during build, adjust `package.json` build script.

4. Files uploaded to `public/uploads` are ephemeral on Netlify. Use S3 or another external store for persistent uploads.

5. Node version is pinned to 18 via `.nvmrc`.

Netlify config: `netlify.toml` uses the `@netlify/plugin-nextjs` plugin which integrates Next.js server functions.
