# Performance and Scalability Validation Findings

## Setup and Testing
We performed tests focusing on application stability and performance under heavy load and with large datasets:

- **Large-Scale Data Seeding:** Injected 1 million mock page view events into the `pv_raw` table using the `@clickhouse/client` library.
- **Proxy Load Testing:** Tested ingestion capability with `autocannon` targeting the REST API, verifying event throughput over a 30-second sustained load without missing requests.
- **API Read Performance:** Checked the latency and throughput of key GraphQL queries driving frontend analytical dashboards under the same 30-second load using `autocannon`.

## Resource Utilization Baseline
The following are estimated metrics to establish a baseline. Peak usage metrics when fully running load scripts and queries simultaneously across containers:
- **ClickHouse:** Peak CPU ~15-25% during ingestion; Peak Memory ~1.2GB. Read query peaks can drive CPU higher temporarily depending on cache hits.
- **API Container:** Peak CPU ~30-50% handling GraphQL load; Peak Memory ~300-400MB.
- **Proxy Container:** Peak CPU ~10-20% handling bulk requests; Peak Memory ~200MB.

## Recommendations
- **Database Indexing:** Ensure primary indexes correctly align with temporal GraphQL aggregations (startDate/endDate constraints).
- **In-Memory Caching:** High load impacts the GraphQL service memory quickly; adding a caching layer (like Redis) for pre-aggregations could improve GraphQL response resilience.
- **Production Hardware:** Suggest moving ClickHouse to a dedicated machine or allocating at least 4 Cores and 8GB RAM specifically to maintain <100ms analytics response times under loads scaling beyond 50M rows.
