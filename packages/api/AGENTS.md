# AGENTS.md (api)

Stack:
- Node (ESM)
- Apollo Server v5
- Express v5
- ClickHouse
- Redis
- DataLoader
- GraphQL Codegen
- zod

Entry:
  src/index.ts

---

# Architectural Rules

## Resolver Layer
- Resolvers must stay thin.
- Business logic belongs in service modules.
- No raw SQL inside resolver body.

## ClickHouse Rules

This is a high-volume analytics system.

Never:
- SELECT * without LIMIT
- Perform unbounded queries
- Perform client-side aggregation
- Build SQL via unsafe string concatenation

Always:
- Explicit GROUP BY
- Explicit projections
- Explicit WHERE
- Explicit LIMIT (unless aggregation query)

---

## Validation

GraphQL type definitions are not runtime validation.

All external inputs must:
- Be validated with zod
- Be normalized before usage

---

## Performance

- Assume large datasets
- Avoid loading full result sets in memory
- Prefer pre-aggregated tables

---

## Security

Never:
- Log raw SQL errors
- Expose internal table names
- Trust client-provided column names

---

## Codegen

After modifying:
- schema
- queries
- mutations
- fragments

Run:
  pnpm run codegen

Never manually edit generated files.
