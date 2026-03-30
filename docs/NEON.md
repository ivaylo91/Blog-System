Creating a Neon Postgres database for this project

Recommended (Neon Dashboard)

1. Open https://console.neon.tech and sign in.
2. Create a new project and create a branch/database (e.g., `main`).
3. From the project/branch, copy the "Connection string" (Full connection string for Prisma).
4. Create a separate branch/database for shadow DB (recommended) and copy its connection string.
5. Set the connection strings in your local `.env` file based on `.env.example`:

   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>?sslmode=require"
   SHADOW_DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<shadow_database>?sslmode=require"

6. Run Prisma commands locally:

```bash
# install dependencies if needed
npm install

# generate client
npx prisma generate

# run migrations (development)
npx prisma migrate dev --name init

# or push schema without migrations
npx prisma db push
```

Alternative (Neon CLI)

1. Install the Neon CLI:

```bash
npm install -g @neondatabase/cli
# or use npx @neondatabase/cli <command>
```

2. Use the CLI to create a project/branch and get connection strings. (If you prefer CLI, use Neon docs for exact commands as the CLI may evolve.)

Notes

- Prisma Migrate may require a separate `SHADOW_DATABASE_URL`. Create a shadow DB/branch in Neon and use its connection string.
- Add `DATABASE_URL` and `SHADOW_DATABASE_URL` to Netlify environment variables for production.
- After migrations, run `npx prisma generate` to update the client.
