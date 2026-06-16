# File: .ai/skill/TASK_RECIPES.md

## Create new skill
* **Preconditions:** You need to document a new architectural pattern or AI agent rule.
* **Steps:**
  1. Identify the relevant file in `.ai/skill/` (e.g., `CODING_PATTERNS.md` or `ANTI_PATTERNS.md`).
  2. Write the new rule strictly in English.
  3. Provide an evidence-based repository example.
  4. Ensure the overarching generator `PROMPT.md` is updated if necessary.
* **Validation:** Read the modified file to ensure formatting is correct and the rule is clear.
* **Common Mistakes:** Inventing rules without repository evidence; using non-English text.

## Add API endpoint
* **Preconditions:** Clear understanding of whether it belongs in `packages/api` (GraphQL) or `packages/proxy` (REST).
* **Steps:**
  1. Add the route/resolver in the appropriate package.
  2. If querying ClickHouse, use strict parameter binding `{name:Type}`.
  3. Ensure types are exported and codegen is run if modifying GraphQL schema.
* **Validation:** Run unit tests for the specific package (`pnpm --filter <package> test`).
* **Common Mistakes:** Leaking secrets in logs; failing to use parameter binding for ClickHouse queries.

## Add shared package
* **Preconditions:** Code needs to be shared across boundaries.
* **Steps:**
  1. Pattern not found in repository. Do not create new shared packages; the monorepo relies on explicit boundaries. Duplicate small utilities (like `redactError`) instead of deep cross-package imports.
* **Validation:** Verify `pnpm-workspace.yaml` still reflects the correct structure.
* **Common Mistakes:** Creating complex shared libraries that introduce coupling.

## Add UI component
* **Preconditions:** Need a new reusable UI element.
* **Steps:**
  1. Create the component in `packages/web/src/components/`.
  2. Use Tailwind CSS v4 for styling.
  3. Use Radix UI primitives if applicable.
* **Validation:** Run `pnpm --filter @lightscope-ce/web run lint` and `pnpm run format`.
* **Common Mistakes:** Adding heavy dependencies instead of using existing shadcn/Radix primitives.

## Add database query
* **Preconditions:** Need to fetch new analytical data.
* **Steps:**
  1. Locate the appropriate loader in `packages/api/src/graphql/loaders/`.
  2. Write the ClickHouse query using `{param:Type}` binding for ALL dynamic inputs.
  3. Pass `query_params` object to the client helper.
* **Validation:** Run the query locally against the ClickHouse Docker container.
* **Common Mistakes:** Using string interpolation (`${value}`) for `LIMIT` or `OFFSET`.

## Add test
* **Preconditions:** New feature implemented or bug fixed.
* **Steps:**
  1. Create the test file in `tests/unit/` or `tests/integration/` of the relevant package.
  2. Use Vitest. Mock globals securely (e.g., `vi.stubGlobal` for browser globals in the tracker).
  3. If testing Prisma, ensure the integration test resets the test DB (`test.db`).
* **Validation:** Run `pnpm --filter <package> run test <path-to-test>`.
* **Common Mistakes:** Using `bun:test` instead of Vitest; forgetting `vi.unstubAllGlobals()`.

## Add environment variable
* **Preconditions:** New configuration required.
* **Steps:**
  1. Add the variable to `.env.example`.
  2. If used in tests, explicitly define it in GitHub Actions workflow files (`.github/workflows/*.yml`) to avoid secret fallbacks.
* **Validation:** Check that the application throws a secure error if the variable is missing at runtime.
* **Common Mistakes:** Using `process.env.VAR || 'fallback_secret'`.

## Add background job
* **Preconditions:** Need asynchronous processing.
* **Steps:**
  1. Pattern not found in repository.
* **Validation:** N/A.
* **Common Mistakes:** Introducing external job queues (like Redis/Bull) without architectural approval.

## Add migration
* **Preconditions:** Schema changes required.
* **Steps:**
  1. For SQLite/Prisma: Update `packages/api/prisma/schema/schema.prisma` and run `pnpm --filter @lightscope-ce/api run db:migrate`.
  2. For ClickHouse: Add SQL file to `packages/clickhouse/src/sql/`.
* **Validation:** Ensure Prisma generates the client correctly; verify ClickHouse starts up with the new schema in Docker.
* **Common Mistakes:** Modifying auto-generated Prisma files directly.

## Upgrade shadcn UI components
* **Preconditions:** Need to upgrade installed shadcn ui components in the `packages/web` package.
* **Steps:**
  1. Navigate to the `packages/web` directory.
  2. Check for available component updates and their feasibility by inspecting the diffs using `pnpm dlx shadcn diff`.
  3. If the update is possible and safe, perform the update (e.g., `pnpm dlx shadcn add [component-name] -o` to overwrite with the new version).
  4. Verify that the functionality and layout are maintained correctly before and after the version update. Use local dev preview if needed to verify UI consistency.
* **Validation:** Run `pnpm --filter @lightscope-ce/web run lint` and run test commands to ensure no regressions.
* **Common Mistakes:** Blindly updating components without reviewing the diffs, which can overwrite custom changes.
