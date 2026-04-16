# AGENTS.md (web)

Stack:
- React 19
- Vite
- TanStack React Query v5
- GraphQL Codegen
- Tailwind v4
- shadcn/ui
- Radix UI
- Recharts
- Vitest

---

All `AGENTS.md` files in the repository must be structured with four specific English headers: `#### Coding Conventions`, `#### Build & Test Commands`, `#### Project Structure`, and `#### Restrictions`.

#### Coding Conventions
- **Rules for indentation**: Use 2 spaces for indentation (Prettier standard).
- **Naming conventions**: `camelCase` for variables/functions, `PascalCase` for React components.
- **Restrictions on libraries that should or should not be used**: Do not introduce libraries like `axios`, `redux`, or `zustand`. Use `fetch` and TanStack Query. Icons in the `packages/web` frontend application are implemented using the `@phosphor-icons/react` library. Ensure any new icon additions import from this package.
- **Type Safety**: The `packages/web` codebase strictly avoids `@typescript-eslint/no-explicit-any`; prefer `unknown`, `Record<string, unknown>`, or specifically defined interfaces and types over `any`.
- **Data Fetching Rules**:
  - Always use the generated GraphQL hooks (`useQuery`, `useMutation`).
  - Avoid using manual `fetch` or introducing libraries like `axios`. When modifying fetcher utility or hook error handling, always evaluate GraphQL errors (e.g., checking `json.errors`) independently from HTTP network errors (e.g., `!res.ok`), as GraphQL APIs typically return a `200 OK` status even when logical errors occur.
  - User organization data is queried using the `authClient` from `@/helpers/auth`, specifically via the `authClient.useListOrganizations()` hook or the async `authClient.organization.list()` method.
- **State Management**:
  - Use React Query for managing server state.
  - Avoid introducing custom global stores, Redux, or Zustand.
- **UI and Styling Rules**:
  - Use `shadcn/ui` primitive components whenever possible.
  - Codebase convention for `packages/web` components is to use clean no-op functions `() => {}` for optional callback props' default values, ensuring no debug logging (e.g., `console.log`) remains in production code.
  - Constants and helper functions should be extracted to separate files (e.g., `src/helpers/constants/`) to prevent `react-refresh/only-export-components` ESLint warnings in component files.
  - Use only Tailwind v4 utility classes for styling. Avoid custom CSS files or inline styles.
  - Maintain consistency with existing components and keep the added `className` props to a minimum.
  - The custom `DialogContent` component in `packages/web/src/components/ui/dialog.tsx` supports a boolean `showCloseButton` prop to optionally show or hide the default Radix close icon.
- **Performance**:
  - Analytics dashboards can become heavy. Do not execute intensive aggregation processing during rendering. Rely on the backend (ClickHouse) for aggregations. If necessary, use `useMemo` to memoize heavy data transformations.
  - Performance optimization of array filtering and grouping in hot paths (e.g., loaders, utilities) can be achieved by replacing nested `.filter()` loops or `.filter(Boolean).map(...)` chains with a single-pass `for...of` loop and `Map` accumulation. This eliminates intermediate array allocations and reduces time complexity from O(n^2) to O(n).
  - When refactoring array iterations that generate indexed keys (e.g., `param_${i}`), ensure the new logic maintains the original indexing by using the result array's current length or a manual counter to avoid breaking query parameter references.

#### Build & Test Commands
- **How to build the project**:
  ```bash
  pnpm --filter @lightscope-ce/web run build
  ```
  To build or test the web frontend (`packages/web`), use the workspace commands `pnpm --filter @lightscope-ce/web run build` and `pnpm --filter @lightscope-ce/web run test` respectively.
- **How to run tests (commands and steps)**:
  ```bash
  pnpm --filter @lightscope-ce/web run test
  ```
- **Start Development Server**:
  ```bash
  pnpm --filter @lightscope-ce/web run dev
  ```
  *(Note: In the web package (`packages/web`), the Vite development server is configured to run on port `3000` by default. When writing frontend verification scripts (e.g., Playwright screenshots), point the browser to `http://localhost:3000` instead of the Vite default port 5173. The web package's `test:integration` script uses Docker Compose to run the Vite dev server on port 3000 and executes tests using Vitest. Due to Vite's SPA fallback, the dev server returns `index.html` (200 OK) for all unrecognized GET requests, including non-existent file paths. Unsupported methods like POST/PUT/DELETE return 404, while OPTIONS returns 204.)*
- **Generate GraphQL Code (React Query hooks)**:
  ```bash
  pnpm --filter @lightscope-ce/web run codegen
  ```

#### Project Structure
- **Explanation of key directories**:
- `src/components/`: Reusable UI components (including `shadcn/ui`). The charting components in `packages/web/src/components/charts/` are structured with main components (e.g., `ArticleAreaStacked.tsx`) utilizing reusable templates in the `templates/` directory and data processing logic in the `helpers/` directory.
- `src/pages/`: Page components corresponding to routes.
- `src/helpers/`: Utility functions and authentication (`better-auth` client). In `packages/web/src/helpers/date.ts`, while `dayjs` is used for formatting, arithmetic utilities like `getPreviousDates`, `getTimeBetween`, and `getPastDate` are implemented using native JavaScript `Date` objects for broader compatibility and easier verification in restricted environments. When configuring frontend `better-auth` plugins (like `organizationClient()`) in `packages/web/src/helpers/auth.ts`, ensure the corresponding backend plugin (e.g., `organization()`) is actively configured in the API (`packages/api/src/helpers/auth.ts`) to avoid 404 API errors.
- `src/hooks/`: Custom hooks and hooks generated by GraphQL Codegen.
- **Guidance on where to place different types of code**: Place standard React component logic inside `src/components/` and define unique views per route in `src/pages/`. Use `src/hooks/` for generic abstractions.
  - Unit and integration tests go in `tests/unit/` and `tests/integration/` respectively.

#### Restrictions
- **Guardrails**:
  - "Do not edit this file directly": Do not modify hooks inside `src/hooks/__generated__/` directly as they are generated by graphql-codegen.
- **Testing**:
  - Use Vitest and Testing Library.
  - The `Filter.tsx` template in `packages/web/src/components/charts/templates/` lacks dedicated unit tests; verification should involve inspecting parent components like `ArticleAreaStacked.tsx` or using manual checks.
  - In the `packages/web` test suite, the `formatDate` helper (using `dayjs` with format `'YYYY-MM-DDTHH:mm[Z]'`) has been observed to omit the literal 'Z' in some CI environments (returning `YYYY-MM-DDTHH:mm`), necessitating test assertions to be updated to match the received output.
  - In Vitest testing environments, use `globalThis.fetch` rather than `global.fetch`. When mocking the global fetch API, use `vi.stubGlobal('fetch', vi.fn())` or `vi.spyOn(globalThis, 'fetch')` rather than direct assignment (`globalThis.fetch = vi.fn()`) to ensure proper isolation and reset behavior across tests.
  - Avoid full DOM mocking unless absolutely necessary.

  - "Do not modify this directory": Maintain the existing directory boundaries and responsibilities.