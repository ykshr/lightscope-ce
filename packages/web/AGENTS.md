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
* Rules for indentation
  - Use 2 spaces for indentation (Prettier standard).
* Naming conventions
  - `camelCase` for variables/functions, `PascalCase` for React components.
* Restrictions on libraries that should or should not be used
  - Do not introduce libraries like `axios`, `redux`, or `zustand`. Use `fetch` and TanStack Query.
  - **Type Safety**: The `packages/web` codebase strictly avoids `@typescript-eslint/no-explicit-any`; prefer `unknown`, `Record<string, unknown>`, or specifically defined interfaces and types over `any`.
    - The `FilterToQuery` type in `packages/web/src/types/filter.ts` requires mandatory `startDate` and `endDate` fields; utility functions and unit tests (e.g., `category.test.ts`, `metric.test.ts`) using this type must provide valid `Date` objects to avoid TypeScript compilation errors.
  - **Data Fetching Rules**:
    - Always use the generated GraphQL hooks (`useQuery`, `useMutation`).
    - Avoid using manual `fetch` or introducing libraries like `axios`. When modifying fetcher utility or hook error handling, always evaluate GraphQL errors (e.g., checking `json.errors`) independently from HTTP network errors (e.g., `!res.ok`), as GraphQL APIs typically return a `200 OK` status even when logical errors occur.
  - **State Management**:
    - Use React Query for managing server state.
    - Avoid introducing custom global stores, Redux, or Zustand.

  - **Component & Helper Rules**:
    - When building custom input components in `packages/web/src/components/inputs/` (like `TagInput` or `LogicalInput`), ensure screen reader accessibility by using React's `useId()` hook to generate a unique ID, applying it to the `<input id={id}>` and linking it to the corresponding label via `<Label htmlFor={id}>`.
    - In `packages/web/src/helpers/`, the `category.ts` and `metric.ts` utilities transform `FilterToQuery` objects into `CategoryVariables` and `MetricVariables` respectively; these explicit return types are used to maintain type safety and eliminate `as any` assertions in the `ArticleAreaStacked` component.
    - React components in `packages/web` (such as `useProcessData` hooks) must compute derived state synchronously during render using `useMemo` rather than managing it with `useState` combined with `useEffect`, in order to eliminate unnecessary double re-renders when data props change.
    - The `findCategoryOptionByValue` and `findSortOptionByValue` helpers in `packages/web/src/helpers/constants/` identify matches using key filtering and order-insensitive array comparison; they utilize a `preprocessedOptions` constant to pre-calculate sorted keys/values and a `Map` for memoizing sorted input arrays to avoid redundant O(N log N) sorting and memory allocations in the search loops. For performance optimizations involving membership checks inside iteration loops, precompute a `Set` from the target array and use `Set.has()` instead of `Array.prototype.includes()` to achieve O(1) lookup time.
    - In charting components processing multiple parallel trend datasets, minimize redundant `new Date()` parsing and string operations by memoizing formatted strings in a local cache map within the `useMemo` block.
    - The `ChartStyle` component in `packages/web/src/components/ui/chart.tsx` mitigates XSS vulnerabilities within `dangerouslySetInnerHTML` by sanitizing CSS identifiers (ids and config keys) with `sanitizeCSSIdentifier` (restricting to `[a-zA-Z0-9-_]+`) and CSS values (colors) with `sanitizeCSSValue` (stripping `<>{};` to prevent tag breakout and declaration injection). Ensure `sanitizeCSSValue` does not strip parentheses `()` to avoid breaking standard CSS functions like `rgba()`.

  - **UI and Styling Rules**:

    - **Accessibility**:
      - The established pattern for providing accessible names to icon-only buttons (such as close or clear buttons) is to nest a `<span className="sr-only">` inside the button containing the text, rather than using the `aria-label` attribute directly on the button component. Avoid using `aria-label` on buttons that already contain clear, descriptive visible text, as the `aria-label` attribute redundantly overrides the visible text for assistive technologies.
      - When adding `aria-label` attributes to elements with existing visible text (such as stateful toggle buttons), ensure the `aria-label` describes both the action and the current state (e.g., 'Change logical operator (currently AND)'), because the `aria-label` completely overrides the visible text for assistive technologies.

    - Use `shadcn/ui` primitive components whenever possible.
    - When modifying shadcn/ui components like `Button` that support the `asChild` pattern via Radix UI's `Slot`, use `<Slottable>` around `{children}` if inserting sibling elements (like a loading `<Spinner />`). Otherwise, the `asChild` composition delegation will break.


    - To safely upgrade shadcn/ui components in `packages/web`, be aware that running `pnpm dlx shadcn add [component]` may generate files in a literal `@/components/ui/` folder due to path aliases rather than directly updating `src/components/ui/`. Use standard `diff -u` between these directories to check for local customizations or visual regressions. If an update is unsafe, skip it and prepend a `/** UPDATE SKIPPED ... */` comment block detailing the reason and upstream changes. Check update feasibility with `pnpm dlx shadcn add [component-name] --diff` and apply updates using `pnpm dlx shadcn add [component-name] -o`.

    - Use only Tailwind v4 utility classes for styling. Avoid custom CSS files or inline styles.
    - Constants and helper functions should be extracted to separate files (e.g., `src/helpers/constants/`) to prevent `react-refresh/only-export-components` ESLint warnings in component files.
    - Maintain consistency with existing components and keep the added `className` props to a minimum.
    - For client-side navigation, use semantic `<Link>` components from `react-router-dom` rather than `<button>` elements with `onClick={() => navigate(...)}` to ensure accessibility (screen reader compatibility, middle-click to open in new tab).
    - Buttons triggering asynchronous operations must provide visual feedback by passing the `isLoading={true}` prop to the central `@/components/ui/button` component, which centrally handles rendering the `Spinner` and managing the disabled state, rather than manually inserting `<Spinner />` elements across pages. For specific cases (like deletions that follow a native confirmation dialog), ensure this loading state prevents user anxiety.
  - **Performance**:
    - Analytics dashboards can become heavy. Do not execute intensive aggregation processing during rendering. Rely on the backend (ClickHouse) for aggregations. If necessary, use `useMemo` to memoize heavy data transformations.
    - To maintain optimal frontend bundle sizes, page components in `App.tsx` must be lazy-loaded using `React.lazy()` and `<Suspense>`, and large third-party dependencies should be explicitly separated into groups (e.g., `vendor`, `ui`, `charts`) using `manualChunks` in `vite.config.ts`.

#### Build & Test Commands
* How to build the project
  - ```bash
  pnpm --filter @lightscope-ce/web run build
  ```
  - To build or test the web frontend (`packages/web`), use the workspace commands `pnpm --filter @lightscope-ce/web run build` and `pnpm --filter @lightscope-ce/web run test` respectively.
  - Code generation must be handled prior to compilation (e.g., `"build": "pnpm run codegen && tsc -b && vite build"`). The GraphQL codegen directly depends on schema definitions generated by `packages/api` (`../api/src/__generated__/graphql/typeDefs.ts`). To ensure `pnpm` builds them in the correct order during recursive builds, `@lightscope-ce/api` must be explicitly listed as a `workspace:*` dependency in `packages/web/package.json`. If `pnpm --filter @lightscope-ce/web run codegen` fails with a 'Failed to load schema' error, run `pnpm --filter @lightscope-ce/api run codegen` first to generate the required schema.
* How to run tests (commands and steps)
  - **Test Definitions**: Unit tests are function-level without package startup. Integration tests are package-level, requiring only the target package to be started with external dependencies mocked/stubbed. E2E tests are fully integrated tests requiring all packages to be started to cover comprehensive user journeys and data flows.
  - The `test:integration` script uses Docker Compose to run the Vite dev server on port 3000 and executes tests using Vitest. Due to Vite's SPA fallback, the dev server returns `index.html` (200 OK) for all unrecognized GET requests, including non-existent file paths. Unsupported methods like POST/PUT/DELETE return 404, while OPTIONS returns 204.
  ```bash
  pnpm --filter @lightscope-ce/web run test
  ```
  - **Start Development Server**:
  ```bash
  pnpm --filter @lightscope-ce/web run dev
  ```
  - **Generate GraphQL Code (React Query hooks)**:
  ```bash
  pnpm --filter @lightscope-ce/web run codegen
  ```

#### Project Structure
* Explanation of key directories
  - `src/components/`: Reusable UI components (including `shadcn/ui`). The charting components in `packages/web/src/components/charts/` are structured with main components (e.g., `ArticleAreaStacked.tsx`) utilizing reusable templates in the `templates/` directory and data processing logic in the `helpers/` directory.
  - `src/pages/`: Page components corresponding to routes.
  - `src/helpers/`: Utility functions and authentication (`better-auth` client).
  - `src/hooks/`: Custom hooks and hooks generated by GraphQL Codegen.
* Guidance on where to place different types of code
  - Place standard React component logic inside `src/components/` and define unique views per route in `src/pages/`. Use `src/hooks/` for generic abstractions.
  - Unit and integration tests go in `tests/unit/` and `tests/integration/` respectively.
  - Unit tests for constant helpers (e.g., source in `src/helpers/constants/`) are organized within `tests/unit/helpers/constants/` to maintain a directory structure parallel to the source files.

#### Restrictions
* Guardrails such as:
  * “Do not edit this file directly”
    - Do not modify hooks inside `src/hooks/__generated__/` directly as they are generated by graphql-codegen.
  * “Do not modify this directory”
    - Maintain the existing directory boundaries and responsibilities.
    - Do not modify files under `packages/web/src/components/ui` as they are managed by shadcn/ui.
  - **Testing**:
    - Use Vitest and Testing Library.
    - Avoid full DOM mocking unless absolutely necessary.
