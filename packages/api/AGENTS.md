# AGENTS.md (api)

Stack:
- Node (ESM)
- Hono
- `@hono/graphql-server`
- Better Auth
- ClickHouse
- DataLoader
- GraphQL Codegen
- Zod
- Prisma (SQLite)

Entry: `src/index.ts`

---

All `AGENTS.md` files in the repository must be structured with four specific English headers: `#### Coding Conventions`, `#### Build & Test Commands`, `#### Project Structure`, and `#### Restrictions`.

#### Coding Conventions
* Rules for indentation
  - Use 2 spaces for indentation (Prettier standard).
* Naming conventions
  - `camelCase` for functions/variables, `PascalCase` for types/interfaces/classes.
* Restrictions on libraries that should or should not be used
  - Do not use any external ORM libraries other than Prisma for relational state. Do not add raw driver clients outside of ClickHouse.
  - **Resolver Responsibilities**: Keep resolvers thin. Business logic belongs in service modules. Do not write raw SQL inside the resolver body.
  - **Input Validation**: GraphQL type definitions do not guarantee runtime validation. All external inputs must be strictly validated with Zod and normalized before use.
  - **Performance**: Always assume large datasets. Avoid loading full result sets into memory. Prefer pre-aggregated tables whenever possible.
    - Prisma automatically maps PostgreSQL/SQLite `DateTime` types to native JavaScript `Date` objects. To prevent unnecessary CPU overhead and memory allocation, avoid re-instantiating date fields with `new Date()` within `.map()` loops when transforming Prisma query results.
    - When building dynamic string arrays (like SQL filter conditions), prefer a single-pass `Array.reduce` over separate `.filter().map()` chains or `for...of` loops mutating external arrays, as the single-pass functional approach significantly improves execution speed by reducing array allocations.

  - **Helpers**:
    - The `packages/api/src/helpers/apple.ts` utility is tested by `packages/api/tests/unit/helpers/apple.test.ts`, verifying that `generateAppleClientSecret` correctly handles partially missing parameters by returning `undefined`.
    - The `packages/api/src/helpers/error.ts` utility is tested by `packages/api/tests/unit/helpers/error.test.ts`, verifying that it extracts only "name", "message", and "stack" from Error instances (including subclasses and objects with custom properties) while returning non-error values unchanged.
    - The `deepMerge` utility in `packages/api/src/graphql/resolvers/helpers/deepMerge.ts` securely prevents prototype pollution by explicitly skipping `__proto__`, `constructor`, and `prototype` keys during iteration. This behavior is verified by unit tests in `packages/api/tests/unit/graphql/resolvers/helpers/deepMerge.test.ts`.
    - The `formatToDateTime` utility in `packages/api/src/graphql/loaders/helpers/clickhouse.ts` converts JavaScript `Date` objects to ClickHouse-compatible "YYYY-MM-DD HH:mm:ss" strings and is verified by unit tests in `packages/api/tests/unit/graphql/loaders/helpers/clickhouse.test.ts`.
    - The `formatData` utility in `packages/api/src/graphql/loaders/helpers/clickhouse.ts` is optimized for performance by combining snake_case to camelCase key renaming and date string formatting into a single pass over the dataset, eliminating multiple O(N * M) nested loops.
    - The `packages/api/src/graphql/loaders/helpers/rename.ts` utility (tested by `packages/api/tests/unit/graphql/loaders/helpers/rename.test.ts`) provides `renameKeySnakeToCamel` and `camelToSnake`. The `renameKeySnakeToCamel` function's regex `/_([a-z])/g` strictly matches lowercase letters after underscores, meaning numbers (e.g., `user_1_name` becomes `user_1Name`) and uppercase letters (e.g., `Mixed_Case` remains unmodified) are excluded from camelCase conversion.

  - **Security**:
    - Sensitive information like `JWT_SECRET` must be explicitly configured in the environment. Hardcoded fallback values are strictly prohibited, and missing secrets must cause the request context creation to fail securely by throwing an error. Security standards for the `better-auth` configuration (located in `src/createContext.ts` and `src/types/auth.ts`) prohibit logging the sensitive password reset `url` within the `sendResetPassword` callback to prevent token leakage in system logs.
    - Do not log raw SQL errors.
    - ClickHouse queries in `packages/api/src/graphql/loaders/` must use parameter binding for `LIMIT`, `OFFSET`, and `LIMIT BY` clauses using the `{name:Type}` syntax (e.g., `{limit:UInt32}`) to prevent SQL injection; corresponding values should be stored in a `queryParamsObj` passed to the database client helper. Additionally, all ClickHouse queries must use parameter binding (passing `query_params` to the query helper) instead of direct string interpolation to prevent SQL injection and malformed queries.
    - Do not expose internal table names to the client.
    - Do not trust client-provided column names.

#### Build & Test Commands
* How to build the project
  - Run `pnpm --filter @lightscope-ce/api run build`.
  - To ensure `@prisma/client` types are available during CI builds where `node_modules` are freshly installed, the `build` script in `package.json` must explicitly generate the Prisma client before running the TypeScript compiler (e.g., `"build": "npx prisma generate && pnpm run codegen && tsc -b"`).
* How to run tests (commands and steps)
  - Run Tests (Vitest):
    *Note: In environments where pnpm metadata fetching is restricted, bun test can be used as a reliable alternative for executing Vitest-based tests in packages/api.*
    - **Database Integration**: In `packages/api`, the `test:integration` script automatically provisions a local SQLite test database (`file:./prisma/db/test.db`), runs `prisma migrate reset --force`, and executes tests within the `tests/integration/` directory using Vitest.
    - **Test Definitions**: Unit tests are function-level without package startup. Integration tests are package-level, requiring only the target package to be started with external dependencies mocked/stubbed. E2E tests are fully integrated tests requiring all packages to be started to cover comprehensive user journeys and data flows.
    - **Mocking Loaders**: In Vitest unit tests for Hono routers, when mocking loader dependencies, ensure the `vi.mock()` path strictly matches the exact alias path used in the source implementation (e.g., `@/rest/loaders/tracker`, not `@/loaders/tracker`). To simulate test-specific failures (like a 500 error path), import the module namespace (e.g., `import * as trackerLoader`) and use `vi.spyOn(trackerLoader, 'default').mockRejectedValueOnce(...)` rather than hardcoding rejections in the global module mock.
    - **Mocking Prisma**: Prisma mocks are injected directly into the request context (e.g., `c.set('$', { prisma: ... })`) via setup helpers like `setupApp`. To mock database errors for specific tests (like a `deleteMany` failure), modify these setup helpers to accept custom mock override parameters (e.g., `trackerMocks`) instead of relying on global module mocks.

    ```bash
    pnpm --filter @lightscope-ce/api run test
    ```
  - **Start Development Server**:
    ```bash
    pnpm --filter @lightscope-ce/api run dev
    ```
  - **Generate GraphQL Code**:
    Resolver types, enums, and schemas are generated into `src/__generated__/` (e.g., `graphql-resolvers.ts`, `schema.generated.graphql`) using `graphql-codegen`. Run `pnpm --filter @lightscope-ce/api run codegen` if these files are missing (e.g., causing 'Unknown file extension .graphql' errors in Node) or need updating before running the API.
    ```bash
    pnpm --filter @lightscope-ce/api run codegen
    ```
  - **Generate Prisma / Auth Schema**:
    ```bash
    # The `db:generate` script uses a dedicated configuration file at `./prisma/auth.ts` with a dummy Prisma client (e.g., `const dummyPrisma = {} as any`). This separates it from the main application auth logic to prevent 'module not found' circular dependencies when running `auth generate` before the Prisma client is generated.
    pnpm exec auth generate --config ./prisma/auth.ts --output ./prisma/schema/schema.prisma --yes
    pnpm exec prisma generate
    ```

#### Project Structure
* Explanation of key directories
  - `src/index.ts`: The entry point of the application.
  - `src/__generated__/`: Contains types and schemas generated by `graphql-codegen`, as well as the Prisma Client. When configuring Prisma in `packages/api`, the output path for the generated client in `schema.prisma` is set to `./src/__generated__/prisma`. Imports should use `@/__generated__/prisma/client` rather than `@prisma/client` to avoid module resolution errors. Generated code directories (such as `__generated__` for GraphQL codegen and Prisma) are intentionally excluded from version control via `.gitignore`. Code generation must be handled as part of the build step prior to typescript compilation.
  - `src/resolvers/`: GraphQL resolvers. - `src/helpers/`: Utility functions and authentication providers (e.g., `better-auth` configuration).
* Guidance on where to place different types of code
  - GraphQL schema changes should affect `schema.graphql` and be codegen'd into `src/__generated__/`.
  - Unit and integration tests go in `tests/unit/` and `tests/integration/` respectively.
  - Complex entity relationships and data fetching logic must be isolated within GraphQL resolvers that utilize Dataloaders to batch and optimize queries against ClickHouse.
  - Temporary Node.js scripts that use CommonJS `require()` must use the `.cjs` extension to avoid ES module reference errors, as the `package.json` specifies `"type": "module"`.

#### Restrictions
* Guardrails such as:
  * “Do not edit this file directly”
    - Auto-generated files.
  * “Do not modify this directory”
    - Do not modify build output directories manually.
