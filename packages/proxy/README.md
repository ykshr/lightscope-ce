# @lightscope-ce/proxy

The Proxy package (`packages/proxy`) is a high-performance REST API built with Node.js and Hono, responsible for event ingestion from trackers and connected directly to ClickHouse.

## Scripts

- `pnpm run dev`: Start the development server using `tsx`.
- `pnpm run build`: Build the project using `tsc`.
- `pnpm run start`: Start the production server from the `dist` directory.

## Key Technologies

- **Hono**: Ultrafast web framework for the Edge.
- **ClickHouse**: Column-oriented database management system for fast analytical queries.
- **Zod**: TypeScript-first schema validation with static type inference.
- **MaxMind**: Used for IP geolocation.
## Contributing

Please read the `AGENTS.md` files located in the root directory and inside each package's directory for coding conventions, test execution commands, and project structure rules. The AI rules outlined in `AGENTS.md` must be followed when contributing to the repository. All documentation, including PR comments and generated files, must strictly adhere to the English-only rule.
