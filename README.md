# Кулинарният блог на Иво

Cooking blog application built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and Auth.js.

## Current State

- Next.js App Router application with TypeScript and Tailwind CSS
- Bulgarian cooking-blog branding and localized public UI
- Public recipe archive and recipe detail pages
- Prisma schema for Auth.js, recipes, categories, ingredients, steps, tags, comments, and favorites
- Auth.js with email/password sign-in, optional Google sign-in, and protected dashboard access
- Dashboard recipe management with server-side validation
- Repository layer that reads from Prisma when a database is configured and falls back to bundled sample recipes otherwise

## Setup

1. Copy `.env.example` to `.env`.
2. Set `AUTH_SECRET` and `AUTH_URL`.
3. Set `DATABASE_URL` if you want real database-backed authentication and recipe storage.
4. Optionally set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` to enable Google sign-in.
5. Run `npm run db:push` after configuring a real database.
6. Run `npm run dev`.

## Local Development Note

- If `DATABASE_URL` is empty, public recipe pages fall back to sample Bulgarian recipes.
- Email/password registration requires a real database connection to create users.
- Google sign-in stays disabled until both Google environment variables are provided.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

## Current Routes

- `/` homepage
- `/recipes` recipe archive
- `/recipes/[slug]` recipe detail page
- `/signin` sign-in page
- `/register` email/password registration page
- `/dashboard` protected dashboard home
- `/dashboard/recipes` dashboard recipe management
- `/api/auth/[...nextauth]` Auth.js route handler

## Authentication

- Email and password authentication is implemented with Auth.js credentials provider and `bcryptjs` password hashing.
- Google authentication is optional and only appears when the Google environment variables are configured.
- Route protection is handled through middleware and auth checks in the application.

## Data Model

- Auth.js models: `User`, `Account`, `Session`, `VerificationToken`
- Content models: `Recipe`, `Category`, `Ingredient`, `RecipeStep`, `Tag`, `RecipeTag`, `Comment`, `Favorite`
- User roles are stored in the database and propagated through the session

## Suggested Next Work

- Add recipe search filtering for the homepage and archive query input
- Add recipe editing and deletion in the dashboard
- Add image upload handling for recipe covers
- Seed PostgreSQL with the current Bulgarian sample recipes
