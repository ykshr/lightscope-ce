# @lightscope-ce/tracker

This package contains the client-side analytics embed script for LightScope CE.

The tracker package (`packages/tracker`) is performance-critical and size-sensitive. It must not include heavy dependencies, React, or large libraries, and must maintain compatibility with browser environments by relying on globals like `window`, `document`, and `navigator`.

## Scripts

- `pnpm run build`: Build the project (including TypeScript type checking) using `tsc`.
- `pnpm run build:browser`: Bundle the script for the browser using `esbuild`. The output is generated in `dist/browser.js`.

## Features

- Lightweight, dependency-free client-side script.
- Captures page views, custom events, and performance metrics.
- Bundled specifically for browser execution without heavy Node.js built-ins.

## Testing

In network-restricted or dependency-missing environments, `bun test` can be used as a fallback test runner for the tracker. To satisfy imports like `ua-parser-js`, a local `node_modules` shim (containing a minimal `index.js` and `package.json`) can be created temporarily to bypass missing installation artifacts.

## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure details, and prohibited patterns. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository.


*Note: All documentation must be written in **English**.*
