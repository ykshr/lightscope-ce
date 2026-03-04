# @lightscope-ce/web

This is the web frontend for LightScope, built with React and Vite.

## Features

- **Frontend Framework**: React 19 with Vite
- **Styling**: Tailwind CSS 4 with `shadcn/ui` components (Radix UI)
- **Data Fetching**: TanStack Query (React Query) with GraphQL
- **Visualization**: Recharts for charts and D3 for map visualizations
- **Routing**: React Router
- **Internationalization**: `i18n-iso-countries` support

## Getting Started

### Prerequisites

Ensure you have Node.js and npm/yarn/pnpm installed.

### Scripts

- **`npm run dev`**: Starts the development server on port 5173.
- **`npm run build`**: Type-checks and builds the project for production.
- **`npm run preview`**: Previews the production build locally.
- **`npm run lint`**: Runs ESLint to check for code quality issues.
- **`npm run codegen`**: Generates TypeScript types and hooks from GraphQL queries/mutations.

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`.
