# @lightscope-ce/clickhouse

This package contains the Docker configuration and schema definitions for the LightScope ClickHouse server. It defines the foundational analytics data layer for the entire application.

## Features

- **Schema Setup**: SQL scripts to initialize tables and Materialized Views.
- **Server Configuration**: XML configuration files for optimizing the ClickHouse server for LightScope's workload.

## Scripts

- `pnpm run docker:build`: Builds a customized ClickHouse Docker image with LightScope's initialization scripts included.

## Getting Started

This package is typically managed through the root-level `docker-compose.yml`.

1. To start the ClickHouse database locally:
   ```bash
   docker compose up -d clickhouse
   ```

2. The database will be available at `http://localhost:8123` with the default user credentials specified in your `.env` file (`CLICKHOUSE_USERNAME` and `CLICKHOUSE_PASSWORD`).
## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure details, and prohibited patterns. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository. All documentation, including PR comments and generated files, must strictly adhere to the English-only rule.
