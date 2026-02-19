# Public Release Tasks

This document outlines the tasks required to prepare `lightscope-ce` for public release.

## 1. Environment Configuration (Highest Priority)

- [ ] **Create `.env.example`**
  - Create a template for environment variables in the project root.
  - Include variables for API, ClickHouse, Web Client, and E2E tests.
  - **Context:** Currently, new users don't know which variables are required to start the application.

## 2. Documentation Expansion

- [ ] **Update `README.md`**
  - Add comprehensive sections:
    - Installation & Setup
    - Configuration Options
    - Architecture Overview
    - Deployment Guide
- [ ] **Licensing**
  - Add a `LICENSE` file (e.g., MIT, Apache 2.0).
  - Update the `license` field in all `package.json` files (currently set to "Private").

## 3. Package Metadata Update

- [ ] **Update `package.json` Metadata**
  - Review and update `version` (currently 0.0.0/0.0.1), `description`, and `repository` fields for:
    - Root
    - `packages/api`
    - `packages/web`
    - `packages/clickhouse`
    - `packages/script`

## 4. Security and Configuration Review

- [ ] **Secure ClickHouse Credentials**
  - **Issue:** Credentials (`user: lightscope`, `password: lightscope`) are hardcoded in `packages/clickhouse/users.d/littlescope.xml`.
  - **Action:** Refactor to use environment variables or document explicitly how users should change these credentials.

## 5. Code Cleanup

- [ ] **Resolve TODOs**
  - `packages/web/src/components/tables/ArticleTable.tsx`: Resolve `TODO: get total count from API`.

## 6. Release Verification

- [ ] **Smoke Testing**
  - Perform a full production build (`pnpm run build`).
  - Verify the artifact runs correctly in a clean environment.
