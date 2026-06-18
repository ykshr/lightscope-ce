## 2024-10-31 - Missing Spinners on Async Actions
**Learning:** Destructive actions (like "Delete organization" in `DangerZone`) that trigger native confirmation dialogs and proceed to network requests were leaving users in a suspended state without visual loading indicators. This lack of feedback causes anxiety.
**Action:** Always include a visual `<Spinner />` inside the button when it enters a disabled/loading state, particularly for destructive or critical actions.
