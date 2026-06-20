# TASK_RECIPES.md

## Running Repository Checks

### Full CI Suite
The primary quality gate for the monorepo is the `ci` script.
**Recipe:**
```bash
# In the root directory
pnpm run ci
```
*Note: If tests require JWT secrets, ensure `export JWT_SECRET=test` is set in the environment prior to running.*

### Running Package-Specific Tests
Because the global `vitest` command is unavailable, always use the pnpm filter syntax.
**Recipe:**
```bash
pnpm --filter <package-name> run test <path-to-test>
# Example
pnpm --filter @lightscope-ce/web run test tests/unit/components/MyComponent.test.tsx
```

### Formatting Code
Formatting issues trigger CI pipeline failures.
**Recipe:**
```bash
# To fix a specific file:
pnpm exec prettier --write <filepath>
# To check the whole repo:
pnpm run format
```

## E2E Testing with Playwright

To run end-to-end tests covering full user journeys across the web, api, and proxy.
**Recipe:**
1. Ensure all system dependencies for Playwright are installed:
   ```bash
   pnpm --filter @lightscope-ce/e2e exec playwright install --with-deps
   ```
2. Run the tests:
   ```bash
   pnpm run test:e2e
   ```

## GraphQL Schema Generation

If `pnpm --filter @lightscope-ce/web run codegen` fails due to a missing schema from `packages/api`, the backend schema must be generated first.
**Recipe:**
```bash
pnpm --filter @lightscope-ce/api run codegen
pnpm --filter @lightscope-ce/web run codegen
```
