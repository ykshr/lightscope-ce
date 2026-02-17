# AGENTS.md (root)

This is a TypeScript monorepo using pnpm workspaces.

packages/
  api/
  clickhouse/
  script/
  web/

There is NO turborepo, nx, or build orchestrator.

AI agents must respect package boundaries.

---

# CI/CD Checks

Before marking a task as complete, you must run the following command to ensure all checks pass:

```bash
pnpm run ci
```

This command runs linting, type checking, unit tests, and formatting checks across all packages.

---

# Global Rules

## 1. Language
- Write all projects in concise and intuitive English

## 2. Do Not Change Architecture
Never introduce:
- ORM
- New framework
- New build system
- Global state libraries
- Monorepo restructuring

## 3. Minimal Diffs
- Edit only necessary lines.
- Do not reformat unrelated files.
- Do not rewrite entire modules unless required.

## 4. Type Safety
- No `any`
- No unsafe casting
- Strict TypeScript only

## 5. No Deep Cross-Package Imports

Allowed:
  import from package public exports

Not allowed:
  ../../api/src/...

---

# AI Operational Rule

Before modifying:
1. Read entire file
2. Understand surrounding architecture
3. Preserve style and patterns
4. Make smallest safe change possible

If unsure → ask instead of guessing.