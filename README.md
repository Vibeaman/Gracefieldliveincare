# Gracefield Living in Care

Public site and a private admin area for Gracefield, a live-in care service.

Built with TanStack Start, React, Tailwind, and Nitro. Deploys to Vercel as serverless functions.

## Run locally

```bash
bun install
bun run dev
```

npm works too (`npm install` then `npm run dev`). Open [http://localhost:3000](http://localhost:3000).

Admin screens: [http://localhost:3000/admin](http://localhost:3000/admin). Default passcode is `gracefield` unless you set `VITE_ADMIN_PASSCODE` in `.env.local` (see `.env.example`).

## Deploy to Vercel

The repo is already set up for Vercel (Nitro plugin + `vercel.json` framework preset). You do not need extra build settings.

1. Open [vercel.com/new](https://vercel.com/new) and import **Vibeaman/Gracefieldliveincare**.
2. Confirm the framework preset is **TanStack Start**.
3. Add environment variable `VITE_ADMIN_PASSCODE` (Production + Preview) with a passcode only you know.
4. Deploy.

After the first deploy, every push to `main` ships a new production build. Preview URLs are created for other branches.

Live paths:

- Public site: `/`
- Admin: `/admin` (not linked from the public nav)

The admin passcode is bundled into the browser. Treat it as a keep-out sign, not a lock. Do not put real client data through it until Supabase role-based auth is in place.

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Local dev server on port 3000 |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
