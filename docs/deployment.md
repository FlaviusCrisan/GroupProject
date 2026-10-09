# Vercel deployment

- Frontend: https://gamematch-kkostia.vercel.app (Vercel project `gamematch-kkostia`, Root Directory `client`)
- API: https://gamematch-api.vercel.app (Vercel project `gamematch-api`, Root Directory `server`)
- Database: Neon `gamematch-db`, Free plan, London region
- Authentication: Clerk `gamematch-auth`, Hobby plan

The frontend and Express API run on Vercel. Lobbies, requests and messages persist in Neon PostgreSQL. Clerk stores accounts and profile metadata. No application data is stored in serverless memory.

## Environment variables

The Neon and Clerk integrations supply the API's `DATABASE_URL`, `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. The API also accepts `CLERK_PUBLISHABLE_KEY` for other setups. Both keys must belong to the same Clerk application.

The frontend requires `GAMEMATCH_API_URL` and `CLERK_PUBLISHABLE_KEY`. `client/vercel.json` runs `npm run build:vercel`, which embeds these public settings in the Angular build. Never copy the Clerk secret or database URL to the frontend.

Local environment files and Vercel project metadata are gitignored. Initialize missing database tables with `npm run db:init` inside `server`. This does not delete existing rows, and schema creation does not run during API requests.

## Updates

Run `vercel deploy --prod` separately inside `server` and `client`, linked to their respective projects. `/api/check` checks that the API responds; `/api/posts` also checks storage.

On 9 October 2026 the deployed API was verified with two temporary Clerk accounts: signed requests, lobby creation/readback/filtering/editing, ownership checks, joining, host acceptance, messages in both directions, profile metadata and deletion. Temporary accounts and rows were removed after the check. The eight backend regression checks and four frontend checks also passed.

## Clerk environment

The current `vercel.app` deployment uses a Clerk development instance with real accounts and persistence. The Clerk form displays its development notice. A custom domain and production Clerk instance are required for a production authentication setup. See [Clerk environments](https://clerk.com/docs/guides/development/managing-environments) and [production setup](https://clerk.com/docs/guides/development/deployment/production).

## Local interface preview

`npm run design-preview` inside `client` uses separate in-memory fixtures for local interface work. Changes reset after reload. The previous static deployment at https://gamematch-design-preview.vercel.app runs this mode; the main GameMatch link above uses the real API and database.
