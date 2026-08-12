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
| Payments   | Pluggable adapters (Stripe / PayPal / PesaPal; simulated in local/dev) |
| AI         | Google Gemini API |

The production build bundles the Express server with `esbuild` and serves the Vite-built static assets from `dist/`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite connection string (default: `file:./dev.db`) |
| `JWT_SECRET` | Secret for signing auth tokens |
| `GEMINI_API_KEY` | Google Gemini API key (optional, for AI concierge) |
| `GEMINI_MODEL` | Gemini model name (default: `gemini-2.0-flash`) |
| `GOOGLE_MAPS_PLATFORM_KEY` | Google Maps API key for interactive map |
| `APP_URL` | Public app URL (e.g. `http://localhost:3000`) |
| `PORT` | Server port (default: `3000`) |
| `STRIPE_SECRET_KEY` | Stripe secret key for membership payments |

## Mission Note

AdventistStay is a **non-commercial Christian hospitality network**. Member accommodation between verified Adventist families is **100% free**. Membership subscriptions fund platform safety, verification, pastoral support, and infrastructure — not nightly stay fees.
