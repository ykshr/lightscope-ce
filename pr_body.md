This PR expands the end-to-end testing coverage for the Web Dashboard and improves the CI pipeline's execution time by introducing a caching strategy for Playwright browsers.

### Changes Made:
1. **Web Dashboard UI Tests**: 
   - Added a new Playwright test scenario (`packages/e2e/scenarios/dashboard.test.ts`).
   - Implemented verifications for basic page rendering and key metrics on the Overview page.
   - Added navigation tests verifying that users can successfully route to the Ranking and Article pages from the sidebar.

2. **CI Pipeline Optimization**:
   - Updated the GitHub Actions workflow (`.github/workflows/ci.yml`) to cache downloaded Playwright browsers.
   - Using the installed Playwright version to generate an accurate cache key (`~/.cache/ms-playwright`).
   - The workflow now falls back to installing only OS-level dependencies (`playwright install-deps`) when a cache hit occurs, drastically reducing CI job times for subsequent runs.

### Why:
- The existing test suite lacked E2E coverage for the core navigation and UI rendering of the Web Dashboard pages. 
- Playwright browser installations were previously downloading entirely on every CI run, which added unnecessary execution time. Adding an effective caching strategy resolves this bottleneck.

---
This PR was written using [Vibe Kanban](https://vibekanban.com)