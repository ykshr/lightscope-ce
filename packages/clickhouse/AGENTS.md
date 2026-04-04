# AGENTS.md (clickhouse)

This package defines the analytics data layer. It contains XML configuration files for the ClickHouse server, CREATE TABLE statements executed at startup, and definitions for Materialized Views.

---

## Coding Conventions
- **Schema Safety**:
  - Schema changes must always be backward compatible.
  - Ensure that rollouts to the production environment are safe.
  - Never remove existing columns that are used by the API.
- **Materialized Views Rules**:
  - If making changes, consider the impact on data flow and ensure there is no data loss.
  - Verify that the correct aggregation logic is maintained.

## Execution & Testing Commands
- **Build Docker Image**:
  ```bash
  pnpm --filter @lightscope-ce/clickhouse run docker:build
  ```
- *Note*: Typically, you will use `docker compose up -d` from the root directory to build and start the test environment.

## Project Structure
- `config.xml`, `users.xml`: Core configuration files for the ClickHouse server.
- `init-db.sh` or `*.sql`: Schema definitions (tables and materialized views) initialized when the container starts.

## Prohibitions
- **Schema Prohibitions**:
  - Never execute `DROP TABLE` without a migration plan.
  - Do not change engine types (like `MergeTree`) casually.
  - Do not change the primary key (`ORDER BY` clause) without a prior explanation of the impact.
- **Analytics Integrity Prohibitions**:
  - Do not silently change time bucketing logic.
  - Do not silently change time zone handling logic.
  - Do not silently change the definition of a session.