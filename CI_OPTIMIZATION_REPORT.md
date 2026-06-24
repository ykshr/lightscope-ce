## Executive Summary

* **Current bottlenecks:**
    * Fully sequential execution of formatting, linting, building, and unit testing within a single job.
    * Downloading Playwright browsers on every run without caching.
    * Running potentially slow E2E tests in the same job as the CI checks.
* **Estimated total runtime reduction:** 30-50%
* **Priority ranking:**
    1. Parallelize CI checks (lint, format, test, build).
    2. Cache Playwright browser binaries.
    3. Split E2E tests into a separate dependent job.

## High Impact Optimizations

### Optimization 1: Parallelize CI Jobs

* **Expected improvement:** 30-40% reduction in total time before E2E tests start.
* **Complexity:** Low
* **Risk:** None. These tasks are inherently independent (except potentially build before some tests, but typical setups allow independent runs).
* **Recommendation:** Break out `format`, `lint`, `test`, and `build` into separate jobs or use a build tool like Turborepo. For pure GitHub Actions, parallel jobs are simplest.

```yaml
jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm run format:check
      - run: pnpm run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm run build

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - run: pnpm run test
        env:
          JWT_SECRET: ci-test-secret-do-not-use-in-prod
```

### Optimization 2: Cache Playwright Browsers

* **Expected improvement:** 1-2 minutes per run (skipping ~300MB+ download and extraction).
* **Complexity:** Medium
* **Risk:** Low. If the cache is corrupted or stale, Playwright will fail to find the browser, but the cache key relies on the Playwright version.
* **Recommendation:** Cache the `~/.cache/ms-playwright` directory using the Playwright version as the key.

```yaml
      - name: Get Playwright version
        id: playwright-version
        run: echo "VERSION=$(pnpm --filter @lightscope-ce/e2e exec playwright --version | awk '{print $2}')" >> $GITHUB_ENV

      - name: Cache Playwright Browsers
        uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ env.VERSION }}

      - name: Install Playwright Browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: pnpm --filter @lightscope-ce/e2e exec playwright install --with-deps
```

## Medium Impact Optimizations

### Optimization 3: Split E2E into a separate dependent job

* **Expected improvement:** Better feedback loop. Developers see unit test/lint failures sooner without waiting for the entire E2E setup.
* **Complexity:** Medium
* **Risk:** Low.
* **Recommendation:** Create a separate `e2e` job that `needs: [build, test]`.

```yaml
  e2e:
    needs: [build, test, lint-and-format]
    runs-on: ubuntu-latest
    steps:
       # ... setup steps, playwright cache, and install ...
      - name: Run E2E tests
        run: pnpm run test:e2e
        env: ...
```

## Low Impact Optimizations

### Optimization 4: Optimize pnpm cache action

* **Expected improvement:** Minor (seconds).
* **Complexity:** Low
* **Risk:** Low.
* **Recommendation:** The current setup action manually configures pnpm cache. The `pnpm/action-setup` or `actions/setup-node` can often handle this natively, though the current composite action is decent.

## Proposed Optimized Workflow Architecture

1. **Parallel Static Analysis & Unit Tests:** `lint-and-format`, `test`, and `build` jobs run concurrently.
2. **Dependent E2E:** An `e2e` job depends on the success of the static analysis and unit tests.
3. **Playwright Caching:** The E2E job utilizes caching for Playwright browsers.

## Example Optimized Workflow

```yaml
name: CI & E2E

on:
  pull_request:
    branches: ['main']
    types: [opened, synchronize, reopened]
    paths-ignore:
      - '**/*.md'
      - '**/.gitignore'
      - '.agents/**/*'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node and pnpm
        uses: ./.github/actions/setup
      - name: Run format:check
        run: pnpm run format:check
      - name: Run lint
        run: pnpm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node and pnpm
        uses: ./.github/actions/setup
      - name: Run build (needed for schema/codegen)
        run: pnpm run build
      - name: Run test
        run: pnpm run test
        env:
          JWT_SECRET: ci-test-secret-do-not-use-in-prod

  e2e:
    needs: [lint-and-format, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node and pnpm
        uses: ./.github/actions/setup

      # We need a build before e2e as pretest:e2e builds tracker
      - name: Run build
        run: pnpm run build

      - name: Get Playwright version
        id: playwright-version
        run: echo "VERSION=$(pnpm --filter @lightscope-ce/e2e exec playwright --version | awk '{print $2}')" >> $GITHUB_ENV

      - name: Cache Playwright Browsers
        uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ env.VERSION }}

      - name: Install Playwright Browsers & OS Deps
        run: pnpm --filter @lightscope-ce/e2e exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm run test:e2e
        env:
          JWT_SECRET: ci-test-secret-do-not-use-in-prod
          CLICKHOUSE_USERNAME: lightscope
          CLICKHOUSE_PASSWORD: lightscope
          CLICKHOUSE_DB: lightscope
          CLICKHOUSE_INSERT_BATCH_SIZE: 1
```

*(Note: In a true monorepo, Turborepo (`turbo run test lint build`) is highly recommended to manage these dependencies and cache local builds across jobs, but purely restructuring the workflow provides immediate gains without adopting a new tool).*

## Migration Plan

1. **Implement Playwright caching in the single job.** (Immediate time savings).
2. **Split the single job into parallel jobs (`lint`, `test`, `e2e`).** Note that because it's a monorepo, GraphQL codegen or builds may be required before testing. In the example above, `build` is run inside the `test` and `e2e` jobs to ensure assets are ready.
3. **(Future) Adopt a task runner like Turborepo or Nx.** This would allow a single job to run `turbo run lint format test build e2e` while utilizing remote caching, or simplify the parallel matrix.
