# File: .ai/skill/ARCHITECTURE.md

## 1. Repository Overview

LightScope CE (Community Edition) is a high-performance web analytics platform powered by ClickHouse. Built as a strict TypeScript monorepo, it provides real-time data aggregation and a modern dashboard.

## 2. Technology Stack

* **Workspace Manager:** pnpm workspaces
  * Evidence: `pnpm-workspace.yaml`, `package.json` at root and in packages.
* **Languages:** TypeScript, JavaScript
  * Evidence: `tsconfig.base.json`, multiple `tsconfig.json` files, `.ts` and `.tsx` file extensions.
* **Frameworks:** React 19, Hono, GraphQL Yoga
  * Evidence: `packages/web/package.json` (`react`, `react-dom` v19.1.1), `packages/api/package.json` (`hono`, `graphql-yoga`), `packages/proxy/package.json` (`hono`).
* **Build tools:** Vite, esbuild, TypeScript (tsc), GraphQL Codegen, Prisma
  * Evidence: `packages/web/package.json` (`vite`, `graphql-codegen`), `packages/api/package.json` (`esbuild`, `prisma`, `graphql-codegen`).
* **Test frameworks:** Vitest, Playwright
  * Evidence: `vitest.config.ts` files across packages, `packages/e2e/playwright.config.ts`, `packages/e2e/package.json` (`@playwright/test`).
* **Linting tools:** ESLint
  * Evidence: `.eslintcache` in scripts, `eslint-plugin-*` in `package.json`.
* **Formatting tools:** Prettier
  * Evidence: `.prettierrc`, `.prettierignore`, `"singleQuote": true` rule.
* **Database technologies:** ClickHouse, SQLite (via Prisma adapter libsql)
  * Evidence: `packages/api/package.json` (`@clickhouse/client`, `@prisma/adapter-libsql`), `packages/clickhouse/` directory.
* **API technologies:** GraphQL (api), REST (proxy)
  * Evidence: `packages/api` provides a GraphQL endpoint, `packages/proxy` provides REST endpoints for tracker ingestion.
* **State management libraries:** TanStack Query v5
  * Evidence: `packages/web/package.json` (`@tanstack/react-query`).
* **UI component systems:** Tailwind CSS v4, Radix UI, shadcn/ui
  * Evidence: `packages/web/package.json` (`tailwindcss`, `@radix-ui/*`, `shadcn`).

## 3. Directory Responsibilities

* `packages/web/`: Frontend application (React 19, Vite, Tailwind CSS v4, Recharts). Responsible for the user interface and dashboard.
* `packages/api/`: GraphQL API backend (Node.js, Hono, ClickHouse, Prisma, Better Auth). Handles business logic, data retrieval from ClickHouse, and user authentication.
* `packages/proxy/`: REST API for tracker event ingestion (Node.js, Hono, ClickHouse). Designed for high-throughput, low-latency ingestion of events from the tracker script.
* `packages/tracker/`: Client-side tracking script. A lightweight, performance-critical script embedded in user websites to collect analytics data. Must not use heavy external libraries or Node.js APIs.
* `packages/clickhouse/`: ClickHouse database configuration and SQL migrations. Responsible for setting up the analytical data store.
* `packages/mock-site/`: Mock site used for E2E testing, served via Nginx.
* `packages/e2e/`: End-to-end tests using Playwright. Covers comprehensive user journeys and data flows across the entire stack.

## 4. Dependency Graph

```text
packages/e2e
↓
packages/web (Depends on packages/api for codegen via workspace:*)
↓
packages/api (Connects to ClickHouse, SQLite via Prisma)
packages/proxy (Connects to ClickHouse)
↓
packages/tracker (Generates events sent to packages/proxy)
```

## 5. Architectural Boundaries

* **ALLOWED Dependencies:**
  * `packages/web` explicitly depends on `@lightscope-ce/api` (`workspace:*`) for GraphQL codegen types to ensure `pnpm` builds them in the correct order.
* **FORBIDDEN Dependencies:**
  * Deep cross-package imports (e.g., `../../api/src/...`) are strictly prohibited. Small utility functions should be duplicated (e.g., `redactError` in both API and Proxy) rather than violating boundaries.
  * `packages/tracker` MUST NOT depend on heavy node modules or external libraries like React. It must rely on native browser globals.
* **CIRCULAR Dependencies:**
  * To avoid circular dependencies during Prisma generation, `packages/api` uses a dedicated configuration file `prisma/auth.ts` with a dummy Prisma client for Better Auth `auth generate`.

## 6. Golden Rules

### Golden Rule 1: No Hardcoded Secret Fallbacks
* **Rationale:** Hardcoded secrets or fallbacks (e.g., `|| 'secret'`, `:-secret`) pose a severe security risk if committed to version control or deployed to production. Missing secrets must fail securely (e.g., throwing an error).
* **Evidence:** See system memory: "To comply with strict security standards, hardcoded secret fallbacks... are prohibited across application code, test files, and docker-compose.yml."
* **Violation Example:**
  ```typescript
  const secret = process.env.JWT_SECRET || 'dev_secret_key'; // FORBIDDEN
  ```
* **Correct Example:**
  ```typescript
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be defined');
  ```

### Golden Rule 2: Strict ClickHouse Parameter Binding
* **Rationale:** To prevent SQL injection attacks, all variable inputs in ClickHouse queries (including `LIMIT`, `OFFSET`, `LIMIT BY` clauses) must be parameterized.
* **Evidence:** `packages/api/src/graphql/loaders/helpers/clickhouse.ts` and memory: "ClickHouse queries... must use parameter binding for LIMIT, OFFSET... using the {name:Type} syntax".
* **Violation Example:**
  ```typescript
  const query = `SELECT * FROM events LIMIT ${limit}`; // FORBIDDEN
  ```
* **Correct Example:**
  ```typescript
  const query = `SELECT * FROM events LIMIT {limit:UInt32}`; // ALLOWED
  const rows = await client.query({ query, query_params: { limit } });
  ```

### Golden Rule 3: Native Browser Globals for Tracker
* **Rationale:** The tracker script must remain extremely lightweight and performant as it is embedded in third-party websites. It must use native browser APIs and avoid polyfills or heavy libraries.
* **Evidence:** Memory: "The `packages/tracker` package is performance-critical... it must rely on native browser globals (`window`, `document`, `navigator`)."
* **Violation Example:**
  ```typescript
  import React from 'react'; // FORBIDDEN in packages/tracker
  ```
* **Correct Example:**
  ```typescript
  const currentScript = document.currentScript as HTMLScriptElement; // ALLOWED
  ```

## 7. Technical Debt Notes
* **`as any` Usage:** Some instances of `as any` exist in the codebase, particularly within test files and type casts (e.g., `packages/web/src/components/tables/ArticleTable.tsx`, `packages/api/src/graphql/resolvers/helpers/deepMerge.ts`). While new code should avoid `any`, prioritize consistency and only clean up if explicitly part of the task scope.
* **Pending TODOs:** There are pending TODOs regarding email sending logic (e.g., in `packages/api/src/createContext.ts`). Do not implement these unless requested.
