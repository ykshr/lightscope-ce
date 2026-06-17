# File: .ai/skill/TASK_RECIPES.md

## Create new skill

* **Preconditions**: You need to define a new AI capability for the repository.
* **Steps**:
  1. Identify the relevant file within `.ai/skill/` (e.g., `CODING_PATTERNS.md` or `AI_AGENT_RULES.md`).
  2. Write the new rule strictly in English.
  3. Ensure the rule includes a repository-specific, evidence-based example (point to exact file paths).
  4. Ensure the `.ai/skill/` files are used as context by agents reading the repository.
* **Validation**: Run `pnpm exec prettier --check .ai/skill/` to verify formatting.
* **Common Mistakes**: Describing generic best practices instead of verifying patterns present in the repository code; inventing rules or conventions; writing the documentation in a non-English language.

## Add API endpoint

* **Preconditions**: The endpoint definition is clear, and the schema has been updated.
* **Steps**:
  1. Define the GraphQL schema in `packages/api/src/graphql/typeDefs.ts` (if applicable).
  2. Run `pnpm --filter @lightscope-ce/api run codegen` to generate the new types.
  3. Implement the resolver in `packages/api/src/graphql/resolvers/`.
  4. If database queries are needed, create a loader in `packages/api/src/graphql/loaders/` using the ClickHouse client.
  5. Use parameter binding (`{param:Type}`) for all raw SQL queries.
  6. Create unit and integration tests under `packages/api/tests/`.
* **Validation**: Run `pnpm --filter @lightscope-ce/api run test` and `test:integration`.
* **Common Mistakes**: Neglecting to use parameter binding for SQL queries; placing tests inside the `src/` directory instead of `tests/`.

## Add shared package

* **Preconditions**: There is a proven need for code reuse that cannot be satisfied by duplication (e.g., small utility duplication is allowed by architecture rules to prevent deep imports).
* **Steps**:
  1. Create a new folder under `packages/` (e.g., `packages/shared-types`).
  2. Initialize `package.json` with appropriate naming (`@lightscope-ce/shared-types`) and strict export definitions.
  3. Add the package to `pnpm-workspace.yaml`.
  4. Implement the logic and define clear, public exports in the package's `index.ts`.
  5. Update consuming packages' `package.json` to depend on `"workspace:*"`.
* **Validation**: Run `pnpm install` at the root and verify the package resolves correctly without `ERR_PNPM_OUTDATED_LOCKFILE`.
* **Common Mistakes**: Creating a shared package for small utility functions (like `redactError`) instead of intentionally duplicating them as required by monorepo constraints.

## Add UI component

* **Preconditions**: The component design is ready, and necessary data dependencies are understood.
* **Steps**:
  1. Check if an existing shadcn-ui component can be used or updated via `pnpm dlx shadcn add [component-name] -o`.
  2. Create the component in `packages/web/src/components/`.
  3. Generate unique IDs for accessibility using `useId()` and link `<input>` and `<Label>`.
  4. If managing state derived from props, use `useMemo` for synchronous derived state instead of `useState` + `useEffect`.
  5. Use `sanitizeCSSIdentifier` and `sanitizeCSSValue` if using `dangerouslySetInnerHTML`.
* **Validation**: Run `pnpm --filter @lightscope-ce/web run lint` and `build`.
* **Common Mistakes**: Managing derived state with `useEffect` causing double re-renders; failing to sanitize inputs when rendering custom charts.

## Add database query

* **Preconditions**: The required data exists in ClickHouse or Prisma schema.
* **Steps**:
  1. Determine if the query targets SQLite (Prisma) or ClickHouse (raw SQL).
  2. For ClickHouse: Construct the raw query in a loader under `packages/api/src/graphql/loaders/`.
  3. Bind variables using ClickHouse parameterized syntax (`{limit:UInt32}`).
  4. Format dates and map keys from snake_case to camelCase efficiently using single-pass formatting (`formatData`).
* **Validation**: Write tests mocking the ClickHouse client response and validating the `formatData` output.
* **Common Mistakes**: Constructing SQL queries using template literals; looping multiple times to transform results instead of a single-pass.

## Add test

* **Preconditions**: The target code logic is implemented.
* **Steps**:
  1. Identify the correct test directory: `tests/unit/` for isolated function tests, `tests/integration/` for package-level tests.
  2. For frontend tests: Create the file in `packages/web/tests/unit/` mirroring the `src/` directory structure.
  3. Ensure proper setup and teardown, particularly when using `vi.stubGlobal`.
  4. When testing tracker logic, explicitly cast mock return values to satisfy TypeScript (`as unknown as HTMLCollectionOf<Element>`).
* **Validation**: Run `pnpm --filter <package-name> run test <path-to-test>`. Ensure the file passes TypeScript compilation (`tsc -b`).
* **Common Mistakes**: Creating tests alongside source code inside `src/`; using `bun:test` instead of project-standard Vitest.

## Add environment variable

* **Preconditions**: A new configuration parameter is required.
* **Steps**:
  1. Add the variable to `.env.example`.
  2. Update relevant `docker-compose.yml` configurations to inject the variable.
  3. In code, validate the variable at startup and throw a secure failure error if missing.
  4. Ensure the variable is explicitly defined in GitHub Actions workflow files (`.github/workflows/ci.yml` and `.github/workflows/e2e.yml`) for steps executing tests.
* **Validation**: Run integration tests locally and verify CI passes without missing configuration errors.
* **Common Mistakes**: Using a hardcoded insecure fallback (`process.env.SECRET || 'secret'`); forgetting to update GitHub Actions workflows.

## Add background job

* **Preconditions**: A task needs to run outside the critical request path.
* **Steps**:
  1. Implement the job logic within the relevant package (e.g., `packages/api/`).
  2. Consider memory and execution time limits. If scheduling local browser logic, use `requestIdleCallback` or `setTimeout` (as seen in `AnalyticsTracker`).
  3. Ensure data persistence on exit events (e.g., using a `beforeunload` listener).
* **Validation**: Create unit tests verifying the job execution triggers correctly based on the mock environment.
* **Common Mistakes**: Blocking the main thread with heavy background tasks.

## Add migration

* **Preconditions**: The database schema needs updating.
* **Steps**:
  1. For Prisma: Update `packages/api/prisma/schema.prisma` and run `pnpm --filter @lightscope-ce/api run db:migrate`.
  2. For ClickHouse: Add a new `.sql` script to `packages/clickhouse/src/sql/` following the existing naming sequence (e.g., `00_...sql`).
  3. Test the migration against a clean local database.
* **Validation**: The `test:integration` script will automatically reset and migrate the Prisma database to ensure migrations apply correctly.
* **Common Mistakes**: Modifying the Prisma client generation directly instead of relying on the ORM's automated output.
