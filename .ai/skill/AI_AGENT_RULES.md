# AI_AGENT_RULES.md

## Golden Rules

These rules represent core architectural constraints that must never be broken. They are based on directives in `AGENTS.md`.

### 1. No Hardcoded Secret Fallbacks

**Rationale:** To comply with strict security standards, hardcoded secret fallbacks are prohibited across application code, test files, and docker-compose configurations. Missing secrets must trigger a secure failure (e.g., throwing an error) rather than silently falling back to a default value.
**Evidence:** Found in `AGENTS.md` under "Security Standards".
**Violation Example:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // FORBIDDEN
```
**Correct Example:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined.");
}
```

### 2. ClickHouse Parameter Binding

**Rationale:** Direct string interpolation of user inputs or dynamic values into ClickHouse SQL queries creates SQL injection vulnerabilities and malformed queries. All queries must use parameter binding.
**Evidence:** `packages/api/src/graphql/loaders/helpers/clickhouse.ts` passes `query_params` directly to the ClickHouse client.
**Violation Example:**
```typescript
const query = `SELECT * FROM events WHERE session_id = '${sessionId}'`; // FORBIDDEN
const rows = await client.query({ query, format: 'JSONEachRow' });
```
**Correct Example:**
```typescript
const query = `SELECT * FROM events WHERE session_id = {sessionId:String}`;
const rows = await client.query({
  query,
  query_params: { sessionId },
  format: 'JSONEachRow'
});
```

### 3. Strict Monorepo Boundaries

**Rationale:** The pnpm monorepo relies on workspace imports for encapsulation. Deep cross-package imports cause module bleed and tight coupling between workspace boundaries.
**Evidence:** Dependencies are explicitly defined in `package.json` files using `"workspace:*"`. `packages/tracker` is isolated and cannot use deep imports from backend directories like `../../api/src/helpers/`.
**Violation Example:**
```typescript
// Inside packages/tracker/src/index.ts
import { validateId } from '../../api/src/helpers/validation.ts'; // FORBIDDEN
```
**Correct Example:**
```typescript
// Inside packages/tracker/src/index.ts
import { validateId } from './utils/validation.ts'; // Duplicate the small utility locally
```
