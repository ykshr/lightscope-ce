# File: .ai/skill/AI_AGENT_RULES.md

# AI Agent Rules

## Before Writing Code
* [ ] Verify Groundedness: Do not assume the existence of functions or files without checking via `list_files`, `cat`, or `grep`.
* [ ] Check language requirement: ALL output, comments, code, and documentation must be in English. Translate any non-English prompts.
* [ ] Validate context: Are you modifying a test, core API, or tracker? Read the relevant `AGENTS.md` to refresh memory.

## Before Editing Existing Code
* [ ] Trace artifacts: Ensure you are editing the source file (`src/`), not build artifacts (`dist/`, `build/`, `__generated__/`).
* [ ] Check for generation scripts: If editing schema, run `pnpm run codegen` or `npx prisma generate` instead of editing generated TypeScript definitions directly.

## Before Creating New Files
* [ ] Verify file placement: Tests go in `tests/unit/` or `tests/integration/`, not `src/`. Components go in `src/components/`.
* [ ] File formatting: Use 2 spaces for indentation. Prettier enforces single quotes (`'`).

## Before Finishing Task
* [ ] Run CI script: Execute `pnpm run ci` from the workspace root to ensure formatting, linting, building, and tests pass.
* [ ] Lockfile integrity: Ensure `pnpm-lock.yaml` is not out of sync with `package.json` modifications.
* [ ] Cleanup: Delete any temporary scratchpad `.js`, `.py`, or `.sh` files created during processing.

## Forbidden Actions
* **Creating duplicate utilities**: Allowed ONLY to avoid deep cross-package imports (e.g., repeating a 10-line error formatter in `proxy` and `api`).
* **Bypassing existing abstractions**: Do not write raw SQL if a DataLoader pattern exists for that ClickHouse entity.
* **Introducing new frameworks**: Do not introduce alternative test runners (e.g., `bun:test`). Strictly use Vitest.
* **Violating dependency boundaries**: Do not import `packages/web` code into `packages/api`.
* **Hardcoding secrets**: Never add fallback credentials (`|| 'secret'`) in application code, test helpers, or compose files.
* **Polluting global namespace**: Avoid modifying global prototypes to prevent pollution. Use secure deep merge functions.
