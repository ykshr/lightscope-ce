# CODING_PATTERNS.md

## Database Patterns

### ClickHouse Parameter Binding
**Explanation:** When querying ClickHouse, always use parameter binding instead of direct string interpolation. This prevents SQL injection vulnerabilities and malformed query structures.
**Example File:** `packages/api/src/graphql/loaders/helpers/clickhouse.ts`
**Code Snippet:**
```typescript
const rows = await client.query({
  query,
  query_params,
  format: 'JSONEachRow',
});
```
**When to use:** Whenever executing raw SQL against ClickHouse.
**When not to use:** Never. Parameterization should always be favored over string interpolation for untrusted inputs.

## Frontend Patterns

### React Derived State
**Explanation:** React components in `packages/web` must compute derived state synchronously during render using `useMemo` rather than managing it with `useState` combined with `useEffect`. This eliminates unnecessary double re-renders when data props change.
**Example File:** `packages/web/src/components/linecharts/helpers/useProcessData.tsx`
**Code Snippet:**
```typescript
export default function useProcessData(data: ArticleTrendQuery | undefined) {
  // Instead of useState/useEffect, compute derived state directly using useMemo
  return useMemo(() => {
    // Process data logic here...
    return processedResult;
  }, [data]);
}
```
**When to use:** When calculating or transforming props into state needed for rendering (like processing charting datasets).
**When not to use:** When state is driven by asynchronous operations like user input or API calls that don't depend purely on component props.

### XSS Mitigation
**Explanation:** When using `dangerouslySetInnerHTML` in `packages/web`, XSS mitigation must be applied by sanitizing inputs. Ensure `sanitizeCSSValue` does not strip parentheses `()` to avoid breaking standard CSS functions like `rgba()`.
*Note: While memory constraints specify this behavior, actual implementations of `sanitizeCSSIdentifier` and `sanitizeCSSValue` were not found during repository analysis.*
**Pattern not found in repository.**

## API Patterns

### GraphQL Resolvers and Dataloaders
**Explanation:** In `packages/api`, complex entity relationships and data fetching logic must be isolated within GraphQL resolvers that utilize Dataloaders to batch and optimize queries against ClickHouse, mitigating N+1 query problems.
**Example File:** `packages/api/src/graphql/resolvers/article.ts`
**Code Snippet:**
```typescript
export const getArticle = async (parent, args, cxt) => {
  const url = args.url ?? parent.url;
  const loader = getArticleLoader(cxt); // Using dataloader
  const article = await loader.load(url);
  return article;
};
```
**When to use:** For all data-fetching operations mapped to GraphQL schema types.
**When not to use:** Fast-path telemetry event ingestion that requires high-throughput (see REST Event Ingestion).

### REST Event Ingestion
**Explanation:** Fast-path telemetry events from `packages/tracker` are handled by Hono REST endpoints in `packages/proxy` rather than GraphQL to minimize latency and payload overhead.
**Example File:** `packages/proxy/src/routers/events/index.ts`
**Code Snippet:**
```typescript
eventsRouter.post('/', async (c: Context) => {
  const body = await c.req.json();
  const parseResult = PayloadSchema.safeParse(body);
  // ... process fast-path event
});
```
**When to use:** When designing ingestion endpoints for high-throughput client telemetry (e.g. `packages/tracker`).
**When not to use:** When fetching structured, relational backend data for the frontend dashboard.

## Testing Patterns

### Mocking Browser Globals in Vitest
**Explanation:** In `packages/tracker` unit tests, use `vi.stubGlobal('window', ...)` combined with `vi.unstubAllGlobals()` in setup/teardown hooks to mock browser globals safely without relying on a complete jsdom environment.
**Example File:** `packages/tracker/tests/unit/index.test.ts`
**Code Snippet:**
```typescript
vi.stubGlobal('window', {
  addEventListener: vi.fn(),
});
```
**When to use:** When testing browser-specific code (like DOM manipulation in trackers) in a Node.js-based test runner (Vitest).
**When not to use:** When doing fully integrated End-to-End tests in Playwright which spins up a real browser context.
