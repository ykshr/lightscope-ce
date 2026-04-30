# @lightscope-ce/api

This package contains the GraphQL API service for LightScope, built with Hono and `@hono/graphql-server`, and connected to ClickHouse for analytics data. It also uses Prisma (with SQLite) and Better Auth for user management.

## Scripts

- `pnpm run dev`: Start the development server using `tsx`.
- `pnpm run build`: Generate the Prisma client and build the project using `tsc`.
- `pnpm run start`: Start the production server from the `dist` directory.
- `pnpm run codegen`: Generate TypeScript types and resolver signatures from the GraphQL schema.
- `pnpm run db:generate`: Generate Better Auth schema and Prisma client (uses `pnpm exec auth generate` and `pnpm exec prisma generate` under the hood).
- `pnpm run db:migrate`: Run Prisma migrations for the local SQLite database.

## Key Technologies

The API package (`packages/api`) uses TypeScript, Hono (`@hono/graphql-server`), ClickHouse, and Prisma (SQLite) with Better Auth for authentication.

- **Hono**: Ultrafast web framework for the Edge.
- **GraphQL Server**: Integration provided by `@hono/graphql-server`.
- **Better Auth**: Authentication framework.
- **Prisma (SQLite)**: ORM for managing users and application metadata.
- **ClickHouse**: Column-oriented database management system for fast analytical queries.
- **GraphQL Codegen**: Tool for generating code from GraphQL schemas.
## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, project structure details, and prohibited patterns. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository. All documentation, including PR comments and generated files, must strictly adhere to the English-only rule.
