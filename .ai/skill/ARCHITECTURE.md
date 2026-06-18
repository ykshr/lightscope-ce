# File: .ai/skill/ARCHITECTURE.md

# 1. Repository Overview

LightScope CE is a high-performance web analytics platform powered by ClickHouse. The repository is structured as a TypeScript monorepo using pnpm workspaces to manage its various interconnected packages.

# 2. Technology Stack

* **Workspace manager**: pnpm workspaces (Evidence: `pnpm-workspace.yaml`, `package.json`)
* **Languages**: TypeScript, JavaScript
* **Frameworks**:
  * React 19 (Evidence: `packages/web/package.json`)
  * Hono (Evidence: `packages/api/package.json`, `packages/proxy/package.json`)
  * GraphQL Yoga (Evidence: `packages/api/package.json`)
* **Build tools**:
  * Vite (Evidence: `packages/web/package.json`)
  * esbuild (Evidence: `packages/api/package.json`)
  * TypeScript (tsc) (Evidence: `tsconfig.base.json`)
  * GraphQL Codegen (Evidence: `packages/api/package.json`, `packages/web/package.json`)
  * Prisma (Evidence: `packages/api/package.json`)
* **Test frameworks**:
  * Vitest (Evidence: `package.json`, `packages/web/package.json`)
  * Playwright (Evidence: `packages/e2e/package.json`)
* **Linting tools**: ESLint (Evidence: `package.json`)
* **Formatting tools**: Prettier (Evidence: `package.json`, `.prettierrc`)
* **Database technologies**:
  * ClickHouse (Evidence: `packages/clickhouse/package.json`, `packages/api/package.json`)
  * SQLite via Prisma adapter libsql (Evidence: `packages/api/package.json`)
* **API technologies**:
  * GraphQL for dashboard (Evidence: `packages/api/`)
  * REST for tracker event ingestion (Evidence: `packages/proxy/`)
* **State management libraries**: TanStack Query v5 (Evidence: `packages/web/package.json`)
* **UI component systems**:
  * Tailwind CSS v4 (Evidence: `packages/web/package.json`)
  * Radix UI (Evidence: `packages/web/package.json`)
  * shadcn/ui (Evidence: `packages/web/package.json`)

# 3. Directory Responsibilities

* **packages/web**: Frontend dashboard application (React, Vite, Tailwind).
* **packages/api**: GraphQL API backend serving the dashboard (Hono, Prisma, Better Auth).
* **packages/proxy**: REST API dedicated to fast tracker event ingestion (Hono, ClickHouse).
* **packages/tracker**: Client-side tracking script injected into target websites.
* **packages/clickhouse**: ClickHouse database configuration and SQL migrations.
* **packages/mock-site**: Mock site served via Nginx, used for end-to-end testing scenarios.
* **packages/e2e**: End-to-end user journey tests using Playwright.

# 4. Dependency Graph

```text
packages/e2e
↓
packages/web
↓
packages/api
↓
packages/proxy
↓
packages/tracker
```

* **ALLOWED dependencies**: `packages/web` depending on `packages/api` via `workspace:*` for GraphQL Codegen types (Evidence: `packages/web/package.json`).
* **FORBIDDEN dependencies**:
  * Deep cross-package imports.
  * `packages/tracker` depending on heavy node modules.
* **CIRCULAR dependencies**: Strictly prohibited.

# 5. Architectural Boundaries

Strict boundaries are maintained between workspace packages. Packages must interact through clearly defined public exports or workspace dependencies. Deep cross-package imports (e.g., `../../api/src/helpers/`) are forbidden to maintain encapsulation. For example, small utility functions like `redactError` are locally duplicated in `packages/api/src/helpers/` and `packages/proxy/src/helpers/` instead of violating boundaries (Evidence: `AGENTS.md`).

# 6. Golden Rules

### Rule 1: No Hardcoded Secret Fallbacks
* **Rationale**: To comply with strict security standards, missing secrets must trigger a secure failure. Fallbacks disguise configuration issues and introduce vulnerabilities.
* **Evidence**: `AGENTS.md` ("hardcoded secret fallbacks (e.g., `|| 'secret'` or `:-secret`) are prohibited across application code").
* **Violation example**:
  ```typescript
  const jwtSecret = process.env.JWT_SECRET || 'secret';
  ```
* **Correct example**:
  ```typescript
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }
  ```

### Rule 2: ClickHouse Parameter Binding
* **Rationale**: Parameter binding must be used for all ClickHouse queries to prevent SQL injection vulnerabilities.
* **Evidence**: Memory instructions specify parameter binding for LIMIT, OFFSET, and LIMIT BY clauses using `{name:Type}` syntax.
* **Violation example**:
  ```typescript
  const query = `SELECT * FROM events LIMIT ${limit}`;
  await clickhouse.query({ query });
  ```
* **Correct example**:
  ```typescript
  const query = `SELECT * FROM events LIMIT {limit:UInt32}`;
  await clickhouse.query({ query, query_params: { limit } });
  ```

### Rule 3: Strict Monorepo Boundaries
* **Rationale**: Prevent tight coupling between workspace packages by avoiding deep relative cross-package imports.
* **Evidence**: `AGENTS.md` ("Always import from a package's public exports. Deep cross-package imports (e.g., ../../api/src/...) are not allowed.").
* **Violation example**:
  ```typescript
  import { redactError } from '../../api/src/helpers/redactError';
  ```
* **Correct example**:
  ```typescript
  // Either imported via workspace package if exported:
  import { redactError } from '@lightscope-ce/api';
  // OR locally duplicated in the consuming package:
  import { redactError } from './helpers/redactError';
  ```

# 7. Technical Debt Notes

* **Inconsistencies & Pending Features**: Email verification functionality is pending. There are known `TODO: Send verification email to the user with the provided URL` comments in `packages/api/src/createContext.ts` and `packages/api/src/types/auth.ts`.
* **TypeScript Workarounds**: The use of `as any` casting is prevalent in test files (e.g., `packages/tracker/tests/unit/index.test.ts`) primarily for mocking browser globals like `fetch` or `window`.
* **Guidelines for Agents**: Do NOT recommend or perform cleanup of these technical debt items unless already explicitly requested. Agents must prioritize consistency with existing repository code over idealized architecture.