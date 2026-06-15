# File: .ai/skill/CODING_PATTERNS.md

## 1. TypeScript Patterns

### Strict Typing and `as any` Avoidance
* **Description:** Maintain strict TypeScript. Avoid `any` or unsafe casting (`as any`) in new code. Define explicit types for variables and returns. Use type guards when necessary.
* **Example Path:** `packages/api/src/graphql/resolvers/helpers/deepMerge.ts`
* **Code Snippet:**
  ```typescript
  // Type guard instead of arbitrary casting
  const isObject = (item: any): item is Record<string, any> => {
    return !!(item && typeof item === 'object' && !Array.isArray(item));
  };
  ```
* **When To Use:** Always, especially when dealing with unknown data structures like API responses or deep object merging.
* **When Not To Use:** Only in existing test files or specific legacy code where it's already established (technical debt), and refactoring is out of scope.

## 2. API Patterns

### Optimized GraphQL DataLoaders
* **Description:** DataLoader keys should be optimized for performance. Use template literals instead of `JSON.stringify` for key generation.
* **Example Path:** Memory rule for `packages/api/src/loaders/articleAnalytics.ts`
* **Code Snippet:**
  ```typescript
  // Optimized key generation
  const createLoaderKey = (id: string, type: string) => `${id}:${type}`;
  ```
* **When To Use:** In GraphQL DataLoaders to cache and batch requests efficiently.
* **When Not To Use:** When keys involve complex, deeply nested objects where string building is impractical.

## 3. Database Patterns

### ClickHouse Parameter Binding
* **Description:** All ClickHouse queries must use strict parameter binding for safety, including clauses like `LIMIT` and `OFFSET`.
* **Example Path:** `packages/api/src/graphql/loaders/rank.ts`
* **Code Snippet:**
  ```typescript
  const limitAndOffset = `LIMIT {limit:UInt32} OFFSET {offset:UInt32}`;
  const query = `SELECT * FROM table ${limitAndOffset}`;
  const data = await client.query({ query, query_params: { limit: 10, offset: 0 } });
  ```
* **When To Use:** Every time a ClickHouse query includes dynamic values.
* **When Not To Use:** Never. Always parameterize queries.

## 4. Frontend Patterns

### React Lazy Loading and Suspense
* **Description:** Page components must be lazy-loaded to optimize bundle size.
* **Example Path:** `packages/web/src/App.tsx`
* **Code Snippet:**
  ```tsx
  import { lazy, Suspense } from 'react';
  const Overview = lazy(() => import('@/pages/overview'));

  // Usage within router:
  // <Suspense fallback={<Loader />}><Overview /></Suspense>
  ```
* **When To Use:** For route-level components or large, infrequently used components.
* **When Not To Use:** For critical, above-the-fold UI components that need to render immediately.

### XSS Mitigation in dangerouslySetInnerHTML
* **Description:** When rendering raw HTML or styles, strictly sanitize identifiers and values to prevent injection.
* **Example Path:** `packages/web/src/components/ui/chart.tsx` (Conceptual based on memory)
* **Code Snippet:**
  ```tsx
  // Concept snippet based on memory rule
  const sanitizeCSSIdentifier = (id: string) => id.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizeCSSValue = (val: string) => val.replace(/[<>{};]/g, '');
  ```
* **When To Use:** Whenever you absolutely must use `dangerouslySetInnerHTML`, particularly for dynamic CSS injection.
* **When Not To Use:** When standard React props (like `style={{ color: dynamicColor }}`) or class names can be used instead.

## 5. Testing Patterns

### Mocking Browser Globals in Vitest
* **Description:** When testing tracker logic, mock global DOM objects using `vi.stubGlobal` in `beforeEach` and restore them using `vi.unstubAllGlobals` in `afterEach`.
* **Example Path:** `packages/tracker/tests/unit/index.test.ts`
* **Code Snippet:**
  ```typescript
  beforeEach(() => {
    vi.stubGlobal('window', { addEventListener: vi.fn() });
    vi.stubGlobal('document', { getElementsByTagName: vi.fn() as any });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  ```
* **When To Use:** In unit tests for `packages/tracker` or other browser-specific code running in a Node.js test environment.
* **When Not To Use:** In tests that run in a real browser environment (like Playwright E2E tests).

## 6. Error Handling

### Redacting Sensitive Error Info
* **Description:** Strip stack traces and sensitive data from errors before logging or returning them across boundaries. Extract only `name`, `message`, and `stack` initially.
* **Example Path:** `packages/api/src/helpers/error.ts` (Referenced in memory)
* **Code Snippet:**
  ```typescript
  export const redactError = (error: any) => {
    if (error instanceof Error) {
      return { name: error.name, message: error.message, stack: error.stack };
    }
    return error;
  };
  ```
* **When To Use:** At API boundaries or before logging errors to external services.
* **When Not To Use:** During internal debugging where the full error context is needed locally.

## 7. Logging

### Silent Failures in Proxy
* **Description:** The Proxy package should fail silently for missing credentials to reduce log noise, reserving `console.error` for actionable failures.
* **Example Path:** `packages/proxy` (Referenced in memory)
* **Code Snippet:**
  ```typescript
  // AuthProvider implementation
  if (!credentials) {
    return null; // Silent return
  }
  if (!isValid(credentials)) {
    console.error('Invalid credentials payload');
    throw new Error('Unauthorized');
  }
  ```
* **When To Use:** In high-throughput ingestion endpoints where common, non-actionable failures (like bot requests without tokens) would flood logs.
* **When Not To Use:** In critical business logic where every failure needs to be audited.
