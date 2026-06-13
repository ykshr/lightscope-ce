# File: .ai/skill/TASK_RECIPES.md

# Task Recipes

## Add API endpoint
* **Preconditions**: Must know whether it's a GraphQL endpoint (`packages/api`) or a REST endpoint (`packages/proxy`).
* **Steps**:
  1. Define the schema in `packages/api/src/graphql/schema/` (if GraphQL).
  2. Run `pnpm run codegen` in `packages/api` to generate types.
  3. Implement the resolver in `packages/api/src/graphql/resolvers/`.
  4. Create any required data loaders in `packages/api/src/graphql/loaders/`.
  5. Add unit/integration tests in `packages/api/tests/`.
* **Validation**: Run `pnpm --filter @lightscope-ce/api run test`.
* **Common Mistakes**: Forgetting to use `{param:Type}` for ClickHouse SQL parameter binding.

## Add shared package
* **Preconditions**: N/A
* **Steps**:
  1. This monorepo does not use a shared package paradigm by default. Instead, duplicate small utilities or rethink the boundary.
  2. If an actual shared package is required, create `packages/[name]`, initialize `package.json` with appropriate `name`, `version`, and `main` fields.
  3. Add the package to `pnpm-workspace.yaml` (already covered by `packages/*`).
  4. Run `pnpm install` at the root.
* **Validation**: Check if `pnpm install` succeeds without lockfile desync.
* **Common Mistakes**: Creating deep cross-package imports instead of utilizing the workspace boundary properly.

## Add UI component
* **Preconditions**: Familiarity with Tailwind CSS v4 and Radix UI.
* **Steps**:
  1. If it's a shadcn UI component, use `pnpm --filter @lightscope-ce/web dlx shadcn@latest add [component]`.
  2. Place custom reusable components in `packages/web/src/components/ui/` or `packages/web/src/components/`.
  3. Implement the component using `React.FC` and TypeScript.
  4. Export the component and use it in pages.
* **Validation**: Run `pnpm --filter @lightscope-ce/web run lint` and `build`.
* **Common Mistakes**: Using un-sanitized inputs in `dangerouslySetInnerHTML`. Use `sanitizeCSSIdentifier` and `sanitizeCSSValue`.

## Add database query
* **Preconditions**: Decide if it's Prisma (relational) or ClickHouse (analytics).
* **Steps**:
  1. For ClickHouse: Create a loader in `packages/api/src/graphql/loaders/`. Write SQL with `{param:Type}` binding.
  2. Use `ClickHouseClient.query` and pass `query_params`.
  3. Add tests verifying the query syntax and response formatting.
* **Validation**: Run `pnpm run test:integration` (ensuring local Docker ClickHouse is running).
* **Common Mistakes**: Using string interpolation `${var}` instead of `{var:String}`.

## Add test
* **Preconditions**: Vitest is installed.
* **Steps**:
  1. Create a `.test.ts` file in `tests/unit/` or `tests/integration/` under the target package.
  2. Use the `@/` path alias to import from `src/`.
  3. Write tests using Vitest (`describe`, `it`, `expect`, `vi.fn()`).
  4. If testing `packages/tracker`, stub globals using `vi.stubGlobal`.
* **Validation**: Run `pnpm --filter <package-name> run test <path-to-test>`.
* **Common Mistakes**: Using deep relative imports (e.g., `../../src/`) instead of `@/`. Placing tests in `src/`.

## Add environment variable
* **Preconditions**: Must not be hardcoded in source code.
* **Steps**:
  1. Add the variable to `.env.example`.
  2. Add the variable to the runtime validation schema (if using zod) or reference it securely.
  3. Update GitHub Actions workflows (`.github/workflows/ci.yml`) to include it if necessary for tests.
* **Validation**: Run CI tests locally to ensure no missing variable errors.
* **Common Mistakes**: Hardcoding fallback values `process.env.VAR || 'default'`.

## Add background job
* **Preconditions**: N/A
* **Steps**:
  1. Pattern not found in repository. No formal background job framework (like BullMQ) is implemented.
* **Validation**: N/A
* **Common Mistakes**: N/A

## Add migration
* **Preconditions**: Know the target database (Prisma or ClickHouse).
* **Steps**:
  1. For Prisma: Update `schema.prisma`, run `pnpm --filter @lightscope-ce/api run db:migrate`.
  2. For ClickHouse: Add SQL scripts to `packages/clickhouse/` and update initialization configurations.
* **Validation**: Restart local docker containers `docker compose down -v && docker compose up -d --build`.
* **Common Mistakes**: Forgetting to reset integration test databases.

## Create new skill
* **Preconditions**: Understand the repository architecture and conventions from existing `.ai/skill/*.md` files.
* **Steps**:
  1. Identify the pattern, rule, or architectural constraint to be documented.
  2. Decide which `.ai/skill/*.md` file it belongs in (e.g., `CODING_PATTERNS.md` for code snippets, `ANTI_PATTERNS.md` for mistakes, `TASK_RECIPES.md` for step-by-step guides).
  3. Ensure the rule is evidence-based and already exists in the repository. Provide real file paths or snippets as evidence.
  4. Write the new skill strictly in English, following the headers and format established in the target file.
  5. Update `PROMPT.md` if the overarching instructions for AI agents need to reflect this new capability or constraint.
* **Validation**: Read the updated `.ai/skill/*.md` file to verify formatting. Run `pnpm run format` to ensure Prettier compliance.
* **Common Mistakes**: Inventing a generic best practice that is not actually used in the LightScope CE codebase. Not providing explicit evidence.
