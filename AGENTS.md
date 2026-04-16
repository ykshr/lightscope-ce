# LightScope CE - Global AGENTS.md

This repository is a TypeScript monorepo using `pnpm workspaces`. Please strictly follow these rules:

All `AGENTS.md` files in the repository must be structured with four specific English headers: `#### Coding Conventions`, `#### Build & Test Commands`, `#### Project Structure`, and `#### Restrictions`.

#### Coding Conventions
- **Language**: Write all code, comments, and commit messages in concise and intuitive English. All documentation, including `AGENTS.md` and `README.md` files, must be written entirely in English. Even if user instructions or PR comments are provided in Japanese (e.g., requesting a file like 'TASKS.md'), any generated documentation files must still be written entirely in English to strictly comply with the repository's English-only documentation rule. Note that Pull Request comments and repository discussions may be written in Japanese; ensure they are translated to understand the instructions accurately. When handling PR comments via `read_pr_comments`, always evaluate them against the code as it appears in the *modified* state of the pull request.
- **Type Safety**: Maintain strict TypeScript. The use of `any` or unsafe casting (like `as any`) is prohibited.
- **Rules for indentation**: Use 2 spaces for indentation in TypeScript/JavaScript/JSON/YAML files (enforced by Prettier).
- **Naming conventions**: Use `camelCase` for variables and functions. Use `PascalCase` for classes, React components, and interfaces/types.
- **Restrictions on libraries that should or should not be used**: Do not introduce heavy dependencies or global state libraries unnecessarily. Do not use external ORMs other than Prisma.
- **Import Rules**: Always import from a package's public exports. Deep cross-package imports (e.g., `../../api/src/...`) are not allowed.
- **Minimal Changes**: Edit only the necessary lines. Do not reformat unrelated files, and avoid rewriting entire modules unnecessarily. Temporary benchmark or verification files created during the development of performance optimizations should be removed from the source directory before submitting a Pull Request to maintain codebase hygiene.
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
- **System Dependencies**: When installing Playwright system dependencies, run `pnpm --filter @lightscope-ce/e2e exec playwright install --with-deps` after `pnpm install`.
- **Prettier Failback**: Prettier can be executed using `bun x prettier` when `pnpm run format` is blocked by network issues.
- **CI Fallbacks**: In network-restricted environments where `pnpm` version verification fails with `ERR_PNPM_META_FETCH_FAIL`, use `node --check <filepath>` for syntax validation and `npx prettier --check <filepath>` for formatting verification as alternative CI checks.
- **PackageManager Synchronization**: To synchronize the `pnpm` version with the workspace's `packageManager` configuration in Dockerfiles or CI environments, use `corepack enable pnpm`.
- **How to build the project**: Run `pnpm run build` in the respective package or `pnpm run ci` from the root to build and test everything.
- **How to run tests (commands and steps)**:
  - **Run CI/CD Checks**: To run comprehensive repository-wide CI checks (including linting, type checking, unit tests, and formatting), execute the command `pnpm run ci` from the workspace root. Always run this before marking a task as complete.
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
- *Note*: In automated or isolated environments, running `git fetch` or `git pull` from remote repositories may fail with 'terminal prompts disabled' errors due to the absence of interactive authentication credentials. `pnpm` commands may fail with `ERR_PNPM_META_FETCH_FAIL` if it attempts to verify its own version from the npm registry in network-restricted environments.

#### Project Structure
- **Explanation of key directories**:
This repository does not use a build orchestrator like `turborepo` or `nx`. Please respect the boundaries of each package:
- `packages/api/`: GraphQL API backend (Hono, GraphQL Server, Better Auth, Prisma).
- `packages/proxy/`: REST API for tracker event ingestion (Hono).
- `packages/web/`: Frontend dashboard (React 19, Vite, Tailwind v4).
- `packages/tracker/`: Client-side tracking script. Place browser-specific scripts here.
- `packages/clickhouse/`: ClickHouse configuration files and migrations.
- `packages/e2e/`: End-to-end tests using Playwright.
- `packages/mock-site/`: Mock site used for E2E testing.
- **Guidance on where to place different types of code**:
  - Unit and integration tests go in `tests/unit/` and `tests/integration/` respectively.
  - Reusable React components go in `packages/web/src/components/`.
  - Database schema changes go in `packages/api/prisma/` and `packages/clickhouse/`.
  - Tracker logic goes in `packages/tracker/src/`.
  - Core API logic goes in `packages/api/src/`.

#### Restrictions
- **Guardrails**:
  - "Do not edit this file directly": Do not manually edit generated files under `packages/api/src/__generated__/`.
  - "Do not modify this directory": Do not restructure the root `packages/` directory or introduce new build orchestrators.
- **Unauthorized Architecture Changes**:
  - Do not introduce new ORMs (Exceptions: Prisma and Better Auth for user management are allowed).
  - Do not introduce new frameworks.
  - Do not introduce new build systems or orchestrators.
  - Do not introduce global state management libraries.
  - Do not restructure the monorepo itself.
- **Rules for AI Agents**:
  - When tasked with documentation updates, do not modify any actual code, even if CI errors occur.
  - Do not modify a file without reading the entire file first.
  - Do not ignore the surrounding architecture or existing styles/patterns.
  - Do not guess or proceed with implementation if unsure (ask questions instead).
