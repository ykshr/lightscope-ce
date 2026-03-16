FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install pnpm (match version in package.json)
RUN npm install -g pnpm@10.29.3

# Install Playwright system dependencies
RUN npx playwright install-deps
