# Shadcn UI Upgrade Skill

This skill allows the AI assistant to safely and systematically upgrade Shadcn UI components installed in the `packages/web` workspace of the project.

## Features

- **Check Updates:** Determines which installed components have updates available using `pnpm dlx shadcn add [component-name] --diff`.
- **Apply Updates:** Upgrades specific components.
- **Verification:** Ensures the application still builds, passes tests, and has no linting errors after the update.

## Prerequisites

- The project must use pnpm workspaces and have Shadcn UI configured in `packages/web`.

## Usage

Ask the AI Assistant to upgrade Shadcn components. For example:
- "Can you check if any Shadcn UI components need upgrading?"
- "Please upgrade the Shadcn `button` and `dialog` components and make sure everything still works."
