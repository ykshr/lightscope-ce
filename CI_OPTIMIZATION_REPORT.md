# CI Optimization Report

## Executive Summary

The current CI workflow (`.github/workflows/ci.yml`) is functional but contains several inefficiencies that increase the overall execution time.

### Current Bottlenecks
1. **Sequential Job Execution:** The `e2e` job explicitly waits for `lint-and-format` and `test` jobs (`needs: [lint-and-format, test]`), artificially delaying the start of the longest-running process (E2E tests).
2. **Duplicate Builds:** The `e2e` job runs `pnpm run build` on the host runner, but then executes `pnpm run test:e2e`, which internally runs `docker compose up --build`. This means the application is built twice: once on the host and once inside Docker.
3. **Missing E2E Sharding:** Playwright tests are currently run sequentially within a single worker environment because there is no sharding configured for GitHub Actions, leading to slower execution times as the test suite grows.

### Estimated total runtime reduction
By parallelizing the E2E job and removing the duplicate host build, we estimate a **40-60% reduction** in total CI wall-clock time, depending on the current duration of the E2E tests and Docker build.

### Priority Ranking
1. **High:** Parallelize job execution (`e2e` job).
2. **High:** Remove duplicate host build step in `e2e`.
3. **Medium:** Implement Playwright test sharding.
4. **Low:** Optimize Docker layer caching for `test:e2e`.

---

## High Impact Optimizations

### Optimization 1: Parallelize Job Execution

* **Expected improvement:** Significant reduction in overall workflow duration (saves the time it takes for linting, formatting, and unit tests).
* **Complexity:** Low
* **Risk:** Low. Jobs are independent and do not rely on artifacts from one another.
* **Recommendation:** Remove the `needs: [lint-and-format, test]` directive from the `e2e` job.

```yaml
# Current:
  e2e:
    needs: [lint-and-format, test]
    runs-on: ubuntu-latest

# Proposed:
  e2e:
    runs-on: ubuntu-latest
```

### Optimization 2: Remove Duplicate Host Build

* **Expected improvement:** Saves the time it takes to run `pnpm run build` in the monorepo prior to running the E2E script.
* **Complexity:** Low
* **Risk:** Low. The `test:e2e` script uses `docker-compose.e2e.yml` to build the required images. The host build is redundant.
* **Recommendation:** Remove the `pnpm run build` step from the `e2e` job.

```yaml
# Current:
      - name: Setup Node and pnpm
        uses: ./.github/actions/setup

      - name: Run build
        run: pnpm run build

# Proposed:
      - name: Setup Node and pnpm
        uses: ./.github/actions/setup
```

---

## Medium Impact Optimizations

### Optimization 3: Implement Playwright Test Sharding

* **Expected improvement:** Linear scaling of E2E test execution time based on the number of shards.
* **Complexity:** Medium (Requires matrix strategy in GitHub Actions).
* **Risk:** Low to Medium. Requires ensuring test independence and combining test reports/artifacts after all shards complete.
* **Recommendation:** Use a matrix strategy to split the E2E tests into multiple jobs (e.g., 3 shards). Note: We are not implementing this in the immediate refactor to keep the workflow simple and maintainable, but it is highly recommended as the test suite grows.

```yaml
  e2e:
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3]
        shardTotal: [3]
    steps:
      # ... setup ...
      - name: Run E2E tests
        run: pnpm run test:e2e --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

---

## Low Impact Optimizations

### Optimization 4: Docker Layer Caching for E2E Services

* **Expected improvement:** Faster `docker compose up --build` execution during `test:e2e`.
* **Complexity:** High (Requires setting up `docker/setup-buildx-action` and `actions/cache` for Docker layers).
* **Risk:** Medium. Can be complex to configure correctly in a monorepo with multiple Dockerfiles.
* **Recommendation:** If the Docker build step within `test:e2e` becomes a significant bottleneck, introduce GitHub Actions cache for Docker buildx.

---

## Notes on Current Optimizations (Working Well)

* **Playwright Caching:** The workflow correctly caches `~/.cache/ms-playwright` and runs `playwright install --with-deps` unconditionally. This aligns with best practices, allowing Playwright to skip downloading browser binaries if cached, while ensuring required OS-level dependencies are always installed.
* **Dependency Management:** The `Setup Node and pnpm` composite action correctly uses `actions/setup-node@v4` with `cache: 'pnpm'`. It avoids redundant `actions/cache` steps for the pnpm store, which is the recommended approach.
* **API/Web Codegen:** The `test` job correctly runs `pnpm --filter ... run codegen` instead of a full monorepo build, which saves significant time.

---

## Proposed Optimized Workflow Architecture

The optimized architecture runs all three main jobs (`lint-and-format`, `test`, `e2e`) in parallel immediately when a Pull Request is opened or synchronized.
* `lint-and-format`: Checks code style and static analysis.
* `test`: Runs unit/integration tests after generating necessary GraphQL schemas.
* `e2e`: Sets up the environment (using Docker) and runs Playwright tests without waiting for the other jobs and without pre-building the monorepo on the host.

---

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
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node and pnpm
        uses: ./.github/actions/setup

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
          PROXY_CORS_ALLOW_HEADERS: Content-Type,Authorization,X-Forwarded-For
```

---

## Migration Plan

1. **Step 1: Unblock and Remove Duplicate Work (High Impact - Implemented in this PR)**
   - Remove `needs: [lint-and-format, test]` from the `e2e` job in `.github/workflows/ci.yml`.
   - Remove the `pnpm run build` step from the `e2e` job.
   - *Expected gain:* Massive reduction in wall-clock time by parallelizing the longest job and removing a 30-90s duplicate build step.
2. **Step 2: Monitor and Evaluate**
   - Merge these changes and observe the execution time of the E2E job in main.
3. **Step 3: Implement Sharding (Future Enhancement)**
   - If the E2E job still takes >10 minutes, implement the Playwright Matrix sharding outlined in Optimization 3.
