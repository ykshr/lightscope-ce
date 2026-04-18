1. **Root Cause Analysis:** The `packages/proxy` build was failing on GitHub Actions with `tsc -b` complaining it couldn't find `../src/app`.
This was because in `tests/integration/proxy.integration.test.ts`, the import was a relative path instead of using the path alias `@/app`, which led `tsc` to fail when mapping project references. Also, the `tsconfig.test.json` was missing `"noEmit": true`, causing `tsc -b` to compile test files and pollute the tree with generated `.js` files, which then tripped up `prettier`.

2. **The Fix:** I modified `packages/proxy/tests/integration/proxy.integration.test.ts` to use the `@/` path alias. I also added `"noEmit": true` to `tsconfig.test.json` in `packages/api`, `packages/proxy`, and `packages/tracker` to match best practices when building TS test projects without generating artifacts.

3. **Status:** The build passes completely cleanly now. Local `tsc -b` works perfectly without any errors. `pnpm run build` operates flawlessly across the whole monorepo.

4. **Next steps:** I will finish the pre-commit steps and submit the pull request.
