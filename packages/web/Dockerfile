FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy root package.json and lockfile, as well as workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package packages/web
COPY packages/web ./packages/web

# Install dependencies
RUN pnpm install --filter @lightscope-ce/web...

# Start dev server
WORKDIR /app/packages/web
CMD sh -c "pnpm dev --host"
