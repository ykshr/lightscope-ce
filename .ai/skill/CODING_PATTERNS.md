# File: .ai/skill/CODING_PATTERNS.md

## 1. TypeScript Patterns

### Type-Safe Derived State
* **Description**: Compute derived state synchronously during render using `useMemo` rather than managing it with `useState` combined with `useEffect`. This eliminates unnecessary double re-renders when data props change.
* **Example Path**: `packages/web/src/helpers/category.ts`, `packages/web/src/components/tables/helpers/useProcessData.tsx`
* **Code Snippet**:
  ```tsx
  export const categoryUrlParamsToVariables = (urlParams: FilterToQuery): CategoryVariables => {
    // Synchronous type-safe transformation mapping URL parameters to specific GraphQL variables.
    // ...
  };
  ```
* **When To Use**: When mapping URL parameters or component props to GraphQL query variables, or when transforming data for UI consumption.
* **When Not To Use**: Avoid `useState` + `useEffect` chains for values that can be derived directly from props.

## 2. API Patterns

### Silently Handling Missing Credentials
* **Description**: `AuthProvider` implementations in the proxy package return `null` silently for missing credentials to minimize log noise, reserving `console.error` for actionable validation failures (e.g., origin mismatches).
* **Example Path**: `packages/proxy/src/helpers/auth/jwtAuth.ts`
* **Code Snippet**:
  ```typescript
  export async function verifyJwtToken(token: string) {
    if (!token) return null; // Silent return
    try {
      // verification logic
    } catch (e) {
      console.error('Invalid JWT Payload', e); // Actionable log
      throw e;
    }
  }
  ```
* **When To Use**: Within authentication middleware or provider functions in the ingest APIs (e.g., proxy) where missing tokens are common and expected.
* **When Not To Use**: Do not fail silently when catching unexpected system errors or database connection failures.

### Secure Prototype Traversal in Data Merging
* **Description**: When deeply merging objects, securely prevent prototype pollution by explicitly skipping `__proto__`, `constructor`, and `prototype` keys during iteration.
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
* **When To Use**: When implementing custom `deepMerge` utilities or processing user-supplied JSON objects.
* **When Not To Use**: When working with trusted, internal objects that do not originate from user input.

## 3. Database Patterns

### Parameter Binding for ClickHouse Queries
* **Description**: ClickHouse queries must use parameter binding for `LIMIT`, `OFFSET`, and `LIMIT BY` clauses using the `{name:Type}` syntax to prevent SQL injection.
* **Example Path**: `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
* **Code Snippet**:
  ```typescript
  const query = `SELECT * FROM pv_raw LIMIT {limit:UInt32}`;
  const data = await client.query({
    query,
    query_params: { limit: 10 },
    format: 'JSONEachRow',
  });
  ```
* **When To Use**: Always use parameter binding when executing raw SQL queries via the ClickHouse client.
* **When Not To Use**: Never construct SQL queries using string interpolation or template literals with user input.

### Single-Pass Formatting for ClickHouse Data
* **Description**: The `formatData` utility is optimized for performance by combining snake_case to camelCase key renaming and date string formatting into a single pass over the dataset.
* **Example Path**: `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
* **Code Snippet**:
  ```typescript
  export const formatData = <T>(data: T[], dateKeys: string[] = []): T[] => {
    const dateKeysSet = new Set(dateKeys);
    return data.map((row) => {
      const formattedRow: any = {};
      for (const key of Object.keys(row)) {
        const camelKey = snakeToCamel(key);
        const val = (row as any)[key];
        if (dateKeysSet.has(camelKey) && val && typeof val === 'string') {
          formattedRow[camelKey] = val.replace(' ', 'T') + 'Z';
        } else {
          formattedRow[camelKey] = renameKeySnakeToCamel(val);
        }
      }
      return formattedRow;
    }) as T[];
  };
  ```
* **When To Use**: When formatting JSON results returned from ClickHouse into frontend-compatible objects.
* **When Not To Use**: When data is small and performance is not a concern, though consistency with existing patterns is preferred.

## 4. Frontend Patterns

### XSS Mitigation in UI Components
* **Description**: Mitigate XSS vulnerabilities within `dangerouslySetInnerHTML` by sanitizing CSS identifiers and values to prevent tag breakout and declaration injection.
* **Example Path**: `packages/web/src/components/ui/chart.tsx`
* **Code Snippet**:
  ```tsx
  const sanitizeCSSIdentifier = (id: string) => id.replace(/[^a-zA-Z0-9-_]+/g, '');
  const sanitizeCSSValue = (value: string) => value.replace(/[<>{};]+/g, '');

  // Usage inside dangerouslySetInnerHTML
  ```
* **When To Use**: Whenever injecting dynamic CSS or HTML structures using `dangerouslySetInnerHTML`, particularly in charting or data visualization components.
* **When Not To Use**: Avoid `dangerouslySetInnerHTML` entirely if the UI can be constructed using standard React components.

### Tracker Optimization via Native Browser Globals
* **Description**: The tracker script is performance-critical and bundle-size sensitive. It extracts metadata using single-pass DOM traversals and avoids heavy external libraries.
* **Example Path**: `packages/tracker/src/index.ts`
* **Code Snippet**:
  ```typescript
  // Optimized single-pass over meta tags
  const metas = document.getElementsByTagName('meta');
  const metadata = Object.create(null);
  for (let i = 0; i < metas.length; i++) {
    // extract logic
  }
  ```
* **When To Use**: When developing features inside `packages/tracker`.
* **When Not To Use**: When developing features in the `web` frontend dashboard, where TanStack Query and React should be used.

## 5. Testing Patterns

### Mocking Browser Globals in Tracker Unit Tests
* **Description**: Use `vi.stubGlobal('window', ...)` combined with `vi.unstubAllGlobals()` in setup/teardown hooks to mock browser globals like `addEventListener` safely without relying on a complete DOM environment. Cast the return value of DOM methods to satisfy TS.
* **Example Path**: `packages/tracker/tests/unit/`
* **Code Snippet**:
  ```typescript
  beforeEach(() => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
    });
    vi.stubGlobal('document', {
      getElementsByTagName: vi.fn().mockReturnValue([] as unknown as HTMLCollectionOf<Element>),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
  ```
* **When To Use**: Writing unit tests for the tracker package.
* **When Not To Use**: In integration or E2E tests where a real browser environment is required.

## 6. Error Handling

### Explicit Secure Failures
* **Description**: Missing secrets must trigger a secure failure (e.g., throwing an error) rather than using a hardcoded fallback.
* **Example Path**: `packages/api/src/index.ts` (or environment setup)
* **Code Snippet**:
  ```typescript
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be explicitly defined');
  }
  ```
* **When To Use**: When loading configuration or environment variables at application startup.
* **When Not To Use**: Never fall back to insecure defaults like `|| 'secret'`.

## 7. Logging

### Actionable Logging
* **Description**: Reserve `console.error` for actionable validation or verification failures.
* **Example Path**: `packages/proxy/src/helpers/auth/jwtAuth.ts`
* **Code Snippet**:
  ```typescript
  console.error('Invalid JWT Payload', error);
  ```
* **When To Use**: When logging issues that require developer intervention or debugging.
* **When Not To Use**: Avoid logging benign errors (like missing tokens) that are expected in the normal flow.
