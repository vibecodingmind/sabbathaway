# Build stage: install deps and build the Vite SPA + bundle the Express server
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Runtime stage: small Node image runs the bundled server and serves static dist/
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Railway injects PORT at runtime; the server falls back to 3000 locally.
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
