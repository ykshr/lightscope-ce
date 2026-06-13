ARG NODE_VERSION="22-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${NODE_VERSION}

# Enable Corepack to automatically use the pnpm version defined in package.json's packageManager field
RUN corepack enable pnpm
