# LightScope

LightScope is a web analytics platform built as a TypeScript monorepo. It features a high-performance analytics engine powered by ClickHouse and a modern React-based dashboard.

## Project Structure

This project uses **pnpm workspaces** to manage the following packages:

- **packages/web**: Frontend application (React, Vite, TailwindCSS, Recharts).
- **packages/api**: GraphQL API backend (Node.js, Express, Apollo Server, ClickHouse).
- **packages/clickhouse**: ClickHouse database configuration and SQL migrations.
- **packages/script**: Utility scripts.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query.
- **Backend**: Node.js, Express, Apollo Server (GraphQL).
- **Database**: ClickHouse (for high-speed analytics queries).

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- pnpm (v9+ recommended)
- Docker & Docker Compose (for running ClickHouse and the full stack)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/lightscope.git
    cd lightscope
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Configure environment variables:
    ```bash
    cp .env.example .env
    ```
    Review and update `.env` with your settings.

### Running Locally (Docker Compose)

The easiest way to run the full stack is with Docker Compose:

```bash
cd packages/e2e
docker-compose up --build
```

This will start:
-   ClickHouse (http://localhost:8123)
-   API (http://localhost:3000)
-   Web Dashboard (http://localhost:60000)

### Running Manually

1.  **Start ClickHouse:**
    Ensure a ClickHouse instance is running. You can use the Docker image provided in `packages/clickhouse`.

2.  **Start the API:**
    ```bash
    cd packages/api
    pnpm dev
    ```

3.  **Start the Frontend:**
    ```bash
    cd packages/web
    pnpm dev
    ```

## Configuration Options

Configuration is managed via environment variables. See `.env.example` for a complete list.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | API Port | `3000` |
| `CLICKHOUSE_HOST` | ClickHouse connection URL | `http://localhost:8123` |
| `CLICKHOUSE_USERNAME` | ClickHouse username | `lightscope` |
| `CLICKHOUSE_PASSWORD` | ClickHouse password | `lightscope` |
| `VITE_API_ENDPOINT` | API URL for the frontend | `http://localhost:3000` |

## Architecture Overview

LightScope consists of three main components:

1.  **Ingestion & API**: A Node.js service that receives analytics events and serves data via GraphQL.
2.  **Storage**: ClickHouse is used for storing high-volume event data and performing real-time aggregations.
3.  **Dashboard**: A React application for visualizing the data.

## Deployment Guide

### Docker

Build the images using the provided Dockerfiles in each package.

```bash
# Build API
docker build -t lightscope-api ./packages/api

# Build Web
docker build -t lightscope-web ./packages/web
```

Deploy using your preferred container orchestrator (Kubernetes, Docker Swarm, etc.). Ensure the environment variables are correctly set.

## License

MIT