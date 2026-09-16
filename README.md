# Gracefield Living in Care

Public site and a private admin area for Gracefield, a live-in care service.

Built with TanStack Start, React, Tailwind, Nitro, and Supabase. Deploys to Vercel as serverless functions.

## Run locally

```bash
bun install
cp .env.example .env.local
# fill in the Supabase values, then:
bun run dev
```

npm works too (`npm install` then `npm run dev`). Open [http://localhost:3000](http://localhost:3000).

Admin screens: [http://localhost:3000/admin](http://localhost:3000/admin). Default passcode is `gracefield` unless you set `ADMIN_PASSCODE`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication → Providers**, turn on **Email** and **Google**. For Google you need a Google Cloud OAuth client ID and secret. Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorised redirect URI, and add your live site (`https://gracefieldliveincare.vercel.app/account`) under **Authentication → URL configuration → Redirect URLs**.
3. Open **SQL Editor**, paste `supabase/schema.sql`, and run it. That creates tables, Row Level Security, the new-user trigger, and a public `photos` storage bucket.
4. Copy the project URL, anon key, and service role key from **Project Settings → API** into `.env.local` and into Vercel.

## Deploy to Vercel

The repo is already set up for Vercel (Nitro plugin + `vercel.json` framework preset). You do not need extra build settings.

1. Open [vercel.com/new](https://vercel.com/new) and import **Vibeaman/Gracefieldliveincare**.
2. Confirm the framework preset is **TanStack Start**.
3. Add these environment variables for Production and Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL` (same value as `VITE_SUPABASE_URL`)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSCODE`
   - `VITE_ADMIN_PASSCODE` (same value as `ADMIN_PASSCODE`)
4. Deploy.

After the first deploy, every push to `main` ships a new production build.

Live paths:

- Public site: `/`
- Sign in / create account: `/sign-in`, `/create-account`
- Care request (after sign in): `/request-care`
- Client account: `/account`
- Admin: `/admin` (not linked from the public nav)

The admin passcode is checked on the server for every admin write. It is still a keep-out sign for the page itself, not a full role system.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Local dev server on port 3000 |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
