# LightScope CE

LightScope CE (Community Edition) is a high-performance web analytics platform powered by ClickHouse. Built as a TypeScript monorepo, it provides real-time data aggregation and a modern dashboard.

## Project Structure

This project uses **pnpm workspaces** to manage the following packages:

- **packages/web**: Frontend application (React 19, Vite, Tailwind CSS v4, Recharts)
- **packages/api**: GraphQL API backend (Node.js, Hono `@hono/graphql-server`, ClickHouse, Prisma, Better Auth)
- **packages/proxy**: REST API for tracker event ingestion (Node.js, Hono, ClickHouse)
- **packages/clickhouse**: ClickHouse database configuration and SQL migrations
- **packages/tracker**: Utility scripts for the tracker
- **packages/mock-site**: A mock site for testing, served via Nginx
- **packages/e2e**: End-to-end tests using Playwright and tsx

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, TanStack Query v5
- **Backend**: Node.js, TypeScript, Hono, GraphQL API (api), REST API (proxy), Prisma (SQLite), Better Auth
- **Database**: ClickHouse (for high-speed analytics queries)
- **Infrastructure**: Docker, Docker Compose, Nginx

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- pnpm (v9+ recommended)
- Docker & Docker Compose (required for running the full stack)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ykshr/lightscope-ce.git
   cd lightscope-ce
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Review and update the `.env` file with your settings if necessary.
   *Note:* CORS origins for the `api` and `proxy` packages are restricted via the `ALLOWED_ORIGINS` environment variable (defaults to `[]`).

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API Port | `3000` |
| `CLICKHOUSE_URL` | ClickHouse connection URL | `http://localhost:8123` |
| `CLICKHOUSE_USERNAME` | ClickHouse username | `lightscope` |
| `CLICKHOUSE_PASSWORD` | ClickHouse password | `lightscope` |
| `VITE_API_ENDPOINT` | API URL for the frontend | `http://localhost:3000` |

See `.env.example` for a complete list.

### Running Locally (Docker Compose)

The easiest way to run the full stack is with Docker Compose from the root directory:

```bash
docker compose up -d --build
```

This will start the following services:
- **ClickHouse**: `http://localhost:8123`
- **API**: `http://localhost:3000`
- **Proxy**: `http://localhost:3001`
- **Web Dashboard**: `http://localhost:3000`
- **Mock Site**: `http://localhost:8080`

*Note:* If Docker Compose fails to pull the ClickHouse image, it may be due to Docker Hub unauthenticated pull rate limits. Please log in or try again later.

### Available Scripts

You can run the following commands from the repository root:

- `pnpm run format`: Automatically fixes code formatting issues using Prettier.
- `pnpm run ci`: Runs linting, type checking, formatting checks, unit tests, and build processes across all packages. Always run this before creating a pull request to ensure there are no errors.
- `pnpm run test:e2e`: Runs end-to-end tests.

## Architecture Overview

LightScope consists of four main components:

1. **Ingestion (Proxy)**: A REST API that receives analytics events from trackers.
2. **API (API)**: A GraphQL API that serves data to the dashboard.
3. **Storage (ClickHouse)**: A high-performance columnar database for storing large volumes of event data and executing real-time aggregations.
4. **Dashboard (Web)**: A modern React application for visualizing analytics data.

## License

MIT License

## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure details, and prohibited patterns. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository.
