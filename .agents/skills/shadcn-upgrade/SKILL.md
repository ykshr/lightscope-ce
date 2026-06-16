---
name: shadcn-upgrade
description: A skill to check for and apply updates to shadcn ui components in the packages/web workspace. It verifies that features and layouts are maintained after the update.
---

# Shadcn UI Upgrade Skill

This skill is designed to help users upgrade Shadcn UI components in the `packages/web` package.

## 🎯 Your Objective

When a user asks to upgrade Shadcn UI components, your goal is to:
1.  **Identify installed components:** Figure out which components are currently installed in `packages/web/src/components/ui`.
2.  **Check for updates:** Use the Shadcn CLI to see if there are newer versions of the installed components.
3.  **Perform the upgrade:** If requested, or if the user asked for a general upgrade and updates are available, apply the updates.
4.  **Verify:** Crucially, ensure that the project still builds, tests pass, and linting is clean after the upgrade. If a visual or functional test is possible (e.g., via Playwright or just starting the dev server and ensuring it doesn't crash), do that as well.

## 🛠️ Step-by-Step Instructions

### Step 1: Check for Available Updates

First, move to the correct directory and run the `shadcn diff` command. The project uses pnpm.

```bash
cd packages/web
pnpm dlx shadcn diff
```

This command will output a list of components that have changes available. Read this output carefully to see which components can be updated.

### Step 2: Inform the User (Optional but Recommended)

If the user just asked "are there any updates?", list the components that have updates available and ask if they would like to proceed with the upgrade.

If the user said "upgrade my components", you can proceed to the next step, but it's good practice to log what you are upgrading.

### Step 3: Apply the Update

To update a specific component (e.g., `button`), use the following command from the `packages/web` directory. The `-o` flag is important to overwrite the existing file.

```bash
cd packages/web
pnpm dlx shadcn add [component-name] -o
```

You can update multiple components at once:
```bash
cd packages/web
pnpm dlx shadcn add button dialog input -o
```

### Step 4: Verification (The Most Important Step)

After updating the components, you **MUST** verify that the changes haven't broken anything.

1.  **Format and Lint:** Run Prettier and ESLint to catch any obvious issues introduced by the new component code.
    ```bash
    pnpm --filter @lightscope-ce/web run lint
    pnpm exec prettier --write packages/web/src/components/ui/
    ```

2.  **Type Check / Build:** Ensure the TypeScript compiler is happy.
    ```bash
    pnpm --filter @lightscope-ce/web run build
    ```
    *Alternatively, you can just run typechecking if build is slow.*

3.  **Run Tests:** Run the unit tests for the web package to ensure component logic is intact.
    ```bash
    pnpm --filter @lightscope-ce/web run test run
    ```

4.  **E2E / Visual Verification (If applicable):** If there are Playwright tests, run them. If not, briefly start the dev server and fetch the homepage to ensure it doesn't immediately crash.
    ```bash
    pnpm --filter @lightscope-ce/web run dev > web.log 2>&1 &
    # Wait a few seconds, check web.log for port, then curl it.
    ```

### Step 5: Report Results

Inform the user about:
1.  Which components were successfully upgraded.
2.  The results of the verification steps (lint, build, test).
3.  Any issues encountered (e.g., "The `button` component updated successfully, but I had to manually fix a type error it introduced...").

## Important Rules & Context

- **Memory Context:** Remember the instruction: `To upgrade shadcn-ui components in packages/web, check update feasibility with pnpm dlx shadcn diff, apply updates using pnpm dlx shadcn add [component-name] -o, and verify functionality, layout, and lint rules (pnpm --filter @lightscope-ce/web run lint).`
- **Pathing:** All shadcn commands MUST be run from inside the `packages/web` directory, or they will fail to find `components.json`.
- **Overwrite:** Always use the `-o` (overwrite) flag when running `shadcn add` to update an existing component.
