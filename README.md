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
2. In **Authentication → Providers**, turn on **Email** and **Google**. For Google you need a Google Cloud OAuth client ID and secret. Add these authorised redirect URIs in Google Cloud:
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   Under **Authentication → URL configuration**, set the Site URL to `https://www.gracefieldliveincare.com` and add Redirect URLs:
   - `https://www.gracefieldliveincare.com/account`
   - `https://www.gracefieldliveincare.com/carer`
   - `https://www.gracefieldliveincare.com/reset-password`
   - `https://gracefieldliveincare.com/account`
   - `https://gracefieldliveincare.com/carer`
   - `https://gracefieldliveincare.com/reset-password`
   Password reset emails are sent by Supabase (not Resend).
3. Open **SQL Editor**, paste `supabase/schema.sql`, and run it. That creates tables, Row Level Security, the new-user trigger, a public `photos` bucket, and a private `carer-documents` bucket. If the rest of the schema is already live, run these extra files as needed:
   - `supabase/enquiries.sql` — contact-form messages
   - `supabase/carer-accounts.sql` — carer logins, private documents, and extra admin views
   - `supabase/reviews-policy.sql` — if leaving a review fails
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
   - `ADMIN_PASSCODE` (server only — do not use a VITE_ prefix)
   - `RESEND_API_KEY` (for the contact form, booking-status emails, and new-application alerts)
   - `RESEND_FROM_EMAIL` (optional; defaults to Resend's test sender until a domain is verified)
   - `CONTACT_TO_EMAIL` (optional; defaults to gracefieldliveincare@gmail.com)
   - `SITE_URL` (optional; defaults to https://www.gracefieldliveincare.com)
   - `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_ZOID` (optional until work emails are wired)
4. Deploy.

After the first deploy, every push to `main` ships a new production build. If you change environment variables later, trigger a new deploy so the running app picks them up.

Live paths:

- Public site: `/`
- Sign in / create account: `/sign-in`, `/create-account`
- Forgot / reset password: `/forgot-password`, `/reset-password`
- Care request (after sign in): `/request-care`
- Client account: `/account`
- Carer sign in / work: `/carer/login`, `/carer`
- Admin: `/admin` (not linked from the public nav)
- Admin enquiries: `/admin/enquiries`
- Admin families / search: `/admin/families`, `/admin/search`

Carers cannot create their own account. They apply on `/careers`. Accepting an application creates their login and emails the password. Work mailboxes (`firstname@gracefieldliveincare.com`) are created at the same time once Zoho is connected.

The admin passcode is checked on the server for every admin write. It is still a keep-out sign for the page itself, not a full role system.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Local dev server on port 3000 |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
