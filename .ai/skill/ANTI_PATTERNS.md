# File: .ai/skill/ANTI_PATTERNS.md

## 1. Hardcoding Secrets Fallback
* **Why it is wrong:** Hardcoded secret fallbacks (e.g., `|| 'secret'`) in application code, test files, or `docker-compose.yml` violate strict security standards. Missing secrets must trigger a secure failure (e.g., throwing an error).
* **Bad example:**
  ```typescript
  const token = process.env.JWT_SECRET || 'secret';
  ```
* **Good example:**
  ```typescript
  if (!process.env.JWT_SECRET) throw new Error('Missing secret');
  const token = process.env.JWT_SECRET;
  ```
* **Evidence:** `packages/api/src/createContext.ts` (Explicit throw on missing `JWT_SECRET`).

## 2. Missing Parameter Binding in ClickHouse
* **Why it is wrong:** Directly interpolating dynamic parameters into ClickHouse SQL strings causes SQL injection vulnerabilities. ClickHouse queries must use parameter binding.
* **Bad example:**
  ```typescript
  const query = `SELECT * FROM events LIMIT ${limit}`;
  ```
* **Good example:**
  ```typescript
  const query = 'SELECT * FROM events LIMIT {limit:UInt32}';
  const queryParamsObj = { limit };
  ```
* **Evidence:** `packages/api/src/graphql/loaders/helpers/clickhouse.ts` (`query_params` argument in loader helper).

## 3. Using useState + useEffect for Derived State
* **Why it is wrong:** Managing derived state via `useState` and syncing it via `useEffect` causes unnecessary double re-renders. It must be computed synchronously during render using `useMemo`.
* **Bad example:**
  ```typescript
  const [derived, setDerived] = useState(null);
  useEffect(() => { setDerived(process(data)); }, [data]);
  ```
* **Good example:**
  ```typescript
  const derived = useMemo(() => process(data), [data]);
  ```
* **Evidence:** `packages/web/src/components/linecharts/helpers/useProcessData.tsx`

## 4. Deep Relative Imports in Test Files
* **Why it is wrong:** Importing source files from test files using deep relative paths (`../../../../src/`) is brittle. The `@/` path alias must be used to resolve to the `src/` directory.
* **Bad example:**
  ```typescript
  import { util } from '../../../../src/helpers/util';
  ```
* **Good example:**
  ```typescript
  import { util } from '@/helpers/util';
  ```
* **Evidence:** Instructions inside `AGENTS.md` (Guidance on where to place different types of code).

## 5. Logging Sensitive Auth Tokens
* **Why it is wrong:** Logging the sensitive password reset `url` within the `sendResetPassword` callback leads to token leakage in system logs.
* **Bad example:**
  ```typescript
  sendResetPassword: (url) => { console.log('Reset link:', url); }
  ```
* **Good example:**
  ```typescript
  sendResetPassword: (url) => { /* Email or transmit URL securely without logging */ }
  ```
* **Evidence:** Security standards for `better-auth` configuration in `packages/api/src/createContext.ts`.

## 6. Failing to Cast DOM Mocks in Tracker Tests
* **Why it is wrong:** Mocking DOM globals like `document.getElementsByTagName` in Vitest for the `tracker` package requires the return value to be cast to satisfy TypeScript compiler during builds.
* **Bad example:**
  ```typescript
  vi.stubGlobal('document', { getElementsByTagName: () => [] });
  ```
* **Good example:**
  ```typescript
  vi.stubGlobal('document', { getElementsByTagName: () => [] as any });
  ```
* **Evidence:** `packages/tracker/tests/unit/features/errorTracking.test.ts` (Usage of `vi.stubGlobal` with `window`).

## 7. Running Global Vitest Command
* **Why it is wrong:** The global `vitest` command is not available in the project's bash environment. Executing it directly causes `command not found` or incorrect environment setup.
* **Bad example:**
  ```bash
  vitest run tests/unit/...
  ```
* **Good example:**
  ```bash
  pnpm --filter @lightscope-ce/web run test tests/unit/...
  ```
* **Evidence:** Command instructions detailed in `AGENTS.md`.

## 8. Missing Passive Flag in Scroll Listeners
* **Why it is wrong:** Adding scroll event listeners without the `{ passive: true }` flag causes main-thread blocking and layout thrashing.
* **Bad example:**
  ```javascript
  window.addEventListener('scroll', handleScroll);
  ```
* **Good example:**
  ```javascript
  window.addEventListener('scroll', handleScroll, { passive: true });
  ```
* **Evidence:** Performance rules designated for `packages/tracker`.

## 9. Leaving Scratchpad Scripts
* **Why it is wrong:** Leaving `.sh`, `.py`, or `.js` garbage scripts used for temporary testing pollutes the codebase and repository history.
* **Bad example:** Committing a `test.sh` file that queries the database.
* **Good example:** Deleting `test.sh` before running `pnpm run ci` or submitting changes.
* **Evidence:** Rule explicitly defined in `AGENTS.md` under Restrictions.

## 10. Ignoring Pre-Commit CI Checks
* **Why it is wrong:** Failing to run formatting, linting, or typescript verification leads to broken builds on remote.
* **Bad example:** Committing immediately after editing a file without testing.
* **Good example:** Running `pnpm run ci` from the workspace root prior to submitting changes.
* **Evidence:** Required quality gate outlined in `AGENTS.md`.