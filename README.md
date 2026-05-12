# Missions

Minimal scaffold for the Missions web application.

## Scope

Phase 1 adds the Supabase/Auth foundation only. It includes Supabase client wiring, sign-in/sign-up routes, an auth callback route, sign-out, an authenticated `/app` shell, and a placeholder profile helper based on the current Supabase user.

This phase intentionally does not include groups, missions, XP, rankings, streaks, templates, rewards, notifications, database schema/migrations, RLS policies, or product UI polish.

## Supabase environment variables

Create a local environment file such as `.env.local` with these values from your Supabase project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The auth callback route is available at `/auth/callback`. Configure the equivalent absolute URL in Supabase Auth redirect settings for each deployed environment, for example `http://localhost:3000/auth/callback` locally.

## Local validation

Install dependencies and run the standard checks locally:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

> Note: dependency installation and build validation may fail in restricted environments where npm registry access is blocked by proxy policy.
