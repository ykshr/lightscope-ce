# LightScope CE - App Release Tasks

Based on a review of the current project state, here is a list of remaining tasks required to prepare the application for a public release.

## 1. Performance Optimization
- **Task:** Optimize the frontend bundle size. The Vite build output currently warns about chunks larger than 500kB. Implement code-splitting using `dynamic import()` or configure `manualChunks` to improve initial load performance.

## 2. Increase Test Coverage
- **Task:** Expand E2E test scenarios using Playwright. Ensure all critical user paths are covered, including authentication flows, data ingestion processes, and dashboard visualizations.

## 3. Documentation Updates
- **Task:** Update `README.md` to include comprehensive instructions for production deployment, expanding beyond the current local Docker Compose setup.

## 4. Performance & Scalability Validation
The application must be load-tested to verify its performance against varying data volumes, as the current capability is unknown.
- **Task:** Implement a large-scale data seeding script.
  - *Details:* Create a script (e.g., using Node.js or a pure ClickHouse SQL script) to inject millions of mock event records (e.g., 1M, 10M, 50M rows) into the ClickHouse database. This will simulate a long-running, heavily used application.
- **Task:** Benchmark API Read Performance.
  - *Details:* Using the seeded ClickHouse database, write benchmarking tests (using tools like `k6`, `autocannon`, or existing `tsx` scripts in `packages/e2e`) to measure the response times and throughput (Requests Per Second) of the `packages/api` GraphQL endpoints that power the dashboard visualizations. Identify any queries that degrade significantly as data volume grows.
- **Task:** Benchmark Proxy Ingestion Performance.
  - *Details:* Create a high-concurrency load test against the `packages/proxy` REST API. Measure the maximum number of events per second it can successfully ingest into ClickHouse without dropping requests or excessively spiking resource usage.
- **Task:** Monitor Resource Utilization.
  - *Details:* While running the load and ingestion benchmarks, monitor the CPU and Memory usage of the ClickHouse, API, and Proxy Docker containers. Document the peak usage and establish baseline hardware requirements for production deployment.
