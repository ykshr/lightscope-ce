### What changes were made
- Added a `postinstall` script in the `e2e` package to automatically install Playwright's Chromium browser, preventing "Executable doesn't exist" errors.
- Added a `pretest` script in the `e2e` package to ensure the `@lightscope-ce/script` package is built before tests run, resolving module not found errors.
- Renamed `cli/wait-for-ports.js` to `cli/wait-for-services.js` to accurately reflect its responsibilities.
- Enhanced `cli/wait-for-services.js` to explicitly wait for ClickHouse's internal initialization to complete. It now verifies the existence of the final materialized view (`pv_utm_hour_to_day_mv`) via HTTP, rather than just checking if the port is open.
- Added diagnostic logging to the `trend` query in `api.test.ts` to surface detailed error responses.

### Why they were made
The End-to-End tests were exhibiting failures for a few reasons:
1. Local test environments lacked the required Playwright browser binaries and unbuilt local dependencies out of the box.
2. The API tests (specifically the `trend` GraphQL query) occasionally failed because the test suite would start as soon as the ClickHouse port was exposed, which happens before its initialization SQL scripts finish creating the necessary tables and materialized views.

### Implementation details
- The ClickHouse readiness check makes an authenticated HTTP GET request to `system.tables` to ensure the database is fully seeded and ready for incoming GraphQL queries.
- Package scripts were updated to chain lifecycle dependencies (`pretest`, `postinstall`).

This PR was written using [Vibe Kanban](https://vibekanban.com)