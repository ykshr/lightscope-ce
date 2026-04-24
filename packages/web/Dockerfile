FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy root package.json and lockfile, as well as workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy package.json for caching
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN pnpm install --filter @lightscope-ce/web...

# Copy package source
COPY packages/web ./packages/web

# Start dev server
WORKDIR /app/packages/web
CMD sh -c "pnpm dev --host"
