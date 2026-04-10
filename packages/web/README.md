# @lightscope-ce/web

This is the web frontend for LightScope, built with React and Vite.

The Web package (`packages/web`) is built with React 19, Vite, Tailwind CSS v4, and TanStack React Query v5.

## Features

- **Frontend Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4 with `shadcn/ui` components (Radix UI)
- **Data Fetching**: TanStack Query (React Query v5) with GraphQL
- **Visualization**: Recharts for charts and D3 for map visualizations
- **Routing**: React Router
- **Internationalization**: `i18n-iso-countries` support

## Getting Started

### Prerequisites

Ensure you have Node.js and pnpm installed. It is recommended to run commands from the monorepo root.

### Scripts

Run these from the `packages/web` directory, or use `pnpm --filter @lightscope-ce/web run <script>` from the root:

- `pnpm run dev`: Starts the Vite development server on port 3000.
- `pnpm run build`: Type-checks and builds the project for production.
- `pnpm run preview`: Previews the production build locally.
- `pnpm run lint`: Runs ESLint to check for code quality issues.
- `pnpm run codegen`: Generates TypeScript types and React Query hooks from GraphQL queries/mutations.
- `pnpm run test`: Runs the Vitest test suite.

## Development

1. Install dependencies from the root:
   ```bash
   pnpm install
   ```

2. Start the development server from the root:
   ```bash
   pnpm --filter @lightscope-ce/web run dev
   ```

3. Open your browser at `http://localhost:3000`.
## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure details, and prohibited patterns. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository.
