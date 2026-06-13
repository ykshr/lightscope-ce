# File: .ai/skill/CODING_PATTERNS.md

# Coding Patterns

## 1. TypeScript Patterns

* **Description**: Utilizing strict types, avoiding `any` in source code, and using explicit path aliases (`@/`).
* **Example Path**: `packages/web/src/helpers/constants/category.ts`
* **Code Snippet**:
  ```typescript
  export const categoryOptions = [ { label: 'Total', value: {} } ];
  ```
* **When To Use**: Throughout the entire codebase to maintain type safety.
* **When Not To Use**: Do not use `as any` in source files. In test files, `as any` is occasionally required for mocking globals (e.g., `vi.stubGlobal('window', ... as any)`), but avoid it when types can be accurately inferred or created.

## 2. API Patterns

* **Description**: GraphQL resolvers and data loaders in the API package. Loaders use custom key generators for performance.
* **Example Path**: `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
* **Code Snippet**:
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
* **When To Use**: When fetching data from ClickHouse in GraphQL resolvers.
* **When Not To Use**: Do not use string concatenation for dynamic variables in queries; always use `query_params`.

## 3. Database Patterns

* **Description**: Prisma for local/relational state (SQLite/Postgres) and ClickHouse for high-throughput analytics.
* **Example Path**: `packages/clickhouse/`
* **Code Snippet**:
  ```sql
  -- ClickHouse queries utilize {param:Type} syntax
  SELECT * FROM default.events WHERE timestamp >= {startDate:DateTime} LIMIT {limit:UInt32}
  ```
* **When To Use**: Use ClickHouse for event analytics queries. Use Prisma for user/organization management.
* **When Not To Use**: Do not use Prisma for high-volume analytics event ingestion.

## 4. Frontend Patterns

* **Description**: Lazy loading components for performance, and using custom hooks for GraphQL queries.
* **Example Path**: `packages/web/vite.config.ts` (manualChunks) and `packages/web/src/components/ui/chart.tsx`
* **Code Snippet**:
  ```tsx
  // XSS Mitigation in dangerouslySetInnerHTML
  const sanitizedId = sanitizeCSSIdentifier(id);
  ```
* **When To Use**: Use `React.lazy()` for page-level components. Ensure proper sanitization when dealing with raw HTML or CSS identifiers.
* **When Not To Use**: Avoid loading massive third-party libraries synchronously in the main bundle.

## 5. Testing Patterns

* **Description**: Using Vitest for unit/integration tests with `@/` alias for imports. Mocking globals carefully.
* **Example Path**: `packages/tracker/tests/unit/index.test.ts`
* **Code Snippet**:
  ```typescript
  beforeEach(() => {
    vi.stubGlobal('window', { ... });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  ```
* **When To Use**: When unit testing browser-specific logic in Node environments (Vitest).
* **When Not To Use**: Do not use `bun:test` due to CI restrictions.

## 6. Error Handling

* **Description**: Redacting sensitive error properties before logging or returning to clients.
* **Example Path**: `packages/api/src/helpers/error.ts`
* **Code Snippet**:
  ```typescript
  export const redactError = (error: unknown) => {
    if (error instanceof Error) {
      return { name: error.name, message: error.message, stack: error.stack };
    }
    return error;
  };
  ```
* **When To Use**: When logging caught errors in catch blocks, particularly for external API responses.
* **When Not To Use**: Do not log sensitive user payloads or authentication URLs (e.g., password reset URLs).

## 7. Logging

* **Description**: Silent failures for auth validation to minimize log noise, while actionable errors are logged explicitly.
* **Example Path**: `packages/proxy/src/middlewares/auth.ts` (Hypothetical/Conventions)
* **Code Snippet**:
  ```typescript
  // Return null silently for missing credentials
  if (!token) return null;
  // Log actionable errors
  console.error('Invalid JWT payload:', error);
  ```
* **When To Use**: In `packages/proxy` AuthProvider implementations.
* **When Not To Use**: Do not flood logs with missing token warnings on public endpoints.
