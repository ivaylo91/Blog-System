SuperHosting.bg — Node / Next.js deployment checklist

- Prerequisites
- SSH access to your SuperHosting account
- A production PostgreSQL database accessible from the hosting servers
- Domain configured to point to the hosting app (or control-panel mapping)

1) Pick Node version
- In the control panel choose Node 20+ or install via `nvm` on the server.

2) Upload or clone the repo on the server
```bash
# example: clone into your user folder
cd ~/apps
git clone <your-repo-url> blog-system
cd blog-system
```

3) Provide environment variables
- Use the control panel environment variables UI or upload a `.env.production` file outside webroot and source it into PM2/your start script.
-- Required minimum env vars for this project:
  - DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
  - AUTH_URL=https://your-domain.com
  - AUTH_SECRET=<run: openssl rand -base64 32>
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (mailer)
  - AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET (optional, Google OAuth)
  - SENTRY_DSN (optional)

4) Install dependencies and generate Prisma client
```bash
npm ci
npx prisma generate
```

5) Run migrations (recommended)
```bash
# run migrations against production DB
npx prisma migrate deploy
```

6) Build
```bash
npm run build
```

7) Start the app with a process manager (PM2 example)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
# to view logs
pm2 logs blog-system
```

Alternative: use systemd to run `npm start` and manage the process.

8) Networking / domain
- SuperHosting may map your domain to the running Node process automatically; if not, follow their control panel instructions to create a Node app and point the domain.
- Ensure HTTPS is enabled (Let's Encrypt or control panel option).

9) Notes & troubleshooting
- Use `npx prisma migrate deploy` not `migrate dev` in production.
- For PostgreSQL connection strings use the `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require` format.
- If Auth.js complains about untrusted hosts, ensure `AUTH_URL` matches your public URL exactly (including https).
- To restart after env changes: `pm2 restart blog-system` or `pm2 reload ecosystem.config.js`.

Quick commands summary
```bash
cd ~/apps/blog-system
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.js
```
