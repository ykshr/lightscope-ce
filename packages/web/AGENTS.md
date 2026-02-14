# AGENTS.md (web)

Stack:
- React 19
- Vite
- TanStack React Query v5
- GraphQL Codegen
- Tailwind v4
- shadcn/ui
- Radix UI
- Recharts
- Vitest

---

# Data Fetching Rules

- Use generated GraphQL hooks.
- Avoid manual fetch.
- Avoid introducing axios.

---

# State Management

Prefer:
- React Query (server state)

Avoid:
- Custom global stores
- Redux
- Zustand

---

# UI Rules

- Use shadcn primitives first.
- Tailwind utilities only.
- Avoid custom CSS files.
- Avoid inline styles.
- Keep consistency with the existing components.
- Keep minimum classNames added to the components.

---

# Performance

Analytics dashboards can be heavy.

- Memoize heavy transforms.
- Avoid computing aggregations in render.
- Prefer backend aggregation.

---

# Testing

- Use Vitest
- Use Testing Library
- Avoid full DOM mocking unless necessary
