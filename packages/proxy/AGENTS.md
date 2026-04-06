# AGENTS.md (proxy)

Stack:
- Node (ESM)
- Hono
- ClickHouse
- Zod
- LRU Cache

Entry: `src/index.ts`

---

## Coding Conventions
- **Endpoint Responsibilities**: The primary role is to receive events from trackers quickly, validate them, and save them to ClickHouse. The Proxy package (`packages/proxy`) is a high-performance REST API built with Node.js and Hono, responsible for event ingestion from trackers and connected directly to ClickHouse.
- **Input Validation**: Use Zod to strictly validate that the incoming payloads are in the correct format.
- **CORS and Authentication**: The `JwtAuth` provider in `packages/proxy` strictly validates the request's `Origin` or `Referer` header against the `origin` claim in the JWT; if both headers are missing, the provider returns `null` to prevent unauthorized tracking.

## Execution & Testing Commands
- **Start Development Server**:
  ```bash
  pnpm --filter @lightscope-ce/proxy run dev
  ```
- **Build**:
  To build or test the proxy service, use the workspace commands:
  ```bash
  pnpm --filter @lightscope-ce/proxy run build
  ```
- **Run Tests (Vitest)**:
  ```bash
  pnpm --filter @lightscope-ce/proxy run test
  ```

## Project Structure
- `src/index.ts`: The entry point for the Hono application.
- `src/helpers/`: Utility functions for parsing tracker data and IP geolocation (e.g., MaxMind).
- `src/routes/`: Route definitions for the REST API.

## Prohibitions
- **Security**:
  - The API and Proxy services follow a restrictive CORS policy where the `ALLOWED_ORIGIN` environment variable (supporting comma-separated strings) must be explicitly defined; if it is missing, the CORS middleware is skipped, defaulting to the browser's Same-Origin Policy. Do not change this behavior without authorization.
  - To prevent SQL injection, you must always use parameterized queries when inserting data into ClickHouse. In ClickHouse queries using `@clickhouse/client`, parameterized variables must use the syntax `{paramName:DataType}` (e.g., `{title:String}`, `{urls:Array(String)}`) inline with the query string, passing values in the `query_params` object.
- **Performance**:
  - Do not introduce heavy synchronous processing that would block incoming requests from trackers.
