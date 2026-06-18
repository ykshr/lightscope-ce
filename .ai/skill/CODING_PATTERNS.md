# File: .ai/skill/CODING_PATTERNS.md

# 1. TypeScript Patterns

### Secure Object Deep Merge
* **Description**: Safely merging objects while preventing prototype pollution by explicitly checking and skipping `__proto__`, `constructor`, and `prototype` keys.
* **Example Path**: `packages/api/src/graphql/resolvers/helpers/deepMerge.ts`
* **Code Snippet**:
  ```typescript
  Object.keys(source).forEach((key) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return;
    }
    // merge logic...
  });
  ```
* **When To Use**: When deep merging nested objects from user input or external APIs.
* **When Not To Use**: For shallow merges or merging trusted internal configuration where `Object.assign` or spread syntax suffices.

### Single-Pass Data Transformation
* **Description**: Renaming snake_case keys to camelCase while simultaneously formatting date strings in a single pass to optimize performance.
* **Example Path**: `packages/api/src/graphql/loaders/helpers/clickhouse.ts` (`formatData` function)
* **Code Snippet**:
  ```typescript
  export const formatData = <T>(data: T[], dateKeys: string[] = []): T[] => {
    if (dateKeys.length === 0) {
      return data.map((row) => renameKeySnakeToCamel(row));
    }
    // Combine renaming and date formatting into a single pass
  };
  ```
* **When To Use**: When returning data directly from ClickHouse DB queries to GraphQL resolvers.
* **When Not To Use**: Pattern not found in repository for purely REST JSON responses where performance optimization is not needed.

# 2. API Patterns

### GraphQL Resolvers and DataLoaders
* **Description**: Using GraphQL Yoga to expose data fetched efficiently through DataLoaders that batch ClickHouse queries.
* **Example Path**: `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
* **When To Use**: For all client-facing data retrieval requests from the React dashboard.
* **When Not To Use**: Do not use GraphQL for high-volume, lightweight event ingestion from external trackers.

### REST Event Ingestion Endpoints
* **Description**: Using Hono and REST for lightweight, fast ingestion endpoints.
* **Example Path**: `packages/proxy/src/index.ts`
* **When To Use**: For receiving high-throughput tracking events from the client-side tracker (`packages/tracker`).
* **When Not To Use**: Do not use REST endpoints for dashboard data fetching; use GraphQL instead.

### Silent Auth Provider Missing Credentials
* **Description**: `AuthProvider` implementations return `null` silently for missing credentials to minimize log noise, while `console.error` is reserved for actionable failures (e.g., invalid JWTs).
* **Example Path**: `packages/proxy/` implementations
* **When To Use**: When validating bearer tokens or API keys on public ingestion routes.
* **When Not To Use**: Do not fail silently when processing user authentication for the dashboard.

# 3. Database Patterns

### ClickHouse Query Parameter Binding
* **Description**: Parameter binding for `LIMIT`, `OFFSET`, and `LIMIT BY` clauses to prevent SQL injection.
* **Example Path**: `packages/api/src/graphql/loaders/`
* **Code Snippet**:
  ```typescript
  const query = `SELECT * FROM events LIMIT {limit:UInt32}`;
  await clickhouse.query({ query, query_params: { limit } });
  ```
* **When To Use**: For any dynamic value interpolation in ClickHouse queries.
* **When Not To Use**: Never use template literals (e.g., `${value}`) directly in ClickHouse query strings for user-provided values.

### Prisma Client for Relational Data
* **Description**: Using Prisma with the libsql adapter for SQLite to manage relational configurations and user data.
* **Example Path**: `packages/api/src/index.ts` (Prisma instantiation)
* **When To Use**: For storing users, roles, and dashboard configurations.
* **When Not To Use**: Do not use Prisma for high-volume analytics event storage (use ClickHouse).

# 4. Frontend Patterns

### React Lazy Loading and Suspense
* **Description**: Code-splitting React components using `React.lazy` and `Suspense`.
* **Example Path**: `packages/web/src/` (Router configuration)
* **When To Use**: For route-level component loading to optimize bundle sizes.
* **When Not To Use**: For small, frequently used UI components (like buttons).

### Synchronous Derived State (`useMemo`)
* **Description**: Computing derived state synchronously during render using `useMemo` rather than managing it with `useState` combined with `useEffect`.
* **Example Path**: `packages/web/src/components/` (e.g., `useProcessData` hooks)
* **When To Use**: When transforming data props before rendering (e.g., sorting, filtering, aggregating).
* **When Not To Use**: When fetching asynchronous data.

### XSS Mitigation in dangerouslySetInnerHTML
* **Description**: Sanitizing CSS identifiers and values before using `dangerouslySetInnerHTML` to inject dynamic styles.
* **Example Path**: `packages/web/src/components/ui/chart.tsx`
* **Code Snippet**:
  ```tsx
  <style
    dangerouslySetInnerHTML={{
      __html: `... css ...`
    }}
  />
  ```
* **When To Use**: When injecting custom CSS configurations directly into components (like charts).
* **When Not To Use**: Do not use `dangerouslySetInnerHTML` for standard text rendering.

### Semantic Links vs Buttons for Navigation
* **Description**: Using semantic `<Link>` components from `react-router-dom` rather than `<button>` elements with `onClick={() => navigate(...)}`.
* **Example Path**: `packages/web/src/`
* **When To Use**: For client-side navigation to ensure screen reader accessibility and middle-click support.
* **When Not To Use**: For submitting forms or triggering UI state changes (use `<button>`).

# 5. Testing Patterns

### Stubbing Browser Globals
* **Description**: Using `vi.stubGlobal` combined with `vi.unstubAllGlobals()` to mock browser globals like `window` or `document` safely in Vitest.
* **Example Path**: `packages/tracker/tests/unit/index.test.ts`
* **Code Snippet**:
  ```typescript
  beforeEach(() => {
    vi.stubGlobal('window', { addEventListener: vi.fn() });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  ```
* **When To Use**: When unit testing client-side scripts (like the tracker) in a Node.js environment.
* **When Not To Use**: In integration or E2E tests where a real browser or DOM environment is available.

### Casting to Satisfy TypeScript in Mocks
* **Description**: Casting mocked DOM objects to `HTMLCollectionOf<Element>` or `as any` to satisfy the TypeScript compiler.
* **Example Path**: `packages/tracker/tests/unit/index.test.ts`
* **Code Snippet**:
  ```typescript
  global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response)) as any;
  ```
* **When To Use**: When strictly mocking browser globals in Vitest for the tracker package.
* **When Not To Use**: Never use `as any` in application source code.

# 6. Error Handling

### Redacting Errors
* **Description**: Stripping sensitive stack traces and internal messages before returning errors in API responses.
* **Example Path**: `packages/api/src/helpers/redactError.ts` and `packages/proxy/src/helpers/redactError.ts`
* **When To Use**: In global error handlers and before sending responses to external clients.
* **When Not To Use**: Pattern not found in repository for internal error logging.

# 7. Logging

### Deferred LocalStorage Writes
* **Description**: Deferring `localStorage` writes using a scheduled mechanism (`requestIdleCallback` or `setTimeout`) and ensuring data persistence on page exit via a `beforeunload` listener.
* **Example Path**: `packages/tracker/src/index.ts` (`AnalyticsTracker` class)
* **When To Use**: For tracking visitor timestamps and non-critical client-side analytics data without blocking the main thread.
* **When Not To Use**: For critical application state that must be persisted immediately.