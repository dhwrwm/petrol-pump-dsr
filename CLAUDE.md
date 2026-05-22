# CLAUDE.md

## 1. Project Charter

This is a `pnpm` monorepo for a petrol pump Daily Sales Report (DSR) platform. The architecture emphasizes strict separation between business logic (NestJS) and persistence (Prisma). The goal is to maintain a type-safe, observable, and modular codebase.

**Stack:**
- Backend: NestJS + Prisma + PostgreSQL + Better Auth
- Frontend: React + Vite + Better Auth client
- Shared: TypeScript configs, environment config helpers
- Package Manager: pnpm (workspaces)

## 2. Core Policies

- **Definition of Done:** All changes must be type-checked (`pnpm typecheck`), linted (`pnpm lint`), and verified against existing patterns.
- **Human-in-the-Loop:**
  - Ask First: Database schema migrations, dependency changes, or auth-guard modifications.
  - Never: Do not commit secrets, do not modify lockfiles manually, do not edit auto-generated Prisma files.
- **Architectural Integrity:** If a change impacts the API-Client contract, propose updates to both the API and Web workspaces simultaneously.

## 3. Operational Commands

| Action              | Command                                                    |
| :------------------ | :--------------------------------------------------------- |
| **Install**         | `pnpm install`                                             |
| **Full Build**      | `pnpm build`                                               |
| **Dev Server**      | `pnpm dev`                                                 |
| **Typecheck**       | `pnpm typecheck`                                           |
| **Lint**            | `pnpm lint`                                                |
| **Format**          | `pnpm format`                                              |
| **Prisma Generate** | `pnpm db:generate`                                         |
| **Prisma Migrate**  | `pnpm db:migrate`                                          |
| **Prisma Studio**   | `pnpm db:studio`                                           |
| **API Only**        | `pnpm --filter @petrol/api build`                          |
| **Web Only**        | `pnpm --filter @petrol/web build`                          |

## 4. Technical Guardrails

### Prisma & Data Layer

- **Client Singleton:** Always import from `apps/api/src/lib/prisma.ts`.
- **Type Safety:** Never use `any`. Prisma generated types are the source of truth.
- **Migrations:** Use `prisma migrate dev`. Do not manually edit the generated `prisma-client` folder.
- **Decimals:** Financial values use (12,2), volume (12,3), meter readings (14,3).

### Auth Architecture

- **Better Auth:** Configured in `apps/api/src/auth.ts`.
- **Guards:** Global auth is default. Use `@AllowAnonymous()` for public routes and `@OptionalAuth()` for flexible endpoints.
- **Session:** Extract via `getRequiredSession()` from `apps/api/src/lib/auth-session.ts`.
- **Security:** Do not expose service keys on the frontend.

### Style & UI

- **Tailwind:** Use OKLCH tokens. No hardcoded hex values.
- **Icons:** Use `lucide-react` for all icons.
- **Tokens:** Maintain the defined dark teal branding (`#004F4F`).

## 5. Coding Conventions

- **Commit Style:** Use `type(scope): description`. Append `[AI-assisted]` to agent commits.
- **State Management:** Prioritize `Tanstack Query` for all server-side state in the `web` app. Do not fetch directly in components.
- **Modules:** ESM throughout (type: "module" in package.json).
- **API Patterns:** NestJS decorators, services handle business logic, Prisma transactions for multi-step ops.
- **Frontend Patterns:** Functional components with hooks, feature-based structure enforced.

## 6. Frontend Architecture (Feature-Based)

All frontend development within `apps/web/` must follow the feature-based structure:

```text
apps/web/src/features/{feature-name}/
├── api/            # API hooks (Tanstack Query)
├── components/     # Feature-specific UI components
├── hooks/          # Feature-specific hooks
├── types/          # Feature-specific TypeScript interfaces
└── index.ts        # Public API (Barrel file)
```

### Key Features

- `auth/` — Authentication (sign-in/sign-up via Better Auth)
- `setup/` — Station setup (organization, tanks, dispensers)
- `shift/` — Shift dashboard (daily operations)

## 7. Project Structure

```text
├── apps/
│   ├── api/              # NestJS backend (port 4000)
│   │   ├── src/
│   │   │   ├── auth.ts           # Better Auth config
│   │   │   ├── lib/              # Prisma client, session helpers
│   │   │   └── modules/          # NestJS modules (health, sales, setup)
│   │   └── prisma/
│   │       ├── schema.prisma     # Database schema
│   │       └── migrations/       # Migration history
│   └── web/              # React frontend (port 5173)
│       └── src/
│           ├── app.tsx           # Root component (auth → setup → dashboard)
│           ├── auth-client.ts    # Better Auth client
│           └── features/         # Feature modules
├── packages/
│   ├── config/           # Shared env config (getAppConfig)
│   └── tsconfig/         # Shared TS presets (base, react, nest)
├── package.json          # Root workspace scripts
└── pnpm-workspace.yaml   # Workspace definition
```

## 8. Environment

Required env vars (see `.env.example`):
- `NODE_ENV`, `PORT`, `API_URL`, `WEB_URL`
- `DATABASE_URL` (pooled), `DIRECT_URL` (migrations)
- `BETTER_AUTH_SECRET` (32+ chars)
- `VITE_API_URL` (frontend API endpoint)
