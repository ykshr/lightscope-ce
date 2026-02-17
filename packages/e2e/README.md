# End-to-End Tests for Lightscope CE

This directory contains the E2E test suite with multiple scenarios.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Playwright (for browser tests)

## Setup

1. **Install Dependencies:**

   ```bash
   cd e2e
   npm install
   npx playwright install --with-deps chromium
   ```

2. **Build the Script Package:**
   Ensure the browser script is built so it can be served to the test page.

   ```bash
   cd ../script
   npm install
   npm run build:browser
   ```

3. **Start the Infrastructure:**
   From the root directory:
   ```bash
   docker-compose up -d --build
   ```
   This starts:
   - ClickHouse (Database)
   - API (Backend at localhost:3000)
   - Web (Frontend at localhost:60000)
   - Mock Site (Test Page at localhost:8080)

## Test Scenarios

### 1. Smoke Test (No Browser)

A quick verification that the API accepts events and ClickHouse ingests them.

```bash
cd e2e
npm run test:smoke
```

### 2. Browser Verification (Playwright)

Verifies the actual client-side tracking script (`packages/script`) running in a browser.

- Loads the test page from `mock-site`.
- Intercepts network requests to verify `page_view` and `custom_click` events.
- Queries GraphQL to verify data ingestion.

```bash
cd e2e
npm run test
```

### 3. Load Test

Sends a high volume of events concurrently to test API performance.

- Default: 100 concurrent requests for 5 seconds.

```bash
cd e2e
npm run test:load
```

### 4. Long Running Test

Sends events periodically over a duration to verify stability.

- Default: 1 event/sec for 60 seconds.

```bash
cd e2e
npm run test:long-run
# Custom duration (seconds)
npm run test:long-run -- 120
```

## Troubleshooting

- **ClickHouse not ready:** If tests fail immediately, wait a few seconds for ClickHouse to fully start.
- **Script not found:** Ensure `packages/script/dist/browser.js` exists. If not, run `npm run build:browser` in `packages/script`.
