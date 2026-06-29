🎯 **What:** Added missing unit tests for the `timezoneOffset` constant in `packages/web/src/helpers/date.ts`.
📊 **Coverage:** The test ensures that `timezoneOffset` matches the expected standard timezone format (e.g., `/^[+-]\d{2}:\d{2}$/`) and accurately reflects the current format of `dayjs().format('Z')`.
✨ **Result:** Improved test coverage for date helpers, preventing potential regressions if the underlying timezone handling library or logic changes in the future.
