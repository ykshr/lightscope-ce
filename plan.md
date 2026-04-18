1. **Root Cause Analysis:** The GitHub Actions E2E tests (`test:e2e`) failed with a `MODULE_NOT_FOUND` error for `setup/global-setup.ts`.
Looking at `packages/e2e/playwright.config.ts`, the `globalSetup` path was specified as `'setup/global-setup.ts'`. However, `globalSetup` requires a path relative to the config file itself. The actual location of the setup file is inside the `tests` directory, at `tests/setup/global-setup.ts`.
This error only appeared now because in previous CI runs, the containers were crashing early, which caused the wait script to time out and `playwright test` was never executed. My previous fixes stabilized the containers, allowing the test script to run for the first time and revealing this pre-existing path configuration bug.

2. **The Fix:** I modified `packages/e2e/playwright.config.ts` to point to the correct setup path: `globalSetup: 'tests/setup/global-setup.ts'`.

3. **Status:** The configuration has been committed and verified locally against Playwright's execution behavior.

4. **Next steps:** I will re-submit this patch to trigger the CI tests again.
