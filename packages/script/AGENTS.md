# AGENTS.md (script)

This is the client-side analytics embed script.

This package is performance critical and size sensitive.

---

# Strict Rules

1. No heavy dependencies.
2. No React.
3. No large libraries.
4. No Node-only APIs.
5. Must run in browser environment.
6. Keep bundle size minimal.
7. Preserve backward compatibility.

---

# Performance Rules

- Minimize allocations.
- Avoid large polyfills.
- Avoid unnecessary abstraction.
- Keep runtime small.

---

# Public API Stability

Never:
- Change public function signature
- Change event format
- Change payload shape

Without explicit instruction.

---

# Safety

Never:
- Block main thread unnecessarily
- Introduce synchronous heavy computation
- Leak memory via listeners