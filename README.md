# Missions

Minimal scaffold for the Missions web application.

## Scope

Phase 1 adds the Supabase/Auth foundation. It includes Supabase client wiring, sign-in/sign-up routes, an auth callback route, sign-out, an authenticated `/app` shell, and a placeholder profile helper based on the current Supabase user.

Phase 2 adds the minimal Groups + Memberships foundation. It includes private `groups` and `group_memberships` tables, basic RLS, group creation, a current-user group list, and a basic group detail page.

This phase intentionally does not include missions, XP, rankings, campaigns, streaks, rewards, templates, notifications, invite flows, public discovery, complex dashboards, or product UI polish.

## Supabase environment variables

Create a local environment file such as `.env.local` with these values from your Supabase project settings. The same keys are listed in `.env.example` for reference.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The auth callback route is available at `/auth/callback`. Configure the equivalent absolute URL in Supabase Auth redirect settings for each deployed environment, for example `http://localhost:3000/auth/callback` locally.


## Supabase migrations

Apply migrations before using `/app/groups` or the task library in any deployed Supabase project. The Phase 2 schema lives in `supabase/migrations/20260512000000_groups_memberships.sql` and creates:

- `public.groups`
- `public.group_memberships`
- indexes, constraints, helper functions, triggers, and minimal RLS policies for active group members

The tasks foundation migrations live in `supabase/migrations/20260513000200_tasks_foundation.sql` and `supabase/migrations/20260513000300_task_visual_identity_verification.sql`. They create the reusable `public.tasks` table, task RLS policies, the task visual identity fields (`icon_key`, `image_url`), and the verification type constraint used by the task form.

### Apply with the Supabase CLI

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Apply manually in the Supabase dashboard

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Open each migration file from this repository in timestamp order, including `supabase/migrations/20260513000200_tasks_foundation.sql` and `supabase/migrations/20260513000300_task_visual_identity_verification.sql` for task definitions.
4. Paste one full migration file at a time into the SQL editor.
5. Click **Run** after each file completes before pasting the next migration.

If these tables are missing in deployed Supabase, `/app/groups` shows an empty list instead of crashing, but creating and viewing groups requires the migration to be applied.

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
