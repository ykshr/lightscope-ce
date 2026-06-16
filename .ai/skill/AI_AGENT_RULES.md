# File: .ai/skill/AI_AGENT_RULES.md

### Before Writing Code

- [ ] Read `AGENTS.md` and `README.md` if available in the current directory scope.
- [ ] Understand the dependency boundaries of the specific package (`web`, `api`, `proxy`, `tracker`).
- [ ] Locate the appropriate testing location (`tests/unit/`, `tests/integration/`) for the targeted changes.
- [ ] Ensure that no existing codebase pattern solves the problem already. Priority is given to consistency over idealized architecture.

### Before Editing Existing Code

- [ ] Use `grep` or `list_files` to find the exact source file.
- [ ] Check if the file is an auto-generated artifact (e.g., inside a `dist`, `build`, or generated Prisma directory). Edit the source, not the artifact.
- [ ] Review any existing `TODO` or `FIXME` comments around the code block.

### Before Creating New Files

- [ ] Follow existing project structures (e.g., UI components to `packages/web/src/components/`, API to `packages/api/src/`).
- [ ] Ensure that new files adhere to Prettier configurations (single quotes).
- [ ] Do not create generic configuration files or abstractions that deviate from the established framework (Vite, Hono, etc.).

### Before Finishing Task

- [ ] Verify functionality via appropriate testing or bash script outputs.
- [ ] Run `pnpm run format` (or `pnpm exec prettier --write <filepath>`) to automatically fix formatting.
- [ ] Run the CI suite via `pnpm run ci` from the repository root to ensure formatting, linting, building, and tests pass.
- [ ] Delete any temporary scratchpad scripts used for validation.
- [ ] Complete `pre_commit_instructions`.

### Forbidden Actions

- **Bypassing existing abstractions:** Do not introduce new libraries (like generic fetch wrappers) if an existing one (like TanStack Query or native fetch) is mandated.
- **Introducing new frameworks:** Do not install or depend on unverified packages without checking `package.json`.
- **Violating dependency boundaries:** Do not perform deep cross-package relative imports (e.g., importing `packages/api/src/helpers/...` directly into `packages/web/...`). Use `workspace:*` dependencies where permitted.
- **Leaving scratchpads:** Do not leave `.sh`, `.py`, or `.js` garbage files.
- **Ignoring secret constraints:** Never add `|| 'fallback'` for sensitive parameters like `JWT_SECRET`.
- **Modifying artifacts:** Do not edit files that explicitly indicate they are auto-generated.
- **Inventing conventions:** Do not invent coding patterns that cannot be verified in the repository. Explicitly state "Pattern not found in repository" if needed.