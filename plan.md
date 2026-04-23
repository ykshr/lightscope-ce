1. **Insert Memory Details into Global AGENTS.md**: Use `replace_with_git_merge_diff` to explicitly inject the `JWT_SECRET` rule in GitHub Actions workflow files and test definition rules under the appropriate headings in `AGENTS.md`. Note: The system prompt says "replace_with_git_merge_diff: Use this to perform a targeted search-and-replace to modify an existing file. The format is a Git merge diff, meaning it needs a string argument with search and replace blocks." so I will use it.

2. **Insert Memory Details into API AGENTS.md**: Use `replace_with_git_merge_diff` to explicitly inject the `formatToDateTime`, `for...in loop`, and test definitions rules under appropriate headings into `packages/api/AGENTS.md`.

3. **Insert Memory Details into Web AGENTS.md**: Use `replace_with_git_merge_diff` to explicitly inject the `react-refresh/only-export-components`, `@phosphor-icons/react`, and test definitions rules under appropriate headings into `packages/web/AGENTS.md`.

4. **Review Changes**: Use `run_in_bash_session` to run `git diff` to review all the applied documentation changes.

5. **Run CI Checks**: Use `run_in_bash_session` to run `pnpm run ci` to ensure no documentation errors or regressions occurred.

6. **Complete Pre-Commit Steps**: Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

7. **Submit Changes**: Submit the branch with an appropriate documentation update message.
