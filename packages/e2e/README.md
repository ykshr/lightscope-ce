# End-to-End Tests for Lightscope CE

This directory contains the E2E test suite using Playwright and standard testing scripts.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+
- pnpm 9+
- Playwright (for browser tests)

## Setup

1. **Install Dependencies:**
   Run the following from the workspace root:
   ```bash
   pnpm install
   ```

2. **Build the Tracker Package:**
   Ensure the tracker package for browser tests is built so it can be served to the test page.
   ```bash
   pnpm --filter @lightscope-ce/tracker run build
   ```

3. **Start the Infrastructure:**
   From the workspace root directory:
   ```bash
   docker compose up -d --build
   ```
   This starts:
   - ClickHouse (Database at localhost:8123)
   - API (Backend at localhost:3000)
   - Proxy (Ingestion API at localhost:3001)
   - Web (Frontend at localhost:3000)
   - Mock Site (Test Page at localhost:8080)

## Test Scenarios

### 1. Smoke Test (No Browser)

A quick verification that the proxy API accepts events and ClickHouse ingests them.

```bash
pnpm --filter @lightscope-ce/e2e run test:smoke
```

### 2. Browser Verification (Playwright)

Verifies the actual client-side tracking script (`packages/tracker`) running in a browser.

- Loads the test page from `mock-site`.
- Intercepts network requests to verify events are sent to the proxy.
- Queries the GraphQL API to verify data ingestion.

```bash
pnpm --filter @lightscope-ce/e2e run test:e2e
```

### 3. Load Test

Sends a high volume of events concurrently to test API performance.
- Default: 100 concurrent requests for 5 seconds.

```bash
pnpm --filter @lightscope-ce/e2e run test:load
```

### 4. Long Running Test

Sends events periodically over a duration to verify stability.
- Default: 1 event/sec for 60 seconds.

```bash
pnpm --filter @lightscope-ce/e2e run test:long-run
# Custom duration (seconds)
pnpm --filter @lightscope-ce/e2e run test:long-run -- 120
```

## Troubleshooting

- **ClickHouse not ready:** If tests fail immediately, wait a few seconds for ClickHouse to fully start.
- **Script not found:** Ensure `packages/tracker/dist/browser.js` exists. If not, run `pnpm --filter @lightscope-ce/tracker run build:browser`.
## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure rules, and restrictions. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository. It is strictly required that all documentation must be written in English. All documentation, including PR comments, `AGENTS.md`, `README.md`, and generated files, must strictly adhere to the English-only rule.
