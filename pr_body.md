### Summary
This PR improves the end-to-end testing environment by running Playwright entirely inside Docker.

### What changes were made
* Added a new `e2e` service to `docker-compose.yml` utilizing the official Playwright Docker image.
* Introduced Docker healthchecks for `api`, `web`, `mock-site`, and `clickhouse` services to manage startup dependencies natively.
* Updated `package.json`'s `test:e2e` script to run tests via `docker compose --profile e2e up`.
* Removed redundant Playwright setup and browser installation steps from `.github/workflows/ci.yml`.
* Fixed a typo in the CI workflow where `pnpm run ci` was mistakenly called multiple times for each check.
* Deleted the now-obsolete `scripts/wait-for-ports.js` script.

### Why they were made
Previously, E2E tests required a custom `wait-for-ports.js` script to ensure services were ready before Playwright ran locally. Moving Playwright into Docker simplifies the testing setup, guarantees a consistent environment across local and CI, and dramatically speeds up the CI pipeline by utilizing the pre-built Playwright Docker image instead of installing OS dependencies and browsers during the GitHub Actions workflow.

### Implementation details
* **Port Forwarding with socat:** To minimize changes to test scripts and frontend environment configurations (which often expect API/web services to be available at `localhost`), the `e2e` Docker service uses `socat` to forward local ports to the respective Docker network services upon startup.
* **Docker Profiles:** The `e2e` service uses the `e2e` Docker Compose profile. This ensures it doesn't automatically spin up during standard development sessions when running standard `up` commands.
* **Exit Codes:** The `test:e2e` command relies on `--exit-code-from e2e` so that a test failure propagates correctly to CI and stops the job.

---
This PR was written using [Vibe Kanban](https://vibekanban.com)
