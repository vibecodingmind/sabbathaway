# AdventistStay

**AdventistStay** is a Sabbath hospitality network for verified Seventh-day Adventist members. The platform connects church-verified hosts and guests for fellowship stays, family exchange, mission travel, and conference visits — with pastoral verification and a non-commercial mission at its core.

## Features

- **Sabbath hospitality search** — Discover Adventist host homes worldwide with filters for purpose, Sabbath dates, and guest count
- **Church member verification** — Pastoral and conference verification workflows for trusted community stays
- **Family Exchange program** — Cultural family-to-family exchanges between verified households
- **Role-based portals** — Dedicated dashboards for guests, hosts, and platform administrators
- **Membership & stewardship** — Subscription packages fund platform operations; **hospitality stays themselves are always free**
- **Messaging & safety** — In-app fellowship messaging, safety reporting, and emergency protocols
- **AI Sabbath Concierge** — Gemini-powered assistant for Sabbath travel planning (optional)

## Quick Start

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

## Demo Credentials

After seeding the database, sign in with email and password:

| Role  | Email              | Password     |
|-------|--------------------|--------------|
| Guest | `guest@test.local` | `password123` |
| Host  | `host@test.local`  | `password123` |
| Admin | `admin@test.local` | `password123` |

Demo role buttons in the auth modal also provide instant access for local testing.

## Architecture Overview

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19 + Vite + Tailwind CSS v4 |
| Backend    | Express (TypeScript via `tsx`) |
| Database   | Prisma ORM + SQLite |
| Auth       | JWT (email/password + demo login) |
| Payments   | Stripe Checkout when `STRIPE_SECRET_KEY` is set; otherwise simulated adapters |
| Email      | Resend or SMTP when configured; otherwise logged to DB + console |
| AI         | Google Gemini API |

The production build bundles the Express server with `esbuild` and serves the Vite-built static assets from `dist/`.

## Payments & Email

**Stripe Checkout**
1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
2. Point Stripe webhook to `POST /api/payments/stripe/webhook` for `checkout.session.completed`
3. Subscribe flow redirects to Stripe; webhook activates membership

Without Stripe keys, membership checkout settles instantly in simulated mode (local/demo).

**Email**
- Prefer `RESEND_API_KEY` + `EMAIL_FROM`
- Or configure `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`
- Stay request / accept / decline and membership activation emails are always persisted in `EmailNotificationLog`

## Verification documents

Members can upload pastor letters / membership PDFs (PDF or image, max 8MB) from the Verification Center. Files are stored under `/uploads/verifications` and served at `/uploads/...`.

## Deploy with Docker (PostgreSQL)

```bash
# Requires Docker / Docker Compose
cp .env.example .env   # set JWT_SECRET at minimum
docker compose up --build
```

This starts Postgres + the AdventistStay app on port 3000, applies the schema, and seeds demo data (`RUN_SEED=false` to skip).

**Local SQLite (default)** stays available via `npm run db:push && npm run db:seed && npm run dev`.

**Postgres without Docker**
```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/adventiststay"
npm run db:generate:pg
npm run db:push:pg
npm run db:seed
npm run dev
```

> When using PostgreSQL, generate the Prisma client with `db:generate:pg` (uses `prisma/schema.postgres.prisma`).

## Smoke / API tests

With the server running and DB seeded:

```bash
npm run test:smoke
npm run test:api
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `file:./dev.db` (SQLite) or `postgresql://…` |
| `JWT_SECRET` | Secret for signing auth tokens |
| `GEMINI_API_KEY` | Google Gemini API key (optional, for AI concierge) |
| `GEMINI_MODEL` | Gemini model name (default: `gemini-2.0-flash`) |
| `GOOGLE_MAPS_PLATFORM_KEY` | Google Maps API key (auto-enables Google map engine) |
| `APP_URL` | Public app URL (e.g. `http://localhost:3000`) |
| `PORT` | Server port (default: `3000`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_…`) for Checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `EMAIL_FROM` | From address for outbound email |
| `SMTP_*` | Optional SMTP fallback settings |

## Mission Note

AdventistStay is a **non-commercial Christian hospitality network**. Member accommodation between verified Adventist families is **100% free**. Membership subscriptions fund platform safety, verification, pastoral support, and infrastructure — not nightly stay fees.
