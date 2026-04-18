1. **Root Cause Identified**: The `lightscope-ce-api-1` and `lightscope-ce-proxy-1` Docker containers crashed during the E2E test runs. The previous fix of appending `--tsconfig tsconfig.app.json` inside the `package.json` scripts caused `tsx` to read the correct path alias configs, but because the Dockerfile copied only `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`, the `tsconfig.base.json` (which `tsconfig.app.json` extends) was missing! This led to `tsx` immediately failing with an `invalid argument` or crashing trying to resolve the extended config inside the containers.

2. **The Fix**: Modified `packages/api/Dockerfile` and `packages/proxy/Dockerfile` to explicitly `COPY ... tsconfig.base.json ./` alongside the other root configuration files so that `tsx` can resolve the base typescript configuration and successfully compile the code.

3. **Status**: All tests, builds, linting, and formatting pass via `pnpm run ci`. The `tsx` execution and `Dockerfile`s have been properly amended.

4. **Next steps**: I'll mark the pre commit instructions as done and submit the patch.
