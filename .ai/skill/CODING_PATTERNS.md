# File: .ai/skill/CODING_PATTERNS.md

## 1. TypeScript Patterns

### Explicit Return Types for Transformations
* **Description:** Utility functions returning specific variables (e.g., transforming a `FilterToQuery` object) explicitly type their returns to maintain type safety and avoid `as any` assertions in React components.
* **Example Path:** `packages/web/src/helpers/category.ts`
* **Code Snippet:**
  ```typescript
  // Example of explicitly typed return object
  export const transformCategory = (filter: FilterToQuery): CategoryVariables => {
    // transformation logic
    return { ... };
  };
  ```
* **When To Use:** When writing data transformers to be consumed by generic UI components.
* **When Not To Use:** Internal, simple utility functions where inference is completely obvious and safe.

## 2. API Patterns

### GraphQL Resolvers and Data Loaders
* **Description:** The `packages/api` package exposes GraphQL APIs using a split between resolvers (entry points) and loaders (database execution logic).
* **Example Path:** `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
* **Code Snippet:**
  ```typescript
  export default async function <T>(
    client: ClickHouseClient,
    query: string,
    query_params: any = undefined
  ): Promise<T[]> {
    const rows = await client.query({ query, query_params, format: 'JSONEachRow' });
    return await rows.json<T>();
  }
  ```
* **When To Use:** Building or modifying GraphQL endpoints.
* **When Not To Use:** Building generic REST ingestion APIs (use `packages/proxy` instead).

### REST Event Ingestion Endpoints
* **Description:** Event ingestion uses Hono REST APIs in the `proxy` package. Errors are intentionally muted in AuthProvider layers, returning `null` instead.
* **Example Path:** `packages/proxy/src/...`
* **Code Snippet:**
  ```typescript
  // Typical proxy auth logic gracefully failing without throwing
  if (!credentials) {
    return null; // Prevents log noise
  }
  ```
* **When To Use:** Building data ingestion endpoints where performance and low log-noise are required.
* **When Not To Use:** Building client-facing data retrieval APIs.

## 3. Database Patterns

### ClickHouse SQL Parameter Binding
* **Description:** ClickHouse queries must use parameter binding for `LIMIT`, `OFFSET`, etc., using `{name:Type}` syntax.
* **Example Path:** `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
* **Code Snippet:**
  ```typescript
  const query = 'SELECT * FROM table LIMIT {limit:UInt32}';
  const queryParamsObj = { limit: 10 };
  ```
* **When To Use:** Any time you write a ClickHouse query with dynamic variables.
* **When Not To Use:** Hardcoding values inside query template strings.

## 4. Frontend Patterns

### XSS Mitigation in dangerouslySetInnerHTML
* **Description:** When rendering user-provided or configurable styles, keys and identifiers are sanitized using custom regex/strip methods before being injected into `<style>` tags.
* **Example Path:** `packages/web/src/components/ui/chart.tsx`
* **Code Snippet:**
  ```tsx
  <style
    dangerouslySetInnerHTML={{
      __html: `... [data-chart=${id}] { --color-${key}: ${color}; }`
    }}
  />
  ```
* **When To Use:** Injecting dynamic CSS or config into the DOM.
* **When Not To Use:** Trusting un-sanitized config strings or user input directly.

### Synchronous Derived State
* **Description:** React components in `packages/web` compute derived state synchronously during render using `useMemo` to eliminate double re-renders.
* **Example Path:** Generic frontend hooks (e.g., `useProcessData`).
* **Code Snippet:**
  ```typescript
  const processedData = useMemo(() => process(data), [data]);
  ```
* **When To Use:** Transforming API response data for UI representation.
* **When Not To Use:** Storing derived state in `useState` and syncing via `useEffect`.

## 5. Testing Patterns

### Mocking Browser Globals
* **Description:** Vitest tests for the `tracker` package mock browser globals using `vi.stubGlobal`. Return types are forcefully cast `as any` or strictly typed where necessary for TS.
* **Example Path:** `packages/tracker/tests/unit/...`
* **Code Snippet:**
  ```typescript
  vi.stubGlobal('window', { addEventListener: vi.fn() });
  // later in teardown
  vi.unstubAllGlobals();
  ```
* **When To Use:** Writing unit tests for the browser tracking script in a Node environment.
* **When Not To Use:** Integration testing, where real environments like Playwright are more appropriate.

### Safe Deep Merge Utility
* **Description:** The deep merge helper avoids prototype pollution by skipping `__proto__`, `constructor`, and `prototype`.
* **Example Path:** `packages/api/tests/unit/graphql/resolvers/helpers/deepMerge.test.ts`
* **Code Snippet:**
  ```typescript
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return;
  }
  ```
* **When To Use:** Writing generic data combination functions.
* **When Not To Use:** Merging unchecked external payloads without sanitization.

## 6. Error Handling

### Explicit Throwing for Secure Failures
* **Description:** Missing secrets or fundamental configuration issues do not fallback to generic strings, but securely throw explicit Error instances.
* **Example Path:** `packages/api/src/createContext.ts`
* **Code Snippet:**
  ```typescript
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment.');
  }
  ```
* **When To Use:** Validating critical environment variables at startup.
* **When Not To Use:** Non-critical user input validations where graceful UX errors are required.

## 7. Logging

### Silencing Auth Provider Errors
* **Description:** In the proxy package, auth providers silently return `null` instead of throwing or logging when missing credentials, to prevent excessive log noise for invalid tracker requests.
* **Example Path:** `packages/proxy/src/helpers/auth/jwtAuth.ts`
* **Code Snippet:**
  ```typescript
  if (!header) return null;
  ```
* **When To Use:** Handling expected unauthenticated noise on high-throughput proxy endpoints.
* **When Not To Use:** Critical unhandled application failures that require debug logs.