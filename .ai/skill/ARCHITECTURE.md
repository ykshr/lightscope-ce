# ARCHITECTURE.md

## Repository Overview

The LightScope CE repository is a monorepo managed using `pnpm` workspaces. It uses a modern web stack including React 19, Vite, Hono, GraphQL, ClickHouse, and Prisma.

## Technology Detection

The repository uses the following technologies:

* **Workspace manager**: pnpm workspaces
  * Evidence: `pnpm-workspace.yaml` and `package.json` at root.
* **Languages**: TypeScript, JavaScript
  * Evidence: `tsconfig.json` at root and `.ts`/`.tsx` files across all packages.
* **Frameworks**: React 19, Hono, GraphQL Yoga
  * Evidence: `"react": "^19.1.1"` in `packages/web/package.json`; `"hono": "^4.12.7"` in `packages/api/package.json` and `packages/proxy/package.json`; `"graphql-yoga": "^5.21.0"` in `packages/api/package.json`.
* **Build tools**: Vite, esbuild, TypeScript (tsc), GraphQL Codegen, Prisma
  * Evidence: `"vite": "^6.2.0"` in `packages/web/package.json`; `"esbuild": "^0.27.3"` in root `package.json` and `build` scripts; `"typescript": "^5.8.2"` in root `package.json`; `"@graphql-codegen/cli"` in `packages/api/package.json` and `packages/web/package.json`; `"prisma": "^7.5.0"` in `packages/api/package.json`.
* **Test frameworks**: Vitest, Playwright
  * Evidence: `"vitest": "^3.0.7"` in root `package.json`; `"@playwright/test": "^1.40.1"` in `packages/e2e/package.json`.
* **Linting tools**: ESLint
  * Evidence: `"eslint": "^9.21.0"` in root `package.json` and `eslint.config.js` in packages.
* **Formatting tools**: Prettier
  * Evidence: `"prettier": "^3.8.1"` in root `package.json` and `.prettierrc`.
* **Database technologies**: ClickHouse, SQLite (via Prisma adapter libsql)
  * Evidence: `"@clickhouse/client": "^1.18.2"` in `packages/api/package.json`; `"@libsql/client": "^0.17.0"` and `"@prisma/adapter-libsql": "^7.5.0"` in `packages/api/package.json`.
* **API technologies**: GraphQL (api), REST (proxy)
  * Evidence: `packages/api/src/graphql/` directory; `packages/proxy/src/routers/events/` defining REST routes.
* **State management libraries**: TanStack Query v5
  * Evidence: `"@tanstack/react-query": "^5.90.20"` in `packages/web/package.json`.
* **UI component systems**: Tailwind CSS v4, Radix UI, shadcn/ui
  * Evidence: `"tailwindcss": "^4.1.11"` in `packages/web/package.json`; `"@radix-ui/react-*"` in `packages/web/package.json`; `"shadcn": "^4.1.1"` in `packages/web/package.json`.

## Directory Structure

The repository is divided into focused packages located in the `packages/` directory:

* `packages/web`: Frontend dashboard built with React 19, Vite, and Tailwind v4.
* `packages/api`: GraphQL API backend built with Hono, GraphQL Server, Better Auth, and Prisma.
* `packages/proxy`: REST API for fast-path telemetry event ingestion built with Hono.
* `packages/tracker`: Client-side tracking script intended for browser environments.
* `packages/clickhouse`: ClickHouse configuration files and database migrations.
* `packages/e2e`: End-to-end tests using Playwright.
* `packages/mock-site`: A minimal mock website used to simulate targets during E2E testing.

Evidence:
* Documented directory descriptions found in `AGENTS.md` ("Project Structure").

## Dependency Graph and Boundaries

Dependencies between workspace packages are strictly controlled to maintain boundary encapsulation.

### Dependency Graph

```text
packages/e2e
│
├──> packages/web
├──> packages/api
├──> packages/proxy
└──> packages/tracker

packages/web
└──> packages/api (workspace:*, for codegen types)
```

### Allowed Dependencies
* Workspace imports via `workspace:*` (e.g., `packages/web` depending on `@lightscope-ce/api` for GraphQL codegen types).

Evidence:
* In `packages/web/package.json`: `"@lightscope-ce/api": "workspace:*"`
* In `packages/e2e/package.json`: `"@lightscope-ce/tracker": "workspace:*"`

### Forbidden Dependencies
* **Deep cross-package imports**: Importing files directly via relative paths across package boundaries (e.g., `../../api/src/helpers/`) is strictly forbidden. Packages must rely on public exports or locally duplicate small utility functions.
* **Heavy node modules in the tracker**: `packages/tracker` must remain lean and browser-compatible without heavy node modules. It is strictly forbidden from connecting directly to `packages/api` or ClickHouse (it must only route to `packages/proxy`).
* **Tracker isolation**: The tracker package should not have any backend dependencies.

Evidence:
* Strict monorepo boundaries are documented via overarching rules and enforced to avoid circular dependencies and module bleed.
