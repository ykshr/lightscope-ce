# AGENTS.md (mock-site)

This package contains a mock site served via Nginx for E2E testing.

#### Coding Conventions
- **Indentation**: Use 2 spaces for indentation for HTML and configuration files.
- **Naming Conventions**: Use `kebab-case` for file names.
- **Library Restrictions**: This package only contains static HTML and Nginx configuration. Do not introduce build tools or JS frameworks here.

#### Build & Test Commands
- **How to build the project**: No build step is required for static HTML.
- **How to run tests (commands and steps)**: This package is tested via the E2E suite. See `packages/e2e/AGENTS.md`.

#### Project Structure
- `index.html`: The mock HTML page.
- **Guidance on where to place code**: Keep it simple. Static HTML goes here.

#### Restrictions
- **Guardrails**:
  - "Do not modify this directory": Do not convert this into a single page application or introduce heavy build steps.
