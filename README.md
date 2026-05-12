# Missions

Minimal scaffold for the Missions web application.

## Scope

Phase 1 adds the Supabase/Auth foundation only. It includes Supabase client wiring, sign-in/sign-up routes, an auth callback route, sign-out, an authenticated `/app` shell, and a placeholder profile helper based on the current Supabase user.

This phase intentionally does not include groups, missions, XP, rankings, streaks, templates, rewards, notifications, database schema/migrations, RLS policies, or product UI polish.

## Supabase environment variables

Create a local environment file such as `.env.local` with these values from your Supabase project settings. The same keys are listed in `.env.example` for reference.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The auth callback route is available at `/auth/callback`. Configure the equivalent absolute URL in Supabase Auth redirect settings for each deployed environment, for example `http://localhost:3000/auth/callback` locally.

## Vercel deployment

This repository is a Next.js application and can be deployed directly to Vercel as a web app.

1. Import the repository into Vercel and keep the framework preset set to **Next.js**.
2. Add these environment variables in the Vercel project settings for every environment you plan to use (Production, Preview, and Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Use the default Vercel commands for this project:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Development command: `npm run dev`
   - Output directory: leave unset so Vercel uses the Next.js default
4. After Vercel assigns a deployment URL, add that deployment's callback URL to Supabase Auth redirect settings:
   - `https://your-vercel-domain.vercel.app/auth/callback`

The application does not rely on local-only URLs or local filesystem state at runtime. Supabase configuration must be provided through environment variables in Vercel before building and serving the app.

## Local validation

Install dependencies and run the standard checks locally:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

> Note: dependency installation and build validation may fail in restricted environments where npm registry access is blocked by proxy policy.
