# File: .ai/skill/ARCHITECTURE.md

## 1. Repository Overview

LightScope CE (Community Edition) is a high-performance web analytics platform powered by ClickHouse. Built as a TypeScript monorepo using pnpm workspaces, it provides real-time data aggregation and a modern dashboard.

## 2. Technology Stack

* **Workspace Manager**: pnpm workspaces
  * Evidence: `pnpm-workspace.yaml`, `package.json`
* **Languages**: TypeScript, JavaScript
  * Evidence: `tsconfig.json` across all packages
* **Frameworks**:
  * **React 19**: Frontend UI library
    * Evidence: `packages/web/package.json` (`"react": "^19.1.1"`)
  * **Hono**: Backend routing framework
    * Evidence: `packages/api/package.json`, `packages/proxy/package.json` (`"hono": "^4.12.5"`)
  * **GraphQL Yoga**: GraphQL API framework
    * Evidence: `packages/api/package.json` (`"graphql-yoga": "^5.21.0"`)
* **Build Tools**:
  * **Vite**: Frontend bundler
    * Evidence: `packages/web/package.json` (`"vite"`)
  * **esbuild**: Backend bundler
    * Evidence: `packages/api/package.json`, `packages/proxy/package.json` (`"esbuild"`)
  * **GraphQL Codegen**: Type generation
    * Evidence: `packages/web/package.json`, `packages/api/package.json` (`"@graphql-codegen/cli"`)
  * **Prisma**: Database ORM (SQLite)
    * Evidence: `packages/api/package.json` (`"prisma": "^7.5.0"`, `"@prisma/client": "^7.5.0"`)
* **Test Frameworks**:
  * **Vitest**: Unit and integration testing
    * Evidence: `packages/web/package.json`, `packages/api/package.json` (`"vitest"`)
  * **Playwright**: End-to-end testing
    * Evidence: `packages/e2e/package.json` (`"@playwright/test"`)
* **Linting and Formatting**:
  * **ESLint**: Code linting
    * Evidence: `packages/web/package.json` (`"eslint"`)
  * **Prettier**: Code formatting
    * Evidence: `package.json` (root level formatting scripts)
* **Database Technologies**:
  * **ClickHouse**: Analytics database
    * Evidence: `packages/api/package.json`, `packages/proxy/package.json` (`"@clickhouse/client"`)
  * **SQLite (via Prisma libSQL)**: Relational metadata
    * Evidence: `packages/api/package.json` (`"@prisma/adapter-libsql"`)
* **State Management & UI**:
  * **TanStack Query v5**: Data fetching
    * Evidence: `packages/web/package.json` (`"@tanstack/react-query"`)
  * **Tailwind CSS v4**: Utility-first CSS
    * Evidence: `packages/web/package.json` (`"tailwindcss": "^4.1.11"`)
  * **Radix UI / shadcn/ui**: Component primitives
    * Evidence: `packages/web/package.json` (`"@radix-ui/react-*"`, `"shadcn"`)

## 3. Directory Responsibilities

* **`packages/web/`**: Frontend dashboard (React 19, Vite, Tailwind v4).
* **`packages/api/`**: GraphQL API backend serving data to the dashboard (Hono, GraphQL Server, Better Auth, Prisma).
* **`packages/proxy/`**: REST API for fast tracker event ingestion (Hono, ClickHouse).
* **`packages/tracker/`**: Client-side tracking script injected into target websites. Must remain lightweight.
* **`packages/clickhouse/`**: ClickHouse database configuration files and SQL migrations.
* **`packages/mock-site/`**: Mock site used purely for serving as a target during E2E testing.
* **`packages/e2e/`**: End-to-end tests using Playwright.

## 4. Dependency Graph

```text
packages/e2e
│
├─► packages/web
│   │
│   └─► packages/api (via workspace:* for codegen types)
│       │
│       └─► packages/clickhouse
│
├─► packages/proxy
│   │
│   └─► packages/clickhouse
│
└─► packages/tracker
```

## 5. Architectural Boundaries

* **ALLOWED Dependencies**:
  * `web` depending on `api` via `workspace:*` specifically for importing GraphQL codegen types.
* **FORBIDDEN Dependencies**:
  * Deep cross-package imports (e.g., `../../api/src/...` from within proxy or web).
  * `tracker` depending on heavy Node modules or React. It must use native browser globals.
* **CIRCULAR Dependencies**:
  * Packages must not form a dependency cycle.
* **Cross-Layer Violations**:
  * Direct database connections from the frontend (`web`).
  * Importing frontend components into backend packages.

## 6. Golden Rules

### Rule 1: No Hardcoded Secret Fallbacks
* **Rationale**: To comply with strict security standards, missing secrets must trigger a secure failure rather than silently using an insecure default.
* **Evidence**: `AGENTS.md` ("hardcoded secret fallbacks (e.g., `|| 'secret'` or `:-secret`) are prohibited across application code, test files, and `docker-compose.yml`.")
* **Violation Example**:
  ```typescript
  const secret = process.env.JWT_SECRET || 'secret';
  ```
* **Correct Example**:
  ```typescript
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  ```

### Rule 2: Strict Monorepo Boundaries
* **Rationale**: Deep cross-package imports cause tight coupling and break encapsulation. Small utilities should be safely duplicated rather than imported across boundaries.
* **Evidence**: `AGENTS.md` ("Always import from a package's public exports. Deep cross-package imports (e.g., `../../api/src/...`) are not allowed. To adhere to monorepo restrictions against deep cross-package imports, small utility functions like `redactError` are duplicated in both `packages/api/src/helpers/` and `packages/proxy/src/helpers/`.")
* **Violation Example**:
  ```typescript
  import { redactError } from '../../api/src/helpers/error';
  ```
* **Correct Example**:
  ```typescript
  import { redactError } from '@/helpers/error'; // (Duplicated inside the local package)
  ```

### Rule 3: English-Only Documentation and Code
* **Rationale**: Ensures consistency and maintainability across the codebase for all developers and AI agents globally.
* **Evidence**: `AGENTS.md` ("Write all code, comments, and commit messages in concise and intuitive English. All documentation... must be written entirely in English.")
* **Violation Example**:
  ```typescript
  // ユーザーデータを取得する
  const data = await fetchData();
  ```
* **Correct Example**:
  ```typescript
  // Fetch user data
  const data = await fetchData();
  ```

## 7. Technical Debt Notes

* **Inconsistencies**: There are occasional uses of `as any` in test files. AI agents must prioritize consistency with existing code over idealized architecture; do not refactor or clean up `as any` unless it is explicitly related to a current task.
* **Code Duplication**: Utility functions like `redactError` are intentionally duplicated between `packages/api/src/helpers/` and `packages/proxy/src/helpers/` to prevent violating the monorepo boundary rules. This is accepted technical debt and should not be "fixed" by creating a shared package unless specifically requested.
* **Mocks**: When mocking DOM globals in Vitest for the `tracker` package, the return value is often cast to `as any` or `HTMLCollectionOf<Element>` to satisfy TypeScript.
