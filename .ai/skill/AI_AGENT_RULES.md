# File: .ai/skill/AI_AGENT_RULES.md

## Before Writing Code
* **Checklist:**
  * [ ] Have I performed codebase exploration (e.g., `cat`, `grep`) to verify the existence of assumed functions and endpoints?
  * [ ] Have I read the `AGENTS.md` and `README.md` files in the relevant directories?
  * [ ] Is my execution plan linear, granular, and specific?

## Before Editing Existing Code
* **Checklist:**
  * [ ] Am I editing a source file and not a generated build artifact (e.g., `__generated__`, `dist`)?
  * [ ] If restructuring documentation (`AGENTS.md`, `README.md`), am I preserving existing guidelines safely nested under new headings rather than overwriting them?
  * [ ] Will my changes introduce a deep cross-package import? (If yes, reconsider).

## Before Creating New Files
* **Checklist:**
  * [ ] Are unit tests placed in `tests/unit/` rather than alongside source files in `src/`?
  * [ ] Are filenames using appropriate casing (`camelCase` for utilities, `PascalCase` for React components)?
  * [ ] Does the new file adhere strictly to the English-only rule for code and comments?

## Before Finishing Task
* **Checklist:**
  * [ ] Have I run Prettier to format my changes? (`pnpm exec prettier --write <filepath>` or `pnpm run format` from root).
  * [ ] Have I verified my changes by running the specific test file? (`pnpm --filter <package> run test <path-to-test>`).
  * [ ] Have I cleaned up any temporary scratchpad files (`.sh`, `.js`, etc.)?
  * [ ] Have I run `pnpm run ci` from the workspace root to ensure all quality gates pass?

## Forbidden Actions
* **Deep Cross-Package Imports:** Do not import files using paths like `../../api/src/...`. Use public package exports or duplicate small utility functions.
* **Hardcoded Secret Fallbacks:** Do not use `|| 'secret'` or `:-secret`. Missing secrets must trigger a secure failure.
* **Bypassing ClickHouse Parameter Binding:** Do not use template string interpolation for dynamic variables in ClickHouse queries. Always use `{name:Type}`.
* **Modifying Generated Files:** Do not edit files in `__generated__` directories. Handle code generation via build steps.
* **Using Non-English Text:** Do not include non-English phrases in code, comments, documentation, or commit messages. Translate them to English.
* **Using `vitest` globally:** The global `vitest` command is unavailable. Always use `pnpm --filter <package> run test`.
* **Adding Heavy Dependencies to Tracker:** Do not introduce large libraries to `packages/tracker`. It must remain native and lightweight.
* **Modifying `package.json` without updating Lockfile:** Do not leave `package.json` and `pnpm-lock.yaml` out of sync. Always run `pnpm install` after modifying dependencies.
