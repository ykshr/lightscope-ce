# File: .ai/skill/TASK_RECIPES.md

# 1. Create New Skill

* **Preconditions**: A new reusable AI capability needs documentation.
* **Steps**:
  1. Create a new directory under `.agents/skills/` (e.g., `.agents/skills/my-skill/`).
  2. Add a `README.md` containing a general overview written strictly in English.
  3. Add a `SKILL.md` detailing the agent's objective and execution instructions strictly in English.
  4. Ensure all examples in the skill document explicitly cite and point to exact file paths from the repository as evidence.
* **Validation**: Run `pnpm run format` and `pnpm run lint` from the root to verify formatting and linting.
* **Common Mistakes**: Inventing references or citing generic "memory constraints" instead of real file paths.

# 2. Add API Endpoint

* **Preconditions**: Need to expose new data to the dashboard.
* **Steps**:
  1. Define the new GraphQL type and query/mutation in the schema.
  2. Run `pnpm --filter @lightscope-ce/api run codegen` to generate TypeScript types.
  3. Create a DataLoader in `packages/api/src/graphql/loaders/` to fetch data from ClickHouse.
  4. Use ClickHouse parameter binding (`{name:Type}`) for any dynamic limits or offsets.
  5. Implement the resolver in `packages/api/src/graphql/resolvers/`.
* **Validation**: Run unit tests in `packages/api/tests/unit/` and integration tests using `pnpm --filter @lightscope-ce/api test:integration`.
* **Common Mistakes**: Returning unformatted date strings instead of Node.js standard formats via `formatData`.

# 3. Add Shared Package

* **Preconditions**: A new distinct domain logic needs isolation.
* **Steps**:
  1. Create a new directory under `packages/` (e.g., `packages/my-lib/`).
  2. Initialize a `package.json` ensuring the name follows `@lightscope-ce/my-lib`.
  3. Add a `README.md` with a `## Contributing` section directing AI agents to read the `AGENTS.md` file.
  4. Run `pnpm install` in the root directory to link the workspace package.
* **Validation**: Run `pnpm run ci` from the workspace root to ensure the new package builds successfully.
* **Common Mistakes**: Creating circular dependencies with existing packages.

# 4. Add UI Component

* **Preconditions**: Need a new visual element for the dashboard.
* **Steps**:
  1. If it's a generic component, check if it can be added via shadcn: `pnpm dlx shadcn add [component-name] -o` inside `packages/web/`.
  2. If custom, create the component file in `packages/web/src/components/`.
  3. For interactive inputs, ensure screen reader accessibility using React's `useId()` hook to link `<input id={id}>` and `<Label htmlFor={id}>`.
  4. Compute derived state synchronously using `useMemo` rather than `useEffect`.
* **Validation**: Run `pnpm --filter @lightscope-ce/web run lint` and `pnpm run test:e2e` from root.
* **Common Mistakes**: Using `<button>` with `onClick={() => navigate(...)}` instead of semantic `<Link>` components for navigation.

# 5. Add Database Query

* **Preconditions**: Need to execute a new ClickHouse query.
* **Steps**:
  1. Define the SQL string in the relevant data loader file.
  2. Identify all dynamic values.
  3. Replace dynamic values with `{name:Type}` syntax (e.g., `{limit:UInt32}`).
  4. Pass the corresponding values in the `queryParamsObj` to the database client helper.
* **Validation**: Run integration tests for the specific loader.
* **Common Mistakes**: Using string interpolation (`${value}`) for user inputs, causing SQL injection risks.

# 6. Add Test

* **Preconditions**: Need to verify new functionality.
* **Steps**:
  1. Determine the test type: unit (function-level) or integration (package-level).
  2. Create the test file in `tests/unit/` or `tests/integration/` within the relevant package directory. Do not place inside `src/`.
  3. Use the `@/` path alias to import source files.
  4. If testing the tracker package, use `vi.stubGlobal` combined with `vi.unstubAllGlobals()` to mock browser globals safely.
* **Validation**: Run `pnpm --filter <package-name> run test <path-to-test>`.
* **Common Mistakes**: Executing tests with `bun test` in standard environments instead of the project-standard Vitest framework.

# 7. Add Environment Variable

* **Preconditions**: A new configurable secret or setting is required.
* **Steps**:
  1. Add the variable to `.env.example`.
  2. Implement a check in the application code to throw a secure failure if the variable is missing (do not use fallback values).
  3. Explicitly define the variable in GitHub Actions workflow files (`.github/workflows/ci.yml` and `.github/workflows/e2e.yml`).
* **Validation**: Verify CI passes by running `pnpm run ci` locally with a `.env` file containing the variable.
* **Common Mistakes**: Using `|| 'secret'` or `:-secret` fallbacks in the application code.

# 8. Add Background Job

* **Preconditions**: Need to perform deferred tasks.
* **Steps**:
  1. Identify the task (e.g., deferring `localStorage` writes).
  2. Use a scheduled mechanism like `requestIdleCallback` or `setTimeout`.
  3. Ensure critical data persistence on page exit via a `beforeunload` listener.
* **Validation**: Write unit tests mocking the global timer functions.
* **Common Mistakes**: Blocking the main thread by not deferring the task correctly.

# 9. Add Migration

* **Preconditions**: Need to change the Prisma schema or ClickHouse schema.
* **Steps**:
  1. For Prisma, update `packages/api/prisma/schema/schema.prisma`.
  2. Run `pnpm --filter @lightscope-ce/api run db:migrate`.
  3. For ClickHouse, add the migration script to `packages/clickhouse/`.
* **Validation**: Run `pnpm --filter @lightscope-ce/api run db:generate` to verify schema generation.
* **Common Mistakes**: Forgetting to run `pnpm run codegen` in both `api` and `web` packages if the GraphQL schema is affected.