# File: .ai/skill/AI_AGENT_RULES.md

## Before Writing Code
* [ ] Verify the existence of specific functions, methods, or API endpoints by reading files or using `grep` before planning changes (Groundedness Rule).
* [ ] Complete codebase exploration and context gathering before submitting a plan (Exploration Rule).
* [ ] Read any `AGENTS.md` files whose scope covers the target directory, noting specific build/test commands, formatting guidelines, and architectural rules.
* [ ] Ensure the planned steps outline a linear sequence of granular, actionable tool executions rather than bundled high-level tasks (Specificity Rule).

## Before Editing Existing Code
* [ ] Identify the source file. If the file is a build artifact (e.g., in a `dist/` or `build/` directory, or auto-generated like Prisma types), trace it back to the original source and edit the source instead.
* [ ] Verify that no new frameworks or heavy dependencies are being unnecessarily introduced.
* [ ] Check if the edit might cross architectural boundaries (e.g., introducing a deep cross-package import). If a utility is needed, prefer local duplication for small utilities (e.g., `redactError`) over deep imports.
* [ ] Ensure that no existing security mechanisms (such as missing credential handling or parameterized queries) are being bypassed or replaced with hardcoded fallbacks.

## Before Creating New Files
* [ ] Determine the correct location based on the project structure (e.g., unit tests must go in `tests/unit/`, not inside `src/`).
* [ ] Ensure the file uses appropriate naming conventions (`camelCase` for utilities/variables, `PascalCase` for React components and types).
* [ ] Ensure the file is written entirely in English, including all comments and documentation strings.
* [ ] Verify that the Prettier configuration (`"singleQuote": true`) will be applied to the new file.

## Before Finishing Task
* [ ] Verify that all code changes achieve the intended effect using a read-only tool.
* [ ] Run `pnpm run ci` from the workspace root (or the relevant package specific test/lint scripts) to validate formatting, linting, build, and tests.
* [ ] If the lockfile state is out of sync with `package.json`, run `pnpm install` in the root directory to resolve `ERR_PNPM_OUTDATED_LOCKFILE`.
* [ ] Clean up any temporary scratchpad scripts (e.g., `.sh`, `.js`, `.py` files) used for text processing or validation in the working directory.
* [ ] Format the PR title correctly according to the contribution guidelines (e.g., `🔒 [security fix description]`, `⚡ [performance improvement description]`).
* [ ] Complete all pre-commit instructions strictly as defined by the user prompt.

## Forbidden Actions
* **Deep Cross-Package Imports**: Do not import modules using relative paths that traverse package boundaries (e.g., `import { util } from '../../api/src/util'`). Use standard package exports or duplicate small utilities.
* **Hardcoding Secrets**: Do not use hardcoded secret fallbacks (e.g., `|| 'secret'`).
* **Bypassing ClickHouse Parameter Binding**: Do not construct ClickHouse SQL queries using raw string interpolation for user inputs. Always use the parameterized query syntax (`{param:Type}`).
* **Using `any`**: Do not use `any` or unsafe casting (like `as any`) in new code, except where strictly required for mocking browser globals in test environments.
* **Inventing Best Practices**: Do not document or implement generic best practices unless they can be explicitly verified by existing code in the repository.
* **Non-English Content**: Do not write documentation, comments, or commit messages in any language other than English.
* **Editing Build Artifacts**: Do not modify files in `dist/`, `build/`, or generated Prisma files directly.
