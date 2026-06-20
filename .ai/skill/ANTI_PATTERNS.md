# ANTI_PATTERNS.md

## Existing Technical Debt

When working in the repository, AI agents must prioritize consistency with existing code over idealized architecture. Do NOT recommend or attempt to clean up these anti-patterns unless specifically requested by the user, as the project relies on them for stability until a broader refactor is planned.

### 1. Widespread Use of `as any` in Tests

There is widespread use of `as any` within Vitest test suites (especially in `packages/tracker/` and `packages/proxy/`) to quickly mock complex interfaces like `window` or Hono context.

**Evidence:**
- Over 50 occurrences across `packages/*/tests/`.
- Examples include: `c.set('$', { prisma: ... } as any)` and `global.window = { ... } as any`.

**Instruction for Agents:** Prioritize consistency. Do not attempt to strictly type these mocks or refactor them unless explicitly requested.

### 2. Pending Features in Authentication Code

There are deprecated or pending TODOs regarding email handling inside the API package.

**Evidence:**
- `packages/api/src/createContext.ts`: `// TODO: Send password reset email to the user with the provided URL`
- `packages/api/src/createContext.ts`: `// TODO: Send verification email to the user with the provided URL`

**Instruction for Agents:** Acknowledge these placeholders exist but do not attempt to implement them during unrelated tasks.
