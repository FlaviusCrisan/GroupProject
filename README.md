# GameMatch

GameMatch helps players find a teammate for their next game. Hosts create lobbies, players filter by game and preferences, and accepted teammates can plan a session through direct messages.

[View the interface](https://gamematch-design-preview.vercel.app)

## Features

- Lobby creation, editing and join requests
- Filters for game, mode, region, language, platform and rank
- Player profiles with Discord, Steam and Riot details
- Accepted lobbies and request history
- Direct messages with recoverable delivery errors
- Responsive navigation, light and dark themes, local SVG icons

## Stack

Angular 21 and TypeScript on the frontend; Express and PostgreSQL on the backend. Clerk handles authentication and profile metadata. The redesign adds no framework dependencies.

## Development

Use Node.js 22 or later and npm. Install the two applications separately:

```sh
cd client
npm ci
cd ../server
npm ci
```

Copy `server/.env.example` to `server/.env` and set your PostgreSQL connection and Clerk keys. The browser's publishable key in `client/src/index.html` must belong to the same Clerk application. Do not put the Clerk secret key in the frontend.

Initialize the database once with `npm run db:init` inside `server`. Start the API with `npm start` inside `server`, and start Angular with `npm start` inside `client`. Open http://localhost:4200. The local frontend uses http://localhost:3000.

To view the interface without external services, run `npm run design-preview` inside `client`. This separate build uses in-memory example lobbies, profiles and messages. Changes reset when the page reloads. It does not contain accounts, saved user data or a live backend. The hosted interface link above runs this configuration. Production builds exclude these fixtures and require real authentication.

## Deployment

See [Vercel setup](docs/deployment.md) for the frontend and API projects, environment variables and database initialization.

## Checks

```sh
cd server
npm test
cd ../client
npm run build
npm test -- --watch=false --include=src/app/components/messaging/messaging.spec.ts --include=src/app/components/post-list/post-list.spec.ts
```

The API checks cover authentication, host permissions, failed persistence and accepting join requests. The frontend checks cover draft retention, duplicate sends and stale filter responses. Other original generated specs and the original Playwright suite are not part of these checks; the Playwright suite requires real test accounts and manual sign-in.

## Team

- Maksymilian � frontend
- Kostiantyn � database and backend
- Flavius � testing

The original group project is maintained at [FlaviusCrisan/GroupProject](https://github.com/FlaviusCrisan/GroupProject). Brand icon source and licensing are documented in [client/public/icons](client/public/icons/README.md).
