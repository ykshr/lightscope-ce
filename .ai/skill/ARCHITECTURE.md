# LightScope CE Repository Architect Skill

## Objective

This document teaches AI agents how to work inside the LightScope CE codebase without introducing architectural drift. It details the repository structure, dependency boundaries, coding conventions, architectural constraints, and validation procedures based strictly on the current repository state.

## 1. Technology Stack Evidence

The repository relies on a robust stack identified from `pnpm-workspace.yaml`, `package.json` files, and source code.

*   **Workspace manager**: pnpm workspaces (Evidence: `pnpm-workspace.yaml`, `package.json` with `packages/*` patterns).
*   **Languages**: TypeScript (default language across the monorepo), JavaScript (limited configuration and build scripts like `utils/wait-for-services.js`).
*   **Frameworks**:
    *   **React 19**: Frontend UI (Evidence: `packages/web/package.json` -> `"react": "^19.1.1"`).
    *   **Hono**: High-performance routing for APIs (Evidence: `packages/api/package.json` and `packages/proxy/package.json` -> `"hono": "^4.12.5"`).
    *   **GraphQL Yoga**: GraphQL server for the main API (Evidence: `packages/api/package.json` -> `"graphql-yoga": "^5.21.0"`).
*   **Build tools**:
    *   **Vite**: Frontend bundling (Evidence: `packages/web/package.json`).
    *   **esbuild**: Fast compilation for tracker and proxy packages (Evidence: `packages/tracker/package.json`, `packages/proxy/package.json`).
    *   **TypeScript (tsc)**: Type checking and module generation (Evidence: `tsc -b` commands across scripts).
    *   **GraphQL Codegen**: Syncs frontend types with the backend schema (Evidence: `"graphql-codegen --config codegen.ts"` in `web` and `api`).
    *   **Prisma**: ORM and database schema management (Evidence: `packages/api/package.json` -> `"prisma": "^7.5.0"`).
*   **Test frameworks**:
    *   **Vitest**: Primary unit and integration testing tool (Evidence: `vitest` scripts in package.json files).
    *   **Playwright**: End-to-end browser testing (Evidence: `packages/e2e/package.json` -> `"@playwright/test": "^1.40.1"`).
*   **Linting tools**: ESLint (Evidence: `@eslint/js`, `eslint` in root `package.json`).
*   **Formatting tools**: Prettier (Evidence: `"format": "prettier --write ."` in root `package.json`).
*   **Database technologies**:
    *   **ClickHouse**: High-performance analytics data storage (Evidence: `@clickhouse/client` dependencies, `packages/clickhouse/` directory).
    *   **SQLite (via Prisma adapter libsql)**: Relational data (users, organizations) (Evidence: `@prisma/adapter-libsql` in `packages/api`).
*   **API technologies**:
    *   **GraphQL**: Main API interface handled by `packages/api`.
    *   **REST**: Used specifically for event ingestion in `packages/proxy`.
*   **State management**: TanStack Query v5 (Evidence: `packages/web/package.json` -> `"@tanstack/react-query": "^5.90.20"`).
*   **UI component systems**: Tailwind CSS v4, Radix UI, shadcn/ui (Evidence: `packages/web/package.json` dependencies).

## 2. Repository Structure Analysis

The repository is structured around a pnpm workspace model dividing responsibilities across specialized packages.

### Directory Mapping

*   **`packages/web`**: The frontend dashboard application (React 19, Vite, Tailwind). Consumes the API via GraphQL and presents analytics data.
*   **`packages/api`**: The primary GraphQL backend (Node.js, Hono, GraphQL Yoga, Prisma, Better Auth). Handles user authentication, database CRUD operations, and queries ClickHouse to resolve analytical queries.
*   **`packages/proxy`**: A lightweight REST API built with Hono specifically to receive fast event telemetry from the client-side tracker.
*   **`packages/tracker`**: The client-side telemetry script compiled for browser execution. Minimal dependencies, strict TypeScript.
*   **`packages/clickhouse`**: Contains Docker configurations and SQL schema migrations for the analytics database.
*   **`packages/mock-site`**: A controlled local web application utilized exclusively as a target for the End-to-End testing suite.
*   **`packages/e2e`**: Contains complete End-to-End user journey tests written in Playwright.

### Dependency Boundaries

```text
packages/e2e
↓ (tests)
packages/mock-site (which includes the tracker script)
↓ (sends data)
packages/proxy
↓ (writes to)
ClickHouse DB
↑ (reads from)
packages/api
↑ (queries via GraphQL)
packages/web
```

*   **ALLOWED dependencies**:
    *   `packages/web` depending on `packages/api` via `workspace:*` strictly to access generated schemas and types for `graphql-codegen`.
*   **FORBIDDEN dependencies**:
    *   **Deep cross-package imports**: Importing from `../../api/src/...` is strictly prohibited. Packages must rely on public exports or locally duplicate small utilities (like `redactError`) to maintain strict monorepo encapsulation boundaries.
    *   **Heavy node modules in the tracker**: `packages/tracker` must remain lean and browser-compatible. It must not depend on server-side modules or large libraries.
*   **CIRCULAR dependencies**:
    *   None are permitted. Relying on workspace links in a circular manner will break the pnpm graph and builds.
*   **Cross-layer violations**:
    *   `packages/tracker` connecting directly to `packages/api` or ClickHouse. Tracker must ONLY route to `packages/proxy`.



## 3. Pattern Mining

### 3.1. API Patterns

**GraphQL Resolvers and Dataloaders**
*   **Explanation**: In `packages/api`, complex entity relationships and data fetching logic are isolated within GraphQL resolvers which heavily utilize Dataloaders to batch and optimize queries (specifically against ClickHouse).
*   **Example File**: `packages/api/src/graphql/loaders/rank.ts` and `packages/api/src/graphql/loaders/article.ts`.
*   **Code Snippet**:
    ```typescript
    // Loaders batch requests to prevent N+1 issues
    const data = await query<RankAnalytics>(client, sql, queryParamsObj);
    ```
*   **When to use**: Whenever fetching aggregated analytical data or resolving nested GraphQL fields.
*   **When not to use**: Do not resolve complex relational trees directly in the resolver function body without a dataloader layer.

**REST Event Ingestion Endpoints**
*   **Explanation**: Fast-path telemetry events from the tracker are handled by Hono REST endpoints in `packages/proxy` rather than GraphQL to minimize latency and payload overhead.
*   **Example File**: `packages/proxy/src/routers/events/index.ts`.
*   **Code Snippet**:
    ```typescript
    eventsRouter.post('/', async (c: Context) => {
      const body = await c.req.json();
      const parseResult = PayloadSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({ error: 'Invalid payload' }, 400);
      }
      // Process telemetry event...
    });
    ```
*   **When to use**: For high-volume, write-only data ingestion paths like the tracker payload.
*   **When not to use**: Do not use the REST proxy for complex data querying or frontend dashboard requests.

### 3.2. Database Patterns

**ClickHouse Parameter Binding**
*   **Explanation**: When querying ClickHouse, SQL injection and formatting issues are prevented by passing a `queryParams` object to the `@clickhouse/client`.
*   **Example File**: `packages/api/src/graphql/loaders/helpers/clickhouse.ts` and `packages/api/src/graphql/loaders/rank.ts`.
*   **Code Snippet**:
    ```typescript
    const sql = `
      SELECT domain, path, count() AS page_views
      FROM {tableName:Identifier}
      WHERE {where:String}
      GROUP BY domain, path
    `;
    const data = await query<RankAnalytics>(client, sql, { tableName: 'page_views', where: '1=1' });
    ```
*   **When to use**: Always use `{paramName:Type}` syntax in the SQL string and pass the corresponding values in the third argument to the query function.
*   **When not to use**: Never use JavaScript string interpolation (e.g., `${tableName}`) for variables within ClickHouse SQL query strings.

### 3.3. Frontend Patterns

**React Suspense with Lazy Loading**
*   **Explanation**: Route components are dynamically imported using `React.lazy()` and wrapped in `<Suspense>` boundaries to reduce initial bundle size and speed up the primary paint.
*   **Example File**: `packages/web/src/App.tsx`.
*   **Code Snippet**:
    ```tsx
    const Article = lazy(() => import('@/pages/article'));
    const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
        {children}
      </Suspense>
    );
    // Inside router:
    <SuspenseWrapper><Article /></SuspenseWrapper>
    ```
*   **When to use**: When adding new top-level page components to the routing layer in the React frontend.
*   **When not to use**: Do not use lazy loading for critical UI shells (like Navigation or Sidebar components) that must render immediately.

**XSS Mitigation with `dangerouslySetInnerHTML`**
*   **Explanation**: When injecting dynamic CSS properties (e.g., dynamic chart colors) directly into a `<style>` tag, identifiers and values must be strictly sanitized to prevent style injection breakouts.
*   **Example File**: `packages/web/src/components/ui/chart.tsx`.
*   **Code Snippet**:
    ```tsx
    // Concept derived from repository rules regarding sanitizeCSSIdentifier and sanitizeCSSValue
    // mitigating XSS in:
    <style dangerouslySetInnerHTML={{ __html: dynamicCssString }} />
    ```
*   **When to use**: When dynamically generating complex `<style>` blocks that depend on user-provided configuration or external inputs.
*   **When not to use**: Do not use `dangerouslySetInnerHTML` if the styling can be achieved using standard React `style={{}}` inline objects or Tailwind classes.

### 3.4. Testing Patterns

**Browser Global Stubbing in Vitest**
*   **Explanation**: To test DOM-dependent tracker logic in Node.js without the massive overhead of `jsdom`, Vitest's `vi.stubGlobal` is used to selectively mock necessary globals like `window`, `document`, and `navigator`.
*   **Example File**: `packages/tracker/tests/unit/metadata.test.ts`.
*   **Code Snippet**:
    ```typescript
    beforeEach(() => {
      vi.stubGlobal('window', {
        location: { href: 'http://test.com', pathname: '/test' },
        addEventListener: vi.fn(),
      });
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    ```
*   **When to use**: When unit testing client-side packages (like `packages/tracker`) that interact with browser APIs.
*   **When not to use**: Do not use this in Playwright E2E tests or React frontend tests where a full DOM environment is already provided by the test runner.

## 4. Architectural Constraints

### Golden Rules

**1. No Hardcoded Secret Fallbacks**
*   **Rationale**: Security best practices mandate that applications fail fast and securely when configuration is missing. Providing a fallback string (e.g., `'secret'`) masks configuration errors and creates high-risk vulnerabilities in production environments.
*   **Evidence**: Enforced explicitly by repository memory constraints and CI rules regarding `JWT_SECRET`.
*   **Violation Example**: `const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';`
*   **Correct Example**:
    ```typescript
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is missing.');
    }
    const jwtSecret = process.env.JWT_SECRET;
    ```

**2. Strict Monorepo Boundaries**
*   **Rationale**: To maintain high cohesion within packages and loose coupling between them, pnpm workspaces must operate as independent modules. Circumventing the package structure via relative path traversals creates brittle codebases and breaks independent testing.
*   **Evidence**: Explicit repository instruction prohibiting deep cross-package imports.
*   **Violation Example**: `import { deepMerge } from '../../api/src/graphql/resolvers/helpers/deepMerge';` inside `packages/proxy`.
*   **Correct Example**: Replicate the small helper function within the target package (e.g., creating `packages/proxy/src/helpers/deepMerge.ts`).

**3. ClickHouse Parameter Binding**
*   **Rationale**: Direct string interpolation for SQL queries risks SQL Injection (SQLi) attacks and often results in malformed queries due to missing quotes or incorrect type casting. The ClickHouse client provides built-in parameterization.
*   **Evidence**: The implementations in `packages/api/src/graphql/loaders/rank.ts` strictly pass a `queryParamsObj` to the ClickHouse `query` helper.
*   **Violation Example**: `const sql = \`SELECT * FROM \${tableName} WHERE id = '\${userId}'\`; await client.query({ query: sql });`
*   **Correct Example**: `const sql = \`SELECT * FROM {tableName:Identifier} WHERE id = {userId:String}\`; await client.query({ query: sql, query_params: { tableName: 'users', userId: '123' } });`

## 5. Existing Technical Debt

*   **`as any` in Test Environments**: There is widespread use of type assertions (`as any`) within Vitest test suites, specifically in `packages/tracker/tests/unit/` and `packages/proxy/tests/unit/`, to quickly mock complex interfaces like `window`, `localStorage`, `fetch`, and Hono context (`c.set`). *Do not attempt to strictly type these mocks unless the user explicitly requests a refactor.* AI agents must prioritize consistency over idealized type architectures.
*   **Pending Implementation TODOs**: There are legacy `TODO` comments in `packages/api/src/createContext.ts` and `packages/api/src/types/auth.ts` regarding email integration (`// TODO: Send password reset email`, `// TODO: Send verification email`). Ignore these markers unless actively implementing the email service feature.

## 6. Validation Procedures

Before finalizing a plan or completing work, ensure the following validations pass:
*   **Installation**: Run `pnpm install` at the root.
*   **Format Verification**: Run `pnpm exec prettier --write <filepath>` on modified files to resolve CI format checks.
*   **Linting**: Run `pnpm run lint` from the root.
*   **Unit Tests**: Run `pnpm --filter <package-name> run test` to verify logic.
*   **Integration Tests**: Run `pnpm --filter <package-name> run test:integration` (ensuring background services/Docker are active if necessary).
