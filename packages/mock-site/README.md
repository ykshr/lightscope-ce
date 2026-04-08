# @lightscope-ce/mock-site

This package contains a mock site used for end-to-end (E2E) testing of the `@lightscope-ce/tracker`.

It is served via Nginx in the `docker-compose` setup and provides a simple HTML page that includes the compiled tracker script. This allows the Playwright test suite to simulate real user interactions and verify that events are correctly dispatched to the proxy service.