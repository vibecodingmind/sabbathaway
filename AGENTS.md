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

## Deployment (Railway)

- The app is deployed to Railway, project `triumphant-unity`, service `sabbathaway`,
  environment `production`. Live URL: https://sabbathaway-production.up.railway.app
- Deployment builds from `Dockerfile` (multi-stage: `oven/bun` builds, `node:22-slim` runs
  `node dist/server.cjs`). `railway.json` pins the Dockerfile builder and sets the
  `/api/health` healthcheck.
- The server listens on `process.env.PORT`; Railway injects `PORT=8080`, so the service
  domain's target port is `8080`. Keep these in sync if the domain is recreated.
- Production build command: `bun run build` (Vite build + esbuild bundles `server.ts` to
  `dist/server.cjs`); run with `NODE_ENV=production node dist/server.cjs`.
- To redeploy the current working directory from the repo root:
  `railway up -p <projectId> -s <serviceId> -e production --ci -y` (auth via the
  `RAILWAY_API_TOKEN` env var).
