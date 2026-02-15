# LightScope

LightScope is a web analytics platform built as a TypeScript monorepo. It features a high-performance analytics engine powered by ClickHouse and a modern React-based dashboard.

## Project Structure

This project uses **npm workspaces** to manage the following packages:

- **packages/web**: Frontend application (React, Vite, TailwindCSS, Recharts).
- **packages/api**: GraphQL API backend (Node.js, Express, Apollo Server, ClickHouse).
- **packages/clickhouse**: ClickHouse database configuration and SQL migrations.
- **packages/script**: Utility scripts.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query.
- **Backend**: Node.js, Express, Apollo Server (GraphQL).
- **Database**: ClickHouse (for high-speed analytics queries).

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm
- ClickHouse server (ensure it is running and configured)

### Installation

Install dependencies from the root directory:

```bash
npm install
```

### Development

You can run the individual packages using their respective dev scripts.

**Start the API:**

```bash
cd packages/api
npm run dev
```

**Start the Frontend:**

```bash
cd packages/web
npm run dev
```

## License

Private
