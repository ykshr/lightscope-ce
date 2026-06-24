## Executive Summary

* **Current bottlenecks:**
    * Fully sequential execution of formatting, linting, building, and unit testing within a single job.
    * Downloading Playwright browsers on every run without caching.
    * Running a full, heavy application build (`vite build` & `tsc`) before running unit tests, which only strictly require generated GraphQL schemas.
    * Running potentially slow E2E tests in the same job as the CI checks.
* **Estimated total runtime reduction:** 30-50%
* **Priority ranking:**
    1. Parallelize CI checks (lint, format, test, e2e).
    2. Optimize test dependencies (replace full build with schema generation).
    3. Cache Playwright browser binaries.

## High Impact Optimizations

### Optimization 1: Parallelize CI Jobs

* **Expected improvement:** 30-40% reduction in total time before E2E tests start.
* **Complexity:** Low
* **Risk:** None.
* **Recommendation:** Break out `format`, `lint`, `test`, and `e2e` into separate parallel jobs.

### Optimization 2: Avoid Redundant Builds for Unit Tests

* **Expected improvement:** ~1 minute per run.
* **Complexity:** Low
* **Risk:** Low. Vitest processes TypeScript natively, so a full build is redundant.
* **Recommendation:** Replace `pnpm run build` in the test job with targeted `codegen` commands to only generate necessary GraphQL schemas.

```yaml
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup
      - name: Generate Schemas
        run: pnpm --filter @lightscope-ce/api run codegen && pnpm --filter @lightscope-ce/web run codegen
      - name: Run test
        run: pnpm run test
```

### Optimization 3: Cache Playwright Browsers

* **Expected improvement:** 1-2 minutes per run (skipping ~300MB+ download and extraction).
* **Complexity:** Medium
* **Risk:** Low. Playwright natively skips browser downloads if the binaries are present in the cache, but `install --with-deps` must still run without conditional blocks to ensure OS dependencies (like `libnss3`) are installed on fresh runners.
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
        run: pnpm --filter @lightscope-ce/e2e exec playwright install --with-deps
```

## Medium Impact Optimizations

### Optimization 4: Split E2E into a separate dependent job

* **Expected improvement:** Better feedback loop. Developers see unit test/lint failures sooner.
* **Complexity:** Low
* **Risk:** Low.
* **Recommendation:** Create a separate `e2e` job that `needs: [lint-and-format, test]`.

## Low Impact Optimizations

### Optimization 5: Optimize pnpm cache action

* **Expected improvement:** Minor (seconds).
* **Complexity:** Low
* **Risk:** Low.
* **Recommendation:** Remove redundant custom cache logic in the composite setup action, as `actions/setup-node` handles `cache: 'pnpm'` natively.

## Proposed Optimized Workflow Architecture

1. **Parallel Jobs:** `lint-and-format` and `test` jobs run concurrently.
2. **Optimized Test Data:** The `test` job only generates schemas (`codegen`) instead of running a full Vite/TypeScript build.
3. **Dependent E2E:** An `e2e` job depends on the success of the static analysis and unit tests, and performs the only full build.
4. **Playwright Caching:** The E2E job utilizes caching for Playwright binaries.

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
      - name: Generate Schemas
        run: pnpm --filter @lightscope-ce/api run codegen && pnpm --filter @lightscope-ce/web run codegen
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
      - name: Install Playwright Browsers
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

## Migration Plan

1. **Implement Playwright and native pnpm caching.**
2. **Split the single workflow into three parallel jobs (`lint-and-format`, `test`, `e2e`).**
3. **Refactor the `test` job to only run `codegen` instead of `build`.**
4. **(Future) Adopt a task runner like Turborepo or Nx.** This would allow shared caching across local and remote environments.
