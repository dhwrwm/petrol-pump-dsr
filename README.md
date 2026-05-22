# Petrol Pump DSR

Monorepo bootstrap for a petrol pump sales and management platform.

## Stack

- `apps/web`: React, Vite, Better Auth client
- `apps/api`: NestJS, Better Auth, Prisma schema and generated client
- `packages/config`: typed environment helpers
- `packages/tsconfig`: shared TypeScript presets

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

API runs on `http://localhost:4000` and web runs on `http://localhost:5173`.

For Neon, use the pooled connection string in `DATABASE_URL` for app traffic and the direct connection string in `DIRECT_URL` for migrations. Prisma 7 reads migration URLs from `apps/api/prisma.config.ts`.
