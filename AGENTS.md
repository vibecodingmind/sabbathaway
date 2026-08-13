# AGENTS.md

## Cursor Cloud specific instructions

AdventistStay (a.k.a. SabbathAway) is a single-service web app: a Vite + React 19 SPA
served by an Express server that mounts Vite in middleware mode. There is one process
for both the API and the frontend.

- Package manager is `bun` (see `bun.lock`). `bun` is installed at `~/.bun/bin/bun` and is
  on `PATH` via `~/.bashrc`. The startup update script runs `bun install`.
- Dev server: `bun run dev` (runs `tsx server.ts`) serves everything on
  http://localhost:3000. This is the command to use for development — do NOT use the
  production `bun run build` / `bun run start` flow for local dev.
- Lint / typecheck: `bun run lint` (`tsc --noEmit`).
- Health check: `GET http://localhost:3000/api/health`. API routes live under `/api`
  (see `server.ts`), e.g. `/api/docs/openapi`, `/api/ai/assistant`.
- Env vars are optional for local dev. `GEMINI_API_KEY` powers the AI Sabbath Concierge
  (`/api/ai/assistant`); without it the endpoint returns a canned fallback response, so the
  app is fully usable without any secrets. `GOOGLE_MAPS_PLATFORM_KEY` enables live Google
  Maps; the map view still renders without it. See `.env.example`.
- App data (listings, users, stay requests) is in-memory / mock data (`src/data/`,
  `src/context/AppContext.tsx`); there is no database. State resets on reload, and the app
  starts pre-authenticated as a demo guest user.
- HMR can be disabled by setting `DISABLE_HMR=true` (used by AI Studio); leave it unset for
  normal hot-reloading during development.

## Architecture (v2 — persistent, multi-user)

- Single Express process serves the React SPA and a REST API under `/api` (`server.ts`).
- Backend lives in `server/`: `db.ts` (Postgres store using JSONB document tables, with an
  in-memory fallback when `DATABASE_URL` is unset), `auth.ts` (bcrypt password hashing + JWT),
  `api.ts` (all routes), `state.ts` (per-role bootstrap payload), `payments.ts`, `email.ts`.
- On first boot the store seeds itself from `src/data/mockData.ts` (listings, churches, users,
  etc.) and creates the sample user accounts. Seeded accounts share a demo password
  (`SEED_DEMO_PASSWORD`, default `sabbath2026`), e.g. `guest@test.local`, `host@test.local`,
  `admin@test.local`.
- Frontend talks to the API via `src/lib/api.ts`; `src/context/AppContext.tsx` hydrates from
  `GET /api/state` and persists every mutation. Auth token is stored in `localStorage`
  (`adventiststay_token`).
- Authorization is enforced server-side: writes require a valid JWT; ownership is checked for
  listings/stay-requests/messages/etc.; `/api/admin/*` requires an ADMIN token. `GET /api/state`
  scopes private data (messages, stay requests, memberships, transactions) to the caller and
  hides admin-only collections from non-admins.

### Environment variables

- `DATABASE_URL` — Postgres connection string. If unset, the app uses a non-persistent
  in-memory store (fine for quick local UI work).
- `JWT_SECRET` — required in production (set to a long random string).
- `SEED_DEMO_PASSWORD` — optional; password for the seeded sample accounts.
- Optional integrations (safe fallbacks when unset): `STRIPE_SECRET_KEY` / `PAYPAL_*` /
  `PESAPAL_*` (payments — otherwise settlements are recorded as `simulated`); `RESEND_API_KEY`
  / `SENDGRID_API_KEY` / `SMTP_URL` + `EMAIL_FROM` (email — otherwise logged to console);
  `GEMINI_API_KEY` (AI concierge); `GOOGLE_MAPS_PLATFORM_KEY` (maps).

### Local development with a database

- Quick UI work needs no DB (in-memory fallback). For real persistence locally, run Postgres
  and start with `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/sabbathaway_dev bun run dev`.

## Deployment (Railway)

- The app is deployed to Railway, project `triumphant-unity`, service `sabbathaway`,
  environment `production`. Live URL: https://sabbathaway-production.up.railway.app
- Data is stored in a dedicated `sabbathaway` database on the project's Postgres service
  (isolated from the separate `busybeds` app that shares the instance). The service reaches it
  via the private URL `postgresql://busybeds:<pw>@postgres.railway.internal:5432/sabbathaway`,
  set as the `DATABASE_URL` variable. `JWT_SECRET` is also set on the service.
- Deployment builds from `Dockerfile` (multi-stage: `oven/bun` builds, `node:22-slim` runs
  `node dist/server.cjs`). `railway.json` pins the Dockerfile builder and sets the
  `/api/health` healthcheck (which reports `database: connected`).
- The server listens on `process.env.PORT`; Railway injects `PORT=8080`, so the service
  domain's target port is `8080`. Keep these in sync if the domain is recreated.
- Production build command: `bun run build` (Vite build + esbuild bundles `server.ts` to
  `dist/server.cjs`); run with `NODE_ENV=production node dist/server.cjs`.
- To redeploy the current working directory from the repo root:
  `railway up -p <projectId> -s <serviceId> -e production --ci -y` (auth via the
  `RAILWAY_API_TOKEN` env var).
