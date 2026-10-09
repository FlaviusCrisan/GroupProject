# Vercel deployment

The repository contains separate Angular and Express applications. PostgreSQL stays in an external persistent database; Vercel deployments do not store application data on disk or in memory.

## API project

Create a Vercel project with Root Directory `server` and framework Express. Set `DATABASE_URL`, `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` as environment variables. Use the PostgreSQL provider's connection URL with its TLS settings. The two Clerk keys must belong to the same application.

Copy the same values into a local, gitignored `server/.env` and run `npm run db:init` inside `server` once before deployment. This creates missing tables without deleting existing tables or rows. Schema creation does not run during serverless requests.

Deploy the project and record its HTTPS origin. `/api/check` checks that the application responds; `/api/posts` also exercises the database and should return JSON, with a 503 when storage is unavailable.

## Frontend project

Create a Vercel project with Root Directory `client`, framework Angular, and these environment variables:

- `GAMEMATCH_API_URL` � the API project's HTTPS origin
- `CLERK_PUBLISHABLE_KEY` � the matching Clerk publishable key

`client/vercel.json` sets `npm run build:vercel` and output `dist/client/browser`. The build script updates the frontend API origin and Clerk script. These are public configuration values; never set `CLERK_SECRET_KEY` on the frontend. The build fails if either required setting is missing.

Configure the final frontend domain and allowed redirect URLs in the Clerk dashboard. Deploy, then verify sign-in, creating a lobby, a join request from another account, acceptance by the host, and a message between those accounts. Production has not been validated until this check runs with a real database and Clerk application.

## Interface deployment

The current published interface is https://gamematch-design-preview.vercel.app. It is a separate static project built with `npm run build:preview`. It uses example data held in the browser's memory and does not access the production API or Clerk. Refreshing resets its state. The product interface contains no development banners; this document records the deployment's actual capabilities.

For updates, run `npm run build:preview` inside `client`, then deploy `client/dist/design-preview/browser` to the existing `gamematch-design-preview` Vercel project. After a clean build, link this output directory to that project before deploying again; `.vercel` metadata is not versioned.

## Current prerequisites

As of 9 October 2026, the original frontend and Render API addresses returned 404. Vercel account access has been confirmed and the interface deployment is live. Restoring persistent application behavior requires the owner's working PostgreSQL and Clerk configuration, which is not stored in this repository.
