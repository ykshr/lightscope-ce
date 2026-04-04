# LightScope CE - Global AGENTS.md

This repository is a TypeScript monorepo using `pnpm workspaces`. Please strictly follow these rules:

## Coding Conventions
- **Language**: Write all code, comments, and commit messages in concise and intuitive English.
- **Type Safety**: Maintain strict TypeScript. The use of `any` or unsafe casting (like `as any`) is prohibited.
- **Import Rules**: Always import from a package's public exports. Deep cross-package imports (e.g., `../../api/src/...`) are not allowed.
- **Minimal Changes**: Edit only the necessary lines. Do not reformat unrelated files, and avoid rewriting entire modules unnecessarily.

## Execution & Testing Commands
- **Run CI/CD Checks**: Executes linting, type checking, unit testing, and formatting across all packages. Always run this before marking a task as complete.
  ```bash
  pnpm run ci
  ```
- **Run E2E Tests**:
  ```bash
  pnpm run test:e2e
  ```
- **Code Formatting (Prettier)**:
  ```bash
  pnpm run format
  ```

## Project Structure
This repository does not use a build orchestrator like `turborepo` or `nx`. Please respect the boundaries of each package:
- `packages/api/`: GraphQL API backend (Hono, GraphQL Server, Better Auth, Prisma).
- `packages/proxy/`: REST API for tracker event ingestion (Hono).
- `packages/web/`: Frontend dashboard (React 19, Vite, Tailwind v4).
- `packages/tracker/`: Client-side tracking script.
- `packages/clickhouse/`: ClickHouse configuration files and migrations.
- `packages/e2e/`: End-to-end tests using Playwright.
- `packages/mock-site/`: Mock site used for E2E testing.

## Prohibitions
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