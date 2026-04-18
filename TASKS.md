# LightScope CE - App Release Tasks

Based on a review of the current project state, here is a list of remaining tasks required to prepare the application for a public release.

## 1. Type Safety & Linting Improvements => Done
The codebase currently has numerous ESLint warnings (39 warnings in `packages/web`) mostly related to `@typescript-eslint/no-explicit-any` and `react-refresh/only-export-components`.
- **Task:** Resolve all `any` types across the `packages/web` application. Use strict typing for GraphQL responses and internal component state.
  - *Target Files:* `packages/web/src/components/charts/helpers/useProcessData.tsx`, `packages/web/src/components/maps/MapCountry.tsx`, etc.
- **Task:** Fix Fast Refresh warnings by extracting constants/functions from component files.
  - *Target Files:* `packages/web/src/components/charts/templates/Filter.tsx`, `packages/web/src/components/filters/DateFilter.tsx`, `packages/web/src/components/tables/templates/Sort.tsx`.
- **Task:** Fix `react-hooks/exhaustive-deps` warning in `MapCountry.tsx`.

## 2. Dynamic Data Integration
There are pages currently using hardcoded sample data that need to be connected to the actual API.
- **Task:** Replace `SAMPLE_ARTICLE` in `packages/web/src/pages/article/index.tsx` with actual data fetched from the API (likely via GraphQL).
- **Task:** /article page should be moved from /ranking page - when user clicks each article on the ranking list it directs to the article page.

## 3. Review Generated Files & TODOs
- **Task:** Review the `TODO` comments present in the auto-generated Prisma client files (`packages/api/src/__generated__/prisma/runtime/client.d.ts`). While these files should not be edited directly, verify that there are no underlying schema or configuration issues causing these warnings.

## 4. Security & Performance Optimization
- **Task:** Perform a final security audit. Ensure environment variables (`ALLOWED_ORIGINS`, `JWT_SECRET`, `DATABASE_URL`, etc.) are securely and correctly configured for production, with no reliance on hardcoded fallback values.
- **Task:** Optimize the frontend bundle size. The Vite build output currently warns about chunks larger than 500kB. Implement code-splitting using `dynamic import()` or configure `manualChunks` to improve initial load performance.

## 5. Increase Test Coverage
- **Task:** Implement comprehensive tests across all projects based on the following definitions:
  - **Unit Test:** Function-level testing. Does not require the package to be started.
  - **Integration Test:** Package-level testing. Requires the single target package to be started. External packages and dependencies must be mocked using stubs or drivers.
  - **E2E Test:** Fully integrated testing involving all packages. Requires all packages to be started. Must cover comprehensive user journeys and data flows.

- **Task:** Apply the definitions to each project as follows:
  - **`packages/api`**:
    - **Unit Tests:** Test individual resolver functions, authentication helpers, and data processing utilities.
    - **Integration Tests:** Start the API server and test GraphQL queries and mutations against an isolated (or stubbed) test database.
  - **`packages/web`**:
    - **Unit Tests:** Test UI components (rendering, state changes), custom hooks, and utility functions.
    - **Integration Tests:** Start the Vite dev server and test component interactions using mocked API responses.
  - **`packages/proxy`**:
    - **Unit Tests:** Test request parsing, validation logic, and data transformation helpers.
    - **Integration Tests:** Start the Hono proxy server and test event ingestion endpoints, stubbing the actual ClickHouse database connection.
  - **`packages/tracker`**:
    - **Unit Tests:** Test event tracking logic, configuration parsing, and browser API wrappers without a live backend.
    - **Integration Tests:** Test the tracker script initialization and payload generation in an isolated environment (e.g., jsdom) with a mocked proxy endpoint.
  - **`packages/e2e`**:
    - **E2E Tests:** Use Playwright to simulate full user journeys (authentication, data ingestion via tracker, proxy processing, API serving, and web dashboard visualization). Requires all services (`web`, `api`, `proxy`, `mock-site`, and databases) to be up and running via Docker Compose.

## 6. Documentation Updates
- **Task:** Update `README.md` to include comprehensive instructions for production deployment, expanding beyond the current local Docker Compose setup.

## 7. Performance & Scalability Validation
The application must be load-tested to verify its performance against varying data volumes, as the current capability is unknown.
- **Task:** Implement a large-scale data seeding script.
  - *Details:* Create a script (e.g., using Node.js or a pure ClickHouse SQL script) to inject millions of mock event records (e.g., 1M, 10M, 50M rows) into the ClickHouse database. This will simulate a long-running, heavily used application.
- **Task:** Benchmark API Read Performance.
  - *Details:* Using the seeded ClickHouse database, write benchmarking tests (using tools like `k6`, `autocannon`, or existing `tsx` scripts in `packages/e2e`) to measure the response times and throughput (Requests Per Second) of the `packages/api` GraphQL endpoints that power the dashboard visualizations. Identify any queries that degrade significantly as data volume grows.
- **Task:** Benchmark Proxy Ingestion Performance.
  - *Details:* Create a high-concurrency load test against the `packages/proxy` REST API. Measure the maximum number of events per second it can successfully ingest into ClickHouse without dropping requests or excessively spiking resource usage.
- **Task:** Monitor Resource Utilization.
  - *Details:* While running the load and ingestion benchmarks, monitor the CPU and Memory usage of the ClickHouse, API, and Proxy Docker containers. Document the peak usage and establish baseline hardware requirements for production deployment.
