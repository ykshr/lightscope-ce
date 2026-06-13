# File: .ai/skill/ARCHITECTURE.md

# Repository Architecture Reference

## 1. Repository Overview

LightScope CE (Community Edition) is a high-performance web analytics platform powered by ClickHouse. It is built as a TypeScript monorepo using `pnpm workspaces` to manage multiple interconnected packages. The repository strictly separates concerns into independent packages such as frontend dashboard, GraphQL API backend, REST API for event ingestion, database schema/migrations, and client-side tracking script.

## 2. Technology Stack

* **Workspace manager**: pnpm workspaces
  * Evidence: `pnpm-workspace.yaml`, `package.json` at root
* **Languages**: TypeScript, JavaScript
  * Evidence: `tsconfig.base.json`, `.ts` and `.tsx` files throughout the repository
* **Frameworks**:
  * Frontend: React 19, Vite
    * Evidence: `packages/web/package.json` (`react`, `vite`, `@vitejs/plugin-react`)
  * Backend API: Hono, GraphQL Yoga
    * Evidence: `packages/api/package.json` (`hono`, `graphql-yoga`, `@hono/node-server`)
  * Proxy API: Hono
    * Evidence: `packages/proxy/package.json` (`hono`, `@hono/node-server`)
* **Build tools**: Vite, esbuild, TypeScript (tsc), GraphQL Codegen, Prisma
  * Evidence: `packages/api/package.json` (`esbuild`, `tsc`, `graphql-codegen`, `prisma`), `packages/web/package.json` (`vite`, `tsc`)
* **Test frameworks**: Vitest, Playwright
  * Evidence: `packages/api/package.json` (`vitest`), `packages/e2e` for Playwright
* **Linting tools**: ESLint
  * Evidence: `packages/web/package.json` (`eslint`)
* **Formatting tools**: Prettier
  * Evidence: `.prettierrc`, root `package.json` (`prettier`)
* **Database technologies**: ClickHouse, SQLite (via Prisma adapter)
  * Evidence: `packages/clickhouse/`, `packages/api/package.json` (`@clickhouse/client`, `@prisma/adapter-libsql`, `@libsql/client`)
* **API technologies**: GraphQL, REST
  * Evidence: `packages/api` (GraphQL), `packages/proxy` (REST)
* **State management libraries**: TanStack Query
  * Evidence: `packages/web/package.json` (`@tanstack/react-query`)
* **UI component systems**: Tailwind CSS v4, Radix UI, shadcn/ui
  * Evidence: `packages/web/package.json` (`tailwindcss`, `@radix-ui/react-*`, `shadcn`)

## 3. Directory Responsibilities

* `packages/web/`: Frontend dashboard. React application for visualizing analytics data.
* `packages/api/`: GraphQL API backend. Serves data to the dashboard. Uses Hono, Better Auth, and Prisma.
* `packages/proxy/`: REST API for tracker event ingestion. High-throughput service built with Hono to stream events to ClickHouse.
* `packages/tracker/`: Client-side tracking script. Lightweight utility script deployed to client websites.
* `packages/clickhouse/`: ClickHouse configuration files and SQL migrations.
* `packages/e2e/`: End-to-end tests using Playwright.
* `packages/mock-site/`: Mock site used for E2E testing.
* `tests/unit/`: Inside each package, contains function-level unit tests.
* `tests/integration/`: Inside each package, contains package-level integration tests.

## 4. Dependency Graph

```text
packages/e2e (Testing)
 ↓
packages/mock-site (Testing)
 ↓
packages/web (Dashboard)
 ↓
packages/api (GraphQL Backend)
 ↓
packages/proxy (REST Ingestion Backend)
 ↓
packages/tracker (Client-side Script)
```

**ALLOWED dependencies**:
* `packages/web` -> `@lightscope-ce/api` (via workspace dependency for GraphQL codegen types).
* Tests -> Source code within the same package.

**FORBIDDEN dependencies**:
* Deep cross-package imports (e.g., `import X from '../../api/src/...'`). Always import from a package's public exports or duplicate small utilities.
* `packages/tracker` -> Heavy external libraries or Node.js-specific APIs. Must remain native and lightweight.
* `packages/api` -> External ORMs other than Prisma.

**CIRCULAR dependencies**:
* `db:generate:auth` running before `prisma generate`. Resolved by using a dummy Prisma client (`const dummyPrisma = {} as any`) in `prisma/auth.ts`.

## 5. Architectural Boundaries

* **Ingestion vs. Consumption**: Event ingestion is handled by a dedicated lightweight `proxy` REST service, separate from the `api` GraphQL service used by the web dashboard.
* **Testing Levels**: Unit tests do not require package startup. Integration tests require only the target package to be started with external dependencies mocked. E2E tests require all packages to be running.
* **Tracker Constraints**: The `tracker` package must use native browser globals and avoid bundling React or other heavy frameworks to ensure minimal bundle size.

## 6. Golden Rules

### Golden Rule 1: No Hardcoded Secret Fallbacks
* **Rationale**: Security standards mandate that sensitive secrets must be explicitly configured in the environment to prevent accidental credential leakage in source code or CI workflows.
* **Evidence**: `AGENTS.md` guidelines and `JWT_SECRET` / `DATABASE_URL` requirements.
* **Violation Example**: `const secret = process.env.JWT_SECRET || 'default-secret-do-not-use';`
* **Correct Example**: `if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required'); const secret = process.env.JWT_SECRET;`

### Golden Rule 2: SQL Parameter Binding for ClickHouse
* **Rationale**: To prevent SQL injection, all dynamically injected query limits and offsets must use ClickHouse parameter binding (`{name:Type}`) rather than string interpolation.
* **Evidence**: ClickHouse queries in `packages/api/src/graphql/loaders/`.
* **Violation Example**: `const query = \`SELECT * FROM events LIMIT ${limit}\`;`
* **Correct Example**: `const query = \`SELECT * FROM events LIMIT {limit:UInt32}\`; await client.query({ query, query_params: { limit: 10 } });`

### Golden Rule 3: Strict Monorepo Boundaries & No Deep Imports
* **Rationale**: Deep cross-package imports break encapsulation and build tooling (e.g., TS compilation). Utilities needed in multiple places should be duplicated if they are small or exported via package boundary.
* **Evidence**: `AGENTS.md` restrictions.
* **Violation Example**: `import { redactError } from '../../api/src/helpers/error';` inside `packages/proxy`.
* **Correct Example**: Duplicating `redactError` in both `packages/api/src/helpers/error.ts` and `packages/proxy/src/helpers/error.ts`.

## 7. Technical Debt Notes

* Some usages of `as any` exist in test files and specific type casting scenarios (e.g., mocking `window` objects or bridging Better Auth). Do not arbitrarily replace `as any` in existing test files unless refactoring the entire test context, as it may satisfy current TypeScript compiler requirements during builds.
* The `TODO: Send reset password email` comments inside `packages/api/src/createContext.ts` and `packages/api/src/types/auth.ts` are pending implementation but are intentionally left as reminders.
