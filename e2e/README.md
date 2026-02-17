# End-to-End Test for Lightscope CE

This directory contains the E2E test suite.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+

## Setup

1. Start the infrastructure:
   ```bash
   docker-compose up -d
   ```
   Wait for ClickHouse and API to be ready.

2. Run the test:
   ```bash
   npx tsx e2e/test.ts
   ```

## What it does

1. Generates a mock `page_view` event simulating the client-side script.
2. Sends the event to the API (`POST /events`).
3. Waits for ClickHouse ingestion.
4. Queries the GraphQL API (`POST /gql`) to verify the data is retrievable.
5. Asserts that the sent URL appears in the analytics results.
