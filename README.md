# Trading Journal

A personal trading journal: log trades, see win/loss patterns, emotions, and
performance stats — without the overhead of a full trading platform.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · MongoDB Atlas · Mongoose ·
React Hook Form + Zod · TanStack Query · Recharts · Vercel

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in MONGODB_URI and AUTH_SECRET in .env.local — see below
npm run dev
```

Open http://localhost:3000.

### MongoDB Atlas setup

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Under **Database Access**, create a user with a password.
3. Under **Network Access**, add your IP (or `0.0.0.0/0` for quick local dev —
   tighten this before deploying).
4. Get the connection string from **Connect → Drivers**, and paste it into
   `MONGODB_URI` in `.env.local`, replacing `<password>` and adding a database
   name, e.g. `.../trading-journal?retryWrites=true&w=majority`.

No manual schema setup is needed — Mongoose creates the collection and
indexes on first write.

## Architecture

```
src/
  app/
    api/            Route Handlers (REST endpoints) — thin, delegate to services
                      auth/[...nextauth]  NextAuth handlers (sign in/out, session)
                      auth/register       Custom registration endpoint
    login/, register/  Auth pages
    trades/         Pages: list is on "/", plus new/[id]/[id]/edit
  components/
    ui/             Generic primitives (Button, Card, Input, ConfirmDialog...)
    trades/         Trade-specific components (form, table, filters)
    dashboard/       Stat cards and charts
  lib/              Cross-cutting infra: MongoDB connection, NextAuth config
                      (auth.config.ts is Edge-safe for middleware; auth.ts adds
                      the Credentials provider for API/server-component use),
                      API error helper, fetch client
  models/           Mongoose schemas (Trade, User)
  repositories/     Raw data access — the only layer that talks to Mongoose/MongoDB
  services/         Business logic: DTO mapping, statistics calculations, registration
  validators/       Zod schemas, shared by the client form and the API routes
  types/            Shared TypeScript types/DTOs
  hooks/            TanStack Query hooks (data fetching + cache invalidation)
  utils/            Formatting and className helpers
  middleware.ts     Redirects unauthenticated requests to /login
```

**Why this layering:** routes stay thin (parse → call service → return),
services hold logic that's meaningful to test in isolation (e.g. streak and
profit-factor math in `dashboardService.ts`), and repositories are the only
place that constructs Mongoose queries — so swapping ORMs or adding caching
later touches one layer, not the whole app. The same Zod schema
(`validators/trade.ts`) validates on both the client (via
`@hookform/resolvers/zod`) and the server, so the rules can't drift apart.

**Dashboard stats are computed server-side** (`/api/dashboard`) rather than
in the browser, so the client never has to fetch every trade just to show a
win rate.

## Authentication

Each person gets their own private journal. Auth is credentials-based
(email + password) via [Auth.js / NextAuth v5](https://authjs.dev), split
into two config files because middleware runs on the Edge runtime, which
can't execute Mongoose or bcrypt:

- `src/lib/auth.config.ts` — Edge-safe: session strategy, pages, and the
  `authorized` callback that decides which routes require a session. Used
  by `middleware.ts`.
- `src/lib/auth.ts` — full config, adds the Credentials provider (hashes
  compared with bcrypt against the `User` collection). Used by API routes
  and server components.

Every trade is scoped by `userId` at the repository layer — `findById`,
`update`, and `delete` all filter by `{ _id, userId }` together, so one
user can never read or modify another's trades even by guessing an ID.
`middleware.ts` protects all pages except `/login` and `/register`; API
routes check `auth()` individually and return `401` JSON (a redirect would
break `fetch` calls).

You'll need one more environment variable beyond `MONGODB_URI`:

```bash
# generate with: npx auth secret   (or: openssl rand -base64 32)
AUTH_SECRET=
```

## Extending later

The spec calls out a list of features to design around without building yet:
screenshots, tags, R:R, position size, stop/take profit, timeframe, strategy
management, CSV import/export, multiple portfolios, advanced analytics.
None of these require restructuring:

- **New trade fields** (tags, R:R, position size, SL/TP, timeframe,
  screenshot URL): add to `models/Trade.ts`, `types/trade.ts`, and
  `validators/trade.ts`. Because the API always returns through
  `toTradeDTO()`, and the frontend always reads through the typed `TradeDTO`,
  new fields propagate to the table/detail view once you add them to the UI —
  no route handler changes needed.
- **CSV import/export**: add `app/api/trades/export/route.ts` and
  `import/route.ts` that reuse `tradeRepository`/`tradeService` — the
  statistics and validation logic doesn't change.
- **Multiple portfolios**: same shape as the `userId` scoping already in
  place — add `portfolioId` to the schema and repository filters.
- **Strategy management**: promote `setup` from a free string to a
  `Strategy` collection referenced by `strategyId`; the dashboard's
  `computeBreakdown()` already groups by an arbitrary field, so grouping by
  strategy name instead of setup is a one-line change in
  `dashboardService.ts`.

## Deployment (Vercel)

1. Push this project to a Git repo.
2. Import it in Vercel.
3. Add the `MONGODB_URI`, `NEXT_PUBLIC_APP_URL`, and `AUTH_SECRET` environment
   variables in the Vercel project settings (Production and Preview). Use a
   different `AUTH_SECRET` than your local one.
4. Deploy. The MongoDB connection helper (`src/lib/mongodb.ts`) caches the
   connection across serverless invocations, so no extra configuration is
   needed for Vercel's function model.
