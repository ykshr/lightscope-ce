# AGENTS.md (clickhouse)

Contains:

- XML configurations for clickhouse server
- CREATE TABLE statements run at the clickhouse server startup
- Materialized views

This defines the analytics data layer.

---

# Schema Safety Rules

Never:

- DROP TABLE without migration plan
- Change engine type casually
- Remove existing columns used by API
- Change primary key without impact explanation

---

# Compatibility

Schema changes must be:

- Backward compatible
- Safe for production rollout
- Explicitly documented

---

# Materialized Views

If modifying:

- Explain data flow impact
- Ensure no data loss
- Ensure correct aggregation logic

---

# Critical Analytics Integrity

Never:

- Change time bucketing logic silently
- Change timezone handling silently
- Change session definition silently
