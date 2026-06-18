## 2026-06-17 - Removed hardcoded ClickHouse credentials from docker-compose.yml
**Vulnerability:** The `docker-compose.yml` files for `packages/api` and `packages/proxy` contained hardcoded fallback credentials (`:-lightscope`) for ClickHouse (`CLICKHOUSE_USERNAME`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_DB`).
**Learning:** These hardcoded fallbacks can lead to databases being inadvertently exposed if a deployment is spun up without a properly configured `.env` file, relying on easily guessable default passwords.
**Prevention:** Avoid defining default passwords in docker-compose.yml files. Force the explicit configuration of secrets via environment variables by using the format `${SECRET_NAME}` without the `:-fallback` syntax.
