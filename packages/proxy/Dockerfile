FROM node:22-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy root package.json and lockfile, as well as workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy package packages/proxy
COPY packages/proxy ./packages/proxy

# Install dependencies
RUN pnpm install --filter @lightscope-ce/proxy...

# Start dev server
WORKDIR /app/packages/proxy
CMD sh -c "pnpm dev"
