FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy root package.json and lockfile, as well as workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy package packages/api
COPY packages/api ./packages/api

# Install dependencies
RUN pnpm install --filter @lightscope-ce/api...

# Start dev server
WORKDIR /app/packages/api
CMD sh -c "pnpm run db:push && pnpm dev"
