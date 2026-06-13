# File: .ai/skill/ANTI_PATTERNS.md

# Anti-Patterns

## 1. Deep Cross-Package Imports
* **Why it is wrong**: Breaks monorepo boundaries, causes TypeScript compilation errors, and tightly couples independent services.
* **Bad example**: `import { redact } from '../../api/src/helpers/error';`
* **Good example**: Duplicate small utilities or export them officially.
* **Evidence**: Documented explicitly in `AGENTS.md` Restrictions.

## 2. Hardcoded Secret Fallbacks
* **Why it is wrong**: Leads to security vulnerabilities and accidental leakage of credentials into source control or production.
* **Bad example**: `const jwt = process.env.JWT_SECRET || 'dev-secret';`
* **Good example**: `const jwt = process.env.JWT_SECRET; if (!jwt) throw new Error('Missing JWT_SECRET');`
* **Evidence**: Stated in repository security standards and memory rules.

## 3. String Interpolated ClickHouse Queries
* **Why it is wrong**: Exposes the database to SQL injection attacks.
* **Bad example**: `SELECT * FROM table LIMIT ${limit}`
* **Good example**: `SELECT * FROM table LIMIT {limit:UInt32}`
* **Evidence**: ClickHouse queries in `packages/api/src/graphql/loaders/`.

## 4. Using Non-English Documentation
* **Why it is wrong**: Violates the strict English-only repository rule, confusing international maintainers.
* **Bad example**: `// TODO: ここを修正する`
* **Good example**: `// TODO: Fix this implementation`
* **Evidence**: `README.md` and `AGENTS.md` explicitly enforce the English-only rule.

## 5. Heavy Libraries in Tracker
* **Why it is wrong**: Inflates the client-side bundle size, degrading performance on customer websites.
* **Bad example**: `import React from 'react';` inside `packages/tracker/src/index.ts`.
* **Good example**: Using native DOM APIs like `document.getElementsByTagName('meta')`.
* **Evidence**: `packages/tracker` bundle size restrictions mentioned in memory.

## 6. Testing in `src/` Directory
* **Why it is wrong**: Mixes test code with production code, polluting builds and structure.
* **Bad example**: `packages/api/src/helpers/error.test.ts`
* **Good example**: `packages/api/tests/unit/helpers/error.test.ts`
* **Evidence**: `AGENTS.md` project structure rules.

## 7. Using `bun:test`
* **Why it is wrong**: Fails GitHub CI checks which expect Vitest via `tsc -b`.
* **Bad example**: `import { test } from 'bun:test';`
* **Good example**: `import { test } from 'vitest';`
* **Evidence**: Memory rules specifying GitHub CI restrictions.

## 8. Modifying Generated Files
* **Why it is wrong**: Changes will be overwritten during the next build cycle.
* **Bad example**: Editing files inside `packages/api/src/__generated__/`.
* **Good example**: Editing the source GraphQL schemas or Prisma schemas and regenerating.
* **Evidence**: Guardrails in `AGENTS.md`.

## 9. Prototype Pollution in Merging
* **Why it is wrong**: Malicious payloads can override Object prototypes.
* **Bad example**: `target[key] = source[key];` without checking keys.
* **Good example**: `if (key === '__proto__' || key === 'constructor') return; target[key] = source[key];`
* **Evidence**: `packages/api/src/graphql/resolvers/helpers/deepMerge.ts`.

## 10. Deep Relative Imports in Tests
* **Why it is wrong**: Makes tests hard to read and brittle when files move.
* **Bad example**: `import { util } from '../../../../src/helpers/util';`
* **Good example**: `import { util } from '@/helpers/util';`
* **Evidence**: `AGENTS.md` testing rules enforce `@/` path aliases.
