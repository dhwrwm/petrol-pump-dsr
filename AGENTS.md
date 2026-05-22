# AGENTS.md

## 1. Project Charter

This is a `pnpm` monorepo for a rental platform. The architecture emphasizes strict separation between business logic (NestJS) and persistence (Prisma). The goal is to maintain a type-safe, observable, and modular codebase.

## 2. Core Policies

- **Definition of Done:** All changes must be type-checked (`pnpm check-types`), linted (`pnpm lint`), and verified against existing patterns.
- **Human-in-the-Loop:** - ⚠️ **Ask First:** Database schema migrations, dependency changes, or auth-guard modifications.
  - 🚫 **Never:** Do not commit secrets, do not modify lockfiles manually, do not edit auto-generated Prisma files.
- **Architectural Integrity:** If a change impacts the API-Client contract, the agent must propose updates to both the API and Web workspaces simultaneously.

## 3. Operational Commands

_Use these as the primary interfaces for validation._

| Action              | Command                                                    |
| :------------------ | :--------------------------------------------------------- |
| **Full Validation** | `pnpm build`                                               |
| **API Suite**       | `pnpm --filter api build && pnpm --filter api test`        |
| **Web Suite**       | `pnpm --filter web check-types && pnpm --filter web build` |
| **Prisma Sync**     | `pnpm --filter api exec prisma generate`                   |

## 4. Technical Guardrails

### Prisma & Data Layer

- **Client Singleton:** Always import the client from `apps/api/src/lib/prisma.ts`.
- **Type Safety:** Never use `any`. Prisma generated types are the source of truth.
- **Migrations:** Use `prisma migrate dev`. Do not manually edit the generated `prisma-client` folder.

### Auth Architecture

- **Better Auth:** Configured in `apps/api/src/auth.ts`.
- **Guards:** Global auth is default. Use `@AllowAnonymous()` for public routes and `@OptionalAuth()` for flexible endpoints.
- **Security:** Do not expose service keys on the frontend. Ensure RLS is verified during schema evolution.

### Style & UI

- **Tailwind:** Use OKLCH tokens. No hardcoded hex values.
- **Tokens:** Maintain the defined dark teal branding (`#004F4F`).

## 5. Agent Interaction Rules

- **Proactive Validation:** If you touch a core service or auth policy, explain the impact on the existing codebase before execution.
- **Commit Style:** Use `type(scope): description`. Append `[AI-assisted]` to all primary agent commits to maintain an audit trail of agent-vs-human contribution.
- **State Management:** Prioritize `Tanstack Query` for all server-side state in the `web` app. Do not fetch directly in components.

## 6. Frontend Architecture (Feature-Based)

All frontend development within `apps/web/` must follow the feature-based structure to ensure modularity.

### Directory Structure

```text
apps/web/src/features/{feature-name}/
├── api/            # API hooks (Tanstack Query)
├── components/     # Feature-specific UI components
├── hooks/          # Feature-specific hooks
├── types/          # Feature-specific TypeScript interfaces
└── index.ts        # Public API (Barrel file)
```
