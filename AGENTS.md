# LightScope CE - Global AGENTS.md

This repository is a TypeScript monorepo using `pnpm workspaces`. Please strictly follow these rules:

## コーディング規約 (Coding Conventions)
- **Language**: Write all code, comments, and commit messages in concise and intuitive English. Note that Pull Request comments and repository discussions may be written in Japanese; ensure they are translated to understand the instructions accurately. When handling PR comments via `read_pr_comments`, always evaluate them against the code as it appears in the *modified* state of the pull request.
- **Type Safety**: Maintain strict TypeScript. The use of `any` or unsafe casting (like `as any`) is prohibited.
- **Import Rules**: Always import from a package's public exports. Deep cross-package imports (e.g., `../../api/src/...`) are not allowed.
- **Minimal Changes**: Edit only the necessary lines. Do not reformat unrelated files, and avoid rewriting entire modules unnecessarily. Temporary benchmark or verification files created during the development of performance optimizations should be removed from the source directory before submitting a Pull Request to maintain codebase hygiene.
- **PR Titles**:
  - Security-related: `🔒 [security fix description]` + 'What', 'Risk', 'Solution'.
  - Performance improvement: `⚡ [performance improvement description]` + 'What', 'Why', 'Measured Improvement'.
  - Code health improvement: `🧹 [code health improvement description]` + 'What', 'Why', 'Verification', 'Result'.
- **Execution Plans**:
  - *Groundedness Rule*: Do not assume the existence of specific functions, methods, or API endpoints without confirming their presence in the codebase during the exploration phase.
  - *Exploration Rule*: Codebase exploration and context gathering (e.g., verifying a file's exported functions via `cat` or `grep`) must be completed before submitting a plan.
  - *Specificity Rule*: Plans must outline a linear sequence of granular, actionable tool executions rather than bundling multiple tasks into high-level sub-steps.

## 実行・テストコマンド (Execution & Testing Commands)
- **Run CI/CD Checks**: Executes linting, type checking, unit testing, and formatting across all packages. Always run this before marking a task as complete.
  ```bash
  pnpm run ci
  ```
- **Run E2E Tests**:
  ```bash
  pnpm run test:e2e
  ```
- **Code Formatting (Prettier)**: Format the entire repository.
  ```bash
  pnpm run format
  ```
- *Note*: In automated or isolated environments, running `git fetch` or `git pull` may fail with 'terminal prompts disabled' due to the absence of credentials. `pnpm` commands may fail with `ERR_PNPM_META_FETCH_FAIL` if it attempts to verify its own version from the npm registry in network-restricted environments.

## プロジェクト構造 (Project Structure)
This repository does not use a build orchestrator like `turborepo` or `nx`. Please respect the boundaries of each package:
- `packages/api/`: GraphQL API backend (Hono, GraphQL Server, Better Auth, Prisma).
- `packages/proxy/`: REST API for tracker event ingestion (Hono).
- `packages/web/`: Frontend dashboard (React 19, Vite, Tailwind v4).
- `packages/tracker/`: Client-side tracking script.
- `packages/clickhouse/`: ClickHouse configuration files and migrations.
- `packages/e2e/`: End-to-end tests using Playwright.
- `packages/mock-site/`: Mock site used for E2E testing.

## 禁止事項 (Prohibitions)
- **Unauthorized Architecture Changes**:
  - Do not introduce new ORMs (Exceptions: Prisma and Better Auth for user management are allowed).
  - Do not introduce new frameworks.
  - Do not introduce new build systems or orchestrators.
  - Do not introduce global state management libraries.
  - Do not restructure the monorepo itself.
- **Rules for AI Agents**:
  - Do not modify a file without reading the entire file first.
  - Do not ignore the surrounding architecture or existing styles/patterns.
  - Do not guess or proceed with implementation if unsure (ask questions instead).
