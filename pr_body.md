### What changes were made
* Fixed a 404 error for `browser.js` by adding `esbuild` to the script package and configuring the `build` script to bundle the browser file.
* Updated the root `docker:up` script to run `pnpm build` before bringing up the containers, and updated `docker-compose` to `docker compose`.
* Fixed the `@clickhouse/client` deprecation warning by changing the initialization property from `host` to `url`.
* Updated the Zod payload validation schema to make `referrer` an optional string, preventing 400 errors for direct visits.
* Resolved a data ingestion failure by extracting `tenant_id` from the request headers and correctly populating it in the `Article` and `PV` data structures for ClickHouse.
* Added the required `X-Tenant-Id: '1'` header to the E2E test GraphQL requests so that data verification succeeds.

### Why they were made
The "Lightscope E2E Test Page" environment was failing from script loading all the way to data verification. Specifically:
1. The mock site failed to serve `browser.js` because it wasn't being built beforehand.
2. Certain events were dropped at the validation level due to strict `referrer` requirements.
3. Buffered events failed to insert into ClickHouse because the schema required `tenant_id` which wasn't being correctly set in the mapped payload.
4. E2E verification requests lacked the tenant context, causing GraphQL queries to return empty or error out.

### Implementation details
* Added `esbuild` and `esbuild-register` to `@lightscope-ce/script` dependencies.
* Updated tests in `packages/api/src/rest/processEvent.test.ts` to mock the newly required `tenant_id` argument.
* Used `req.headers['x-tenant-id']` in the `/events` endpoint to assign tenant context.

This PR was written using [Vibe Kanban](https://vibekanban.com)