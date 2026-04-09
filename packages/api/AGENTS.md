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
- **Indentation**: Use 2 spaces for indentation (Prettier standard).
- **Naming Conventions**: `camelCase` for functions/variables, `PascalCase` for types/interfaces/classes.
- **Library Restrictions**: Do not use any external ORM libraries other than Prisma for relational state. Do not add raw driver clients outside of ClickHouse.
- **Resolver Responsibilities**: Keep resolvers thin. Business logic belongs in service modules. Do not write raw SQL inside the resolver body.
- **Input Validation**: GraphQL type definitions do not guarantee runtime validation. All external inputs must be strictly validated with Zod and normalized before use.
- **Performance**: Always assume large datasets. Avoid loading full result sets into memory. Prefer pre-aggregated tables whenever possible.
- **Security**:
  - Sensitive information like `JWT_SECRET` must be explicitly configured in the environment. Hardcoded fallback values are strictly prohibited, and missing secrets must cause the request context creation to fail securely by throwing an error.
  - Do not log raw SQL errors.
  - Do not expose internal table names to the client.
  - Do not trust client-provided column names.
- **Hono Context**: Environment variables and bindings (like `JWT_SECRET`, `CLICKHOUSE_URL`) are retrieved from the Hono context using the `env(c)` function from `hono/adapter` within `createContext.ts`. Better Auth plugin objects (like `user` and `organization`) are exposed via `c.var`. Organization ID must be accessed via `c.var.organization.id` rather than assuming an `organizationId` property exists directly on the `user` object.
- **Better Auth Plugins**: When configuring frontend Better Auth plugins (like `organizationClient()`), ensure the corresponding backend plugin (e.g., `organization()`) is actively configured in the API (`packages/api/src/helpers/auth.ts`) to avoid 404 API errors. The `NoAuth` authentication provider (`packages/api/src/helpers/auth/noAuth.ts`) returns a static anonymous user object with `id: 'anonymous'`, `role: 'admin'`, and `tenantId: 'none'`. Its `handler` method returns a 401 Unauthorized Response. When using Better Auth, the built-in rate limiting feature (`rateLimit: { enabled: true }`) defaults to in-memory storage, meaning no database schema modifications are required to enable abuse prevention for features like authentication endpoints and password resets.
- **Helpers**: The `packages/api/src/helpers/rename.ts` utility uses recursive mapped types (`SnakeToCamelObject` and `SnakeToCamelCase`) to provide strong type safety when converting snake_case database records into camelCase TypeScript objects. The `snakeToCamel` utility uses a module-level `Map` to cache string transformations, which significantly optimizes the recursive `renameKeySnakeToCamel` function for objects with many or repeated keys, resulting in measurable performance gains (~5x speedup). This utility is tested by `packages/api/src/helpers/rename.test.ts`, covering simple objects, nested structures, arrays, and edge cases.
- **Mocking GraphQL**: When mocking `GraphQLResolveInfo` in tests, explicitly provide expected dummy properties and methods (e.g., `schema: { getType: () => null }`, `returnType: { name: 'Dummy' }`) instead of using empty objects cast as `any` (`{} as any`).

#### Build & Test Commands
- **How to build the project**: Run `pnpm --filter @lightscope-ce/api run build`.
  To ensure `@prisma/client` types are available during CI builds where `node_modules` are freshly installed, the `build` script in `package.json` must explicitly generate the Prisma client before running the TypeScript compiler (e.g., `"build": "npx prisma generate && tsc"`).
- **How to run tests (commands and steps)**:
  - Run Tests (Vitest):
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
  pnpm exec auth generate --config ./src/helpers/auth.ts --output ./prisma/schema/schema.prisma --yes
  pnpm exec prisma generate
  ```

#### Project Structure
- `src/index.ts`: The entry point of the application.
- `src/__generated__/`: Contains types and schemas generated by `graphql-codegen`, as well as the Prisma Client. When configuring Prisma in `packages/api`, the output path for the generated client in `schema.prisma` is set to `./src/__generated__/prisma`. Imports should use `@/__generated__/prisma/client` rather than `@prisma/client` to avoid module resolution errors.
- `src/resolvers/`: GraphQL resolvers. Note that the directory structure within `packages/api/src/graphql/` (including `loaders` and `resolvers`) has been migrated directly to `packages/api/src/` (e.g., `packages/api/src/resolvers`). Do not create or reference files in the legacy `graphql/*` path prefixes.
- `src/helpers/`: Utility functions and authentication providers (e.g., `better-auth` configuration).
- **Guidance on code placement**: GraphQL schema changes should affect `schema.graphql` and be codegen'd into `src/__generated__/`.

#### Restrictions
- **Security**:
  - Security standards for `packages/api` mandate that sensitive secrets (e.g., `JWT_SECRET`, `DATABASE_URL`) must be explicitly configured in the environment; hardcoded fallback values are prohibited, and missing secrets must cause the request context creation to fail securely by throwing an error.
- **Guardrails**:
  - "Do not edit this file directly": Do not manually edit files under `src/__generated__/`. After modifying schemas or fragments, you must run `pnpm run codegen`.
  - "Do not modify this directory": Do not create or reference files in the legacy `graphql/*` path prefixes.
- **ClickHouse Prohibitions**:
  - Never execute `SELECT *` without a `LIMIT`.
  - Do not perform client-side aggregation.
  - Do not build SQL queries using unsafe string concatenation. Always use inline param syntax `{paramName:DataType}` (e.g., `{title:String}`, `{urls:Array(String)}`) and pass values in the `query_params` object to prevent SQL injection. When hashing array parameters in ClickHouse queries (e.g., using `cityHash64`), use `arrayMap(x -> cityHash64(x), {keys:Array(String)})` rather than applying the hash function directly to the array, which incorrectly computes a single hash for the entire array string.
  - Do not execute unbounded queries.
  - *Except where necessary for specific analytics*, always specify explicit `GROUP BY`, `WHERE`, and `LIMIT` clauses.
- **Prisma Prohibitions**:
  - Do not import the generated client directly from `@prisma/client`.
  - The Prisma schema (`packages/api/prisma/schema.prisma`) should be kept to the absolute minimum fields necessary to support application requirements and Better Auth core operations (e.g., `name`, `email`, and `image` are strictly required for the `User` model by default).
  - Prisma uses the `PrismaLibSql` adapter, which requires a `DATABASE_URL` environment variable (defined in `Bindings` type and retrieved via `env(c)`).
- **CORS Policy**: The API service follows a restrictive CORS policy where the `ALLOWED_ORIGIN` environment variable (supporting comma-separated strings) must be explicitly defined; if it is missing, the CORS middleware is skipped, defaulting to the browser's Same-Origin Policy.
