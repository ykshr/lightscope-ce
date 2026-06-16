# File: .ai/skill/TASK_RECIPES.md

## Create New Skill
* **Preconditions:** You are instructed to create an AI Agent skill or rule.
* **Steps:**
  1. Identify the relevant `.ai/skill/*.md` file (`ARCHITECTURE.md`, `CODING_PATTERNS.md`, `TASK_RECIPES.md`, `AI_AGENT_RULES.md`, `ANTI_PATTERNS.md`).
  2. Write the rule strictly in English.
  3. Include evidence-based examples from the repository to back up the rule.
* **Validation:** Run `list_files` or `read_file` to confirm the target file exists and contains the updated changes.
* **Common Mistakes:** Describing generic best practices instead of verifying repository-specific patterns.

## Add API Endpoint
* **Preconditions:** Understanding whether the endpoint serves client data (use GraphQL in `packages/api`) or ingests external tracker events (use REST in `packages/proxy`).
* **Steps:**
  1. Add the loader logic in `packages/api/src/graphql/loaders/` or `proxy` equivalent.
  2. Map the data structure and handle authentication boundaries (Better Auth).
  3. Write a corresponding unit test in `packages/api/tests/unit/...` or `integration/...`.
* **Validation:** Run `pnpm --filter <package> run test` and manually invoke endpoint using a REST or GraphQL client.
* **Common Mistakes:** Not using parameter binding in SQL queries; exposing hardcoded secrets; failing to mock dependencies properly in unit tests.

## Add Shared Package
Pattern not found in repository.

## Add UI Component
* **Preconditions:** Understand the Tailwind v4 and shadcn/ui setup in `packages/web`.
* **Steps:**
  1. Determine if a shadcn/ui component already exists or needs upgrading (`pnpm dlx shadcn diff`).
  2. Place generic UI elements in `packages/web/src/components/ui/`.
  3. Ensure screen reader accessibility using React's `useId()` hook for linking inputs to labels.
* **Validation:** Run `pnpm --filter @lightscope-ce/web run lint` and `pnpm --filter @lightscope-ce/web run build`.
* **Common Mistakes:** Overcomplicating derived state via `useState` + `useEffect` instead of `useMemo`.

## Add Database Query
* **Preconditions:** Know if the target is ClickHouse (Analytics) or SQLite (Prisma, State).
* **Steps:**
  1. Write the query logic in the respective loader or Prisma client module.
  2. Apply SQL parameter binding using the `{name:Type}` format for ClickHouse queries.
* **Validation:** Execute the target test file to hit the mocked or integration database.
* **Common Mistakes:** Hardcoding `LIMIT` or `OFFSET` directly into template strings.

## Add Test
* **Preconditions:** Identify the type of test (unit vs integration vs e2e).
* **Steps:**
  1. Place unit tests inside `tests/unit/` of the corresponding package.
  2. Use `@/` path alias when importing source files.
  3. Use Vitest `vi.stubGlobal` for DOM interactions.
* **Validation:** Run `pnpm --filter <package> run test <filepath>`.
* **Common Mistakes:** Using `bun:test` instead of `vitest`; executing the global `vitest` command instead of the `pnpm --filter` script.

## Add Environment Variable
* **Preconditions:** Locate `.env.example` and the respective `package.json` environments.
* **Steps:**
  1. Add the variable to `.env.example` and GitHub Actions workflow files (`.github/workflows/ci.yml`).
  2. Implement an explicit secure failure check (throw Error) if the variable is missing.
* **Validation:** Run `pnpm run ci` to verify the missing variable does not break CI.
* **Common Mistakes:** Providing a hardcoded fallback (e.g., `process.env.VAR || 'secret'`).

## Add Background Job
Pattern not found in repository.

## Add Migration
* **Preconditions:** For ClickHouse, modify the SQL schema files. For SQLite, modify the Prisma schema.
* **Steps:**
  1. Add a migration file in `packages/clickhouse/` or run `npx prisma migrate dev` in `packages/api/`.
  2. Validate changes locally.
* **Validation:** Run `pnpm run test:integration` inside `packages/api` which will reset and apply `test.db`.
* **Common Mistakes:** Editing generated code manually (e.g., Prisma client type defs).