# Petrol Pump DSR

A full-stack Daily Sales Report platform for petrol pump management. Handles shift operations, sales tracking, inventory, credit customers, employees, and fuel rates in a type-safe pnpm monorepo.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS · Prisma · PostgreSQL · Better Auth |
| Frontend | React · Vite · TanStack Query · Tailwind CSS |
| Shared | TypeScript configs · typed env helpers |
| Package manager | pnpm workspaces |

## Workspace layout

```
apps/
  api/          # NestJS backend (port 4000)
  web/          # React frontend (port 5173)
packages/
  config/       # getAppConfig — typed env helpers
  tsconfig/     # shared TS presets (base, react, nest)
```

## Features

- **Auth** — sign-up/sign-in via Better Auth; session-scoped data isolation per station
- **Setup** — organisation, station, tanks, dispensers, nozzles, calibration renewals
- **Shift dashboard** — open/close shifts, meter readings, daily sales entry
- **Sales** — per-nozzle sales with payment type, optional employee attribution
- **Fuel rates** — manage current and historical rates per fuel type
- **Credit customers** — track customers buying on credit with vehicle no. and credit limit
- **Employees** — employee records, documents, salary history
- **Expenses** — daily expense logging per shift

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled connection string (app traffic) |
| `DIRECT_URL` | Direct connection string (migrations) |
| `BETTER_AUTH_SECRET` | 32+ character secret for session signing |
| `VITE_API_URL` | API base URL used by the frontend |

For Neon, use the pooled URL in `DATABASE_URL` and the direct URL in `DIRECT_URL`. Prisma 7 reads migration config from `apps/api/prisma.config.ts`.

## Common commands

| Action | Command |
|---|---|
| Dev server | `pnpm dev` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Generate Prisma client | `pnpm db:generate` |
| Run migrations | `pnpm db:migrate` |
| Prisma Studio | `pnpm db:studio` |
</content>
</invoke>