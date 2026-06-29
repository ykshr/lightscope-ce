🎯 **What:** Removed the unnecessary `: any` type annotation from the `catch (e: any)` block and the unused error variable from a `catch (e)` block in `packages/proxy/src/routers/events/index.ts`.
💡 **Why:** The `: any` type annotation is redundant and goes against TypeScript best practices. The unused error variable in the catch block is dead code. Removing them improves code readability and maintainability without altering functionality.
✅ **Verification:** Ran `pnpm install`, generated GraphQL schemas, and executed the test suite `pnpm test` to confirm that all tests pass and there are no type errors.
✨ **Result:** A cleaner and more standard TypeScript codebase in the proxy package's events router.
