# @lightscope-ce/proxy

This package contains the REST API service for LightScope, primarily responsible for high-performance event ingestion from trackers. It is built with Hono and connected directly to ClickHouse.

## Scripts

- `npm run dev`: Start the development server using `tsx`.
- `npm run build`: Build the project using `tsc`.
- `npm run start`: Start the production server from the `dist` directory.

## Key Technologies

- **Hono**: Ultrafast web framework for the Edge.
- **ClickHouse**: Column-oriented database management system for fast analytical queries.
- **Zod**: TypeScript-first schema validation with static type inference.
- **MaxMind**: Used for IP geolocation.