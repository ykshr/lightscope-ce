# @lightscope-ce/mock-site

This package contains a mock site used for end-to-end (E2E) testing of the `@lightscope-ce/tracker`. The `packages/mock-site` package contains a static HTML site served via Nginx for E2E testing of the tracker, and requires no build tools or JS frameworks.

It is served via Nginx in the `docker-compose` setup and provides a simple HTML page that includes the compiled tracker script. This allows the Playwright test suite to simulate real user interactions and verify that events are correctly dispatched to the proxy service.
## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure details, and prohibited patterns. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository.
