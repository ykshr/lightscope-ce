# AGENTS.md (proxy)

Stack:
- Node (ESM)
- Hono
- ClickHouse
- Zod
- LRU Cache

Entry: `src/index.ts`

---

#### Coding Conventions
- **Indentation**: Use 2 spaces for indentation (Prettier standard).
- **Naming Conventions**: `camelCase` for variables/functions, `PascalCase` for types/interfaces/classes.
- **Library Restrictions**: Do not introduce heavy dependencies. Keep the proxy lightweight to maintain high performance.
- **Endpoint Responsibilities**: The primary role is to receive events from trackers quickly, validate them, and save them to ClickHouse. The Proxy package (`packages/proxy`) is a high-performance REST API built with Node.js and Hono, responsible for event ingestion from trackers and connected directly to ClickHouse.
- **Input Validation**: Use Zod to strictly validate that the incoming payloads are in the correct format.
- **CORS and Authentication**: The `JwtAuth` provider in `packages/proxy` strictly validates the request's `Origin` or `Referer` header against the `origin` claim in the JWT; if both headers are missing, the provider returns `null` to prevent unauthorized tracking.

#### Build & Test Commands
- **How to build the project**:
  To build or test the proxy service, use the workspace commands:
  ```bash
  pnpm --filter @lightscope-ce/proxy run build
  ```
- **How to run tests (commands and steps)**:
  ```bash
  pnpm --filter @lightscope-ce/proxy run test
  ```
- **Start Development Server**:
  ```bash
  pnpm --filter @lightscope-ce/proxy run dev
  ```

#### Project Structure
- `src/index.ts`: The entry point for the Hono application.
- `src/helpers/`: Utility functions for parsing tracker data and IP geolocation (e.g., MaxMind).
- `src/routes/`: Route definitions for the REST API.
- **Guidance on code placement**: Keep route definitions isolated in `src/routes/` and reusable logic in `src/helpers/`.

#### Restrictions
- **Guardrails**:
  - "Do not modify this directory": Do not arbitrarily change the project structure inside `src/`.
- **Security**:
  - The API and Proxy services follow a restrictive CORS policy where the `ALLOWED_ORIGIN` environment variable (supporting comma-separated strings) must be explicitly defined; if it is missing, the CORS middleware is skipped, defaulting to the browser's Same-Origin Policy. Do not change this behavior without authorization.
  - To prevent SQL injection, you must always use parameterized queries when inserting data into ClickHouse. In ClickHouse queries using `@clickhouse/client`, parameterized variables must use the syntax `{paramName:DataType}` (e.g., `{title:String}`, `{urls:Array(String)}`) inline with the query string, passing values in the `query_params` object.
- **Performance**:
  - Do not introduce heavy synchronous processing that would block incoming requests from trackers.
