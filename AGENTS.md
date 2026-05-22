# LightScope CE - Global AGENTS.md

This repository is a TypeScript monorepo using `pnpm workspaces`. Please strictly follow these rules:

All `AGENTS.md` files in the repository must be structured with four specific English headers: `#### Coding Conventions`, `#### Build & Test Commands`, `#### Project Structure`, and `#### Restrictions`.

#### Coding Conventions
* Rules for indentation
  - Use 2 spaces for indentation in TypeScript/JavaScript/JSON/YAML files (enforced by Prettier).
  - The repository's Prettier configuration (`.prettierrc`) enforces `"singleQuote": true`; all new source and test files must adhere to this to pass CI formatting checks.
* Naming conventions
  - Use `camelCase` for variables and functions.
  - Use `PascalCase` for classes, React components, and interfaces/types.
* Restrictions on libraries that should or should not be used
  - Do not introduce heavy dependencies or global state libraries unnecessarily.
  - Do not use external ORMs other than Prisma.
  - Maintain strict TypeScript. The use of `any` or unsafe casting (like `as any`) is prohibited.
  - Always import from a package's public exports. Deep cross-package imports (e.g., `../../api/src/...`) are not allowed.
  - To adhere to monorepo restrictions against deep cross-package imports, small utility functions like `redactError` are duplicated in both `packages/api/src/helpers/` and `packages/proxy/src/helpers/`.
  - **Language**: Write all code, comments, and commit messages in concise and intuitive English. All documentation, including `AGENTS.md` and `README.md` files, must be written entirely in English. Even if user instructions or PR comments are provided in other languages (e.g., Japanese, or phrases like 'how'), any generated documentation files must still be translated to and written entirely in English to strictly comply with this rule.
  - **PR Titles**:
    - Security-related: `🔒 [security fix description]` + 'What', 'Risk', 'Solution'.
    - Performance improvement: `⚡ [performance improvement description]` + 'What', 'Why', 'Measured Improvement'.
    - Code health improvement: `🧹 [code health improvement description]` + 'What', 'Why', 'Verification', 'Result'.
    - Testing improvement: `🧪 [testing improvement description]` + 'What', 'Coverage', 'Result'.
  - **Execution Plans**:
    - *Groundedness Rule*: Do not assume the existence of specific functions, methods, or API endpoints without confirming their presence in the codebase during the exploration phase.
    - *Exploration Rule*: Codebase exploration and context gathering (e.g., verifying a file's exported functions via `cat` or `grep`) must be completed before submitting a plan.
    - *Specificity Rule*: Plans must outline a linear sequence of granular, actionable tool executions rather than bundling multiple tasks into high-level sub-steps.

#### Build & Test Commands
* How to build the project
  - Run `pnpm run build` in the respective package or `pnpm run ci` from the root to build and test everything.
  - **System Dependencies**: When installing Playwright system dependencies, run `pnpm --filter @lightscope-ce/e2e exec playwright install --with-deps` after `pnpm install`.
  - **Prettier Failback**: Prettier can be executed using `bun x prettier` when `pnpm run format` is blocked by network issues.
  - **CI Fallbacks**: In network-restricted environments where `pnpm` version verification fails with `ERR_PNPM_META_FETCH_FAIL`, use `node --check <filepath>` for syntax validation and `npx prettier --check <filepath>` for formatting verification as alternative CI checks.
  - **PackageManager Synchronization**: To synchronize the `pnpm` version with the workspace's `packageManager` configuration in Dockerfiles or CI environments, use `corepack enable pnpm`.
* How to run tests (commands and steps)
  - **Run CI/CD Checks**: To run comprehensive repository-wide CI checks (including linting, type checking, unit tests, and formatting), execute the command `pnpm run ci` from the workspace root. Always run this before marking a task as complete.
  - The root repository provides a `pnpm run ci` script that acts as the primary quality gate, sequentially running `format:check`, `lint`, `build`, and `test` across all workspace projects.
  - To comply with security standards that prohibit hardcoded secret fallbacks, the `JWT_SECRET` environment variable must be explicitly defined in GitHub Actions workflow files (`.github/workflows/ci.yml` and `.github/workflows/e2e.yml`) for any steps executing integration or E2E tests.
  - **Test Definitions**: Unit tests are function-level without package startup. Integration tests are package-level, requiring only the target package to be started with external dependencies mocked/stubbed. E2E tests are fully integrated tests requiring all packages to be started to cover comprehensive user journeys and data flows.
    ```bash
    pnpm run ci
    ```
  - **Run E2E Tests**:
    ```bash
    pnpm run test:e2e
    ```
  - **Code Formatting (Prettier)**: To format the entire repository using Prettier, run the command `pnpm run format` from the workspace root.
    ```bash
    pnpm run format
    ```

#### Project Structure
* Explanation of key directories
  - This repository does not use a build orchestrator like `turborepo` or `nx`. Please respect the boundaries of each package:
  - `packages/api/`: GraphQL API backend (Hono, GraphQL Server, Better Auth, Prisma).
  - `packages/proxy/`: REST API for tracker event ingestion (Hono).
  - `packages/web/`: Frontend dashboard (React 19, Vite, Tailwind v4).
  - `packages/tracker/`: Client-side tracking script. Place browser-specific scripts here.
  - `packages/clickhouse/`: ClickHouse configuration files and migrations.
  - `packages/e2e/`: End-to-end tests using Playwright.
  - `packages/mock-site/`: Mock site used for E2E testing.
* Guidance on where to place different types of code
  - Unit and integration tests go in `tests/unit/` and `tests/integration/` respectively.
  - Within each package, unit and integration tests must be placed in `tests/unit/` and `tests/integration/` directories respectively. Do not place tests directly inside the `src/` directory.
  - When importing source files from test files in the `tests/` directories, use the `@/` path alias (which resolves to the `src/` directory) rather than deep relative paths.
  - Reusable React components go in `packages/web/src/components/`.
  - Database schema changes go in `packages/api/prisma/` and `packages/clickhouse/`.
  - Tracker logic goes in `packages/tracker/src/`.
  - Core API logic goes in `packages/api/src/`.


#### Restrictions
* Guardrails such as:
  * “Do not edit this file directly”
    - Auto-generated files.
    - TODO and FIXME comments found inside the auto-generated Prisma files (e.g., `packages/api/src/__generated__/prisma/runtime/client.d.ts`) are inherent to the generated Prisma Client and can be safely ignored during codebase audits.
  * “Do not modify this directory”
    - Do not modify build output directories manually.
