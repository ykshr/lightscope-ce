# LightScope CE - App Release Tasks

Based on a review of the current project state, here is a list of remaining tasks required to prepare the application for a public release.

## 1. Type Safety & Linting Improvements
The codebase currently has numerous ESLint warnings (39 warnings in `packages/web`) mostly related to `@typescript-eslint/no-explicit-any` and `react-refresh/only-export-components`.
- **Task:** Resolve all `any` types across the `packages/web` application. Use strict typing for GraphQL responses and internal component state.
  - *Target Files:* `packages/web/src/components/charts/helpers/useProcessData.tsx`, `packages/web/src/components/maps/MapCountry.tsx`, etc.
- **Task:** Fix Fast Refresh warnings by extracting constants/functions from component files.
  - *Target Files:* `packages/web/src/components/charts/templates/Filter.tsx`, `packages/web/src/components/filters/DateFilter.tsx`, `packages/web/src/components/tables/templates/Sort.tsx`.
- **Task:** Fix `react-hooks/exhaustive-deps` warning in `MapCountry.tsx`.

## 2. Dynamic Data Integration
There are pages currently using hardcoded sample data that need to be connected to the actual API.
- **Task:** Replace `SAMPLE_ARTICLE` in `packages/web/src/pages/article/index.tsx` with actual data fetched from the API (likely via GraphQL).

## 3. Review Generated Files & TODOs
- **Task:** Review the `TODO` comments present in the auto-generated Prisma client files (`packages/api/src/__generated__/prisma/runtime/client.d.ts`). While these files should not be edited directly, verify that there are no underlying schema or configuration issues causing these warnings.

## 4. Security & Performance Optimization
- **Task:** Perform a final security audit. Ensure environment variables (`ALLOWED_ORIGINS`, `JWT_SECRET`, `DATABASE_URL`, etc.) are securely and correctly configured for production, with no reliance on hardcoded fallback values.
- **Task:** Optimize the frontend bundle size. The Vite build output currently warns about chunks larger than 500kB. Implement code-splitting using `dynamic import()` or configure `manualChunks` to improve initial load performance.

## 5. Deployment Environment Configuration
Ensure the infrastructure and CI/CD settings are robust for a secure production deployment.
- **Task:** Review and finalize the production environment variables (e.g., strictly defining `ALLOWED_ORIGINS` for API and Proxy CORS).
- **Task:** Verify and expand the deployment pipeline. The current `ci.yml` handles testing and building, but deployment steps (CD) should be configured if necessary.
- **Task:** Verify that the built assets in `packages/web/dist` are served securely and efficiently in a production environment (e.g., configuring Nginx or a CDN).

## 6. Increase Test Coverage
- **Task:** Increase code coverage. Although current tests pass in CI, add missing unit and integration tests, particularly for frontend components.
- **Task:** Expand E2E test scenarios using Playwright. Ensure all critical user paths are covered, including authentication flows, data ingestion processes, and dashboard visualizations.

## 7. Documentation Updates
- **Task:** Update `README.md` to include comprehensive instructions for production deployment, expanding beyond the current local Docker Compose setup.
