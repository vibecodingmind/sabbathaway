# AdventistStay production image (PostgreSQL)
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
# Use PostgreSQL Prisma schema for production client generation
COPY prisma/schema.postgres.prisma prisma/schema.prisma
ENV DATABASE_URL="postgresql://adventiststay:adventiststay@db:5432/adventiststay"
RUN npx prisma generate \
  && npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && useradd -m -u 1001 appuser

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p /app/uploads/verifications \
  && chown -R appuser:appuser /app

USER appuser
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
