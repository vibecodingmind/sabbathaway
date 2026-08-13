#!/bin/sh
set -e

echo "[AdventistStay] Applying database schema…"
# Prefer postgres schema file when present
if [ -f prisma/schema.postgres.prisma ]; then
  cp prisma/schema.postgres.prisma prisma/schema.prisma
fi

npx prisma db push --skip-generate

if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "[AdventistStay] Seeding demo data (set RUN_SEED=false to skip)…"
  npx tsx prisma/seed.ts || echo "[AdventistStay] Seed skipped/failed (may already be populated)"
fi

echo "[AdventistStay] Starting server…"
exec node dist/server.js
