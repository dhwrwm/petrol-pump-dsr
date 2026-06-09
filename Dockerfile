# ──────────────────────────────────────────────
# Stage 1: Base — Node 20 Alpine + pnpm
# ──────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@8.6.2 --activate
WORKDIR /app

# ──────────────────────────────────────────────
# Stage 2: Dependencies — install all packages
# ──────────────────────────────────────────────
FROM base AS deps

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package.json for each workspace
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/tsconfig/package.json packages/tsconfig/

RUN pnpm install --frozen-lockfile

# ──────────────────────────────────────────────
# Stage 3: Build — compile config + API
# ──────────────────────────────────────────────
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules

# Copy all source files
COPY . .

# Build shared config package first (API depends on it)
RUN pnpm --filter @petrol/config build

# Build API (runs prisma generate + nest build)
RUN pnpm --filter @petrol/api build

# ──────────────────────────────────────────────
# Stage 4: Production — minimal runtime image
# ──────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy node_modules (includes all workspace deps)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules

# Copy built API output
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/

# Copy built config package
COPY --from=build /app/packages/config/dist ./packages/config/dist
COPY --from=build /app/packages/config/package.json ./packages/config/

# Copy root package.json + workspace config (for module resolution)
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./

# Copy Prisma schema, migrations, and config (needed for migrate deploy at runtime)
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

# Copy entrypoint script
COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production
EXPOSE 4000

CMD ["./entrypoint.sh"]
