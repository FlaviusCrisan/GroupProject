# GameMatch
This is a website where gamers can find teammates

It is hosted at [https://project-v8csq.vercel.app](https://project-v8csq.vercel.app)

Features:
- Search for lobbies
- Filters / sorting
- User profile (social media links, Game specific stats)
- Advanced matchmaking algorithm
- Match history
- Chatting
- Themes (dark / light)

# Supported Games
- Fortnite
- Rainbox six siege
- Valorant
- Rocket league
- League of legends
- Marvel rivals
- Overwatch
- Warzone
- Minecraft
- Cs2
- Roblox
- Apex legends

# Tech Stack

Frontend - Angular

Backend - Node.js

Database - PostgreSQL

Testing - Playwright

# Member Roles

Maksymilian - Frontend

Kostiantyn - Database & Backend

Flavius - Testing

# Build Instructions
Prerequisites:
- Must have Postgres server installed
- Set up variables in `server/.env`

Example `.env`
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=mydb
DB_PASSWORD=
DB_PORT=5432

PORT=3000

CLERK_PUBLISHABLE_KEY=<your api key>
CLERK_SECRET_KEY=<your api key>
```

in the root directory `GroupProject/`:
- run `npm install`
- run `npm run dev`
- connect to `localhost:4200` in your browser
