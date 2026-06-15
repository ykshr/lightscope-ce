# File: .ai/skill/ANTI_PATTERNS.md

## 1. Hardcoded Secret Fallbacks
* **Why it is wrong:** Hardcoding secrets or fallback values compromises system security if the code is exposed. Missing secrets must cause a secure failure.
* **Bad example:** `const secret = process.env.JWT_SECRET || 'dev_secret';`
* **Good example:** `const secret = process.env.JWT_SECRET; if (!secret) throw new Error('Missing JWT_SECRET');`
* **Evidence:** Memory rule: "To comply with strict security standards, hardcoded secret fallbacks... are prohibited".

## 2. Unparameterized ClickHouse Queries
* **Why it is wrong:** Using template strings for query parameters (including LIMIT/OFFSET) exposes the application to SQL injection.
* **Bad example:** `const query = \`SELECT * FROM events LIMIT ${limit}\`;`
* **Good example:** `const query = \`SELECT * FROM events LIMIT {limit:UInt32}\`;`
* **Evidence:** `packages/api/src/graphql/loaders/rank.ts` uses `LIMIT {limit:UInt32}`.

## 3. Deep Cross-Package Imports
* **Why it is wrong:** Bypasses package boundaries, creating tight coupling and potential build failures in a monorepo setup.
* **Bad example:** `import { helper } from '../../api/src/helpers/util';`
* **Good example:** `import { helper } from '@lightscope-ce/api';` (or duplicate the small utility).
* **Evidence:** `AGENTS.md` states: "Deep cross-package imports (e.g., `../../api/src/...`) are not allowed."

## 4. Heavy Dependencies in Tracker
* **Why it is wrong:** The tracker (`packages/tracker`) is embedded in client sites. Large bundles degrade performance for third-party users.
* **Bad example:** `import _ from 'lodash';` in `packages/tracker/src/index.ts`.
* **Good example:** Using native browser APIs like `document.getElementsByTagName('meta')`.
* **Evidence:** Memory rule: "The `packages/tracker` package is performance-critical... must rely on native browser globals".

## 5. Non-English Documentation
* **Why it is wrong:** Breaks the project's strict language convention, leading to inconsistent and unmaintainable documentation.
* **Bad example:** `// TODO: 修正する`
* **Good example:** `// TODO: Fix this issue`
* **Evidence:** `AGENTS.md` states: "All documentation, including `AGENTS.md` and `README.md` files, must be written entirely in English."

## 6. Incorrect Test Execution Commands
* **Why it is wrong:** The global `vitest` command is not available in the bash environment, leading to test execution failures during automated tasks.
* **Bad example:** `vitest run tests/unit/file.test.ts`
* **Good example:** `pnpm --filter @lightscope-ce/web run test tests/unit/file.test.ts`
* **Evidence:** `AGENTS.md` states: "The global `vitest` command is not available... use the pnpm filter syntax".

## 7. Modifying Generated Files
* **Why it is wrong:** Changes will be overwritten during the next build step, losing all work.
* **Bad example:** Manually editing `packages/api/src/__generated__/prisma/runtime/client.d.ts`.
* **Good example:** Modifying `packages/api/prisma/schema/schema.prisma` and running `pnpm run db:generate`.
* **Evidence:** Memory rule: "Generated code directories... are intentionally excluded from version control... Code generation must be handled as part of the build step".

## 8. Incomplete Object Deep Merge
* **Why it is wrong:** A naive deep merge can be vulnerable to prototype pollution attacks if `__proto__`, `constructor`, or `prototype` keys are not filtered out.
* **Bad example:** `Object.keys(source).forEach(key => { target[key] = source[key]; });`
* **Good example:** Skipping `__proto__`, `constructor`, and `prototype` during iteration.
* **Evidence:** `packages/api/src/graphql/resolvers/helpers/deepMerge.ts` explicitly checks and skips these keys.

## 9. Leaking Sensitive Auth URLs in Logs
* **Why it is wrong:** Logging sensitive URLs (like password resets) exposes tokens to system logs, creating a vulnerability.
* **Bad example:** `console.log('Reset URL:', url);` inside the `sendResetPassword` callback.
* **Good example:** Removing the log or logging only non-sensitive confirmation.
* **Evidence:** Memory rule: "Security standards... prohibit logging the sensitive password reset `url`... to prevent token leakage in system logs."

## 10. Leaving Temporary Scratchpad Files
* **Why it is wrong:** Pollutes the codebase with unversioned, garbage files that may cause confusion or accidental commits.
* **Bad example:** Leaving `test.js` or `script.sh` in the root directory after running a manual verification.
* **Good example:** Always deleting scratchpad files before submitting changes.
* **Evidence:** `AGENTS.md` states: "Always clean up garbage files to avoid codebase pollution."
