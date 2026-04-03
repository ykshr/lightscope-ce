const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'packages/e2e/tests/dashboard.test.ts');
let code = fs.readFileSync(filePath, 'utf8');

// Fix 1: Update locator for advanced article filter
code = code.replace(
  `const siteNamesInput = page.locator('div:has(> label:has-text("Site Names")) >> input');`,
  `const siteNamesInput = page.locator('div:has(> label:text-is("Site Names")) >> input');`
);

// Fix 2: Update sidebar collapse/expand test
const oldSidebarTest = `  test('should collapse and expand the sidebar', async ({ page }) => {
    await page.goto('/');

    // On desktop, sidebar should be open and title visible
    const title = page.locator('h1', { hasText: 'LittleScope' });
    await expect(title).toBeVisible();

    // Click the chevron left button to collapse
    await page.locator('button:has(.lucide-chevron-left)').click();

    // Title should no longer be visible
    await expect(title).toBeHidden();

    // Click the chevron right button to expand
    await page.locator('button:has(.lucide-chevron-right)').click();

    // Title should be visible again
    await expect(title).toBeVisible();
  });`;

const newSidebarTest = `  test('should collapse and expand the sidebar', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('#sidebar');

    // On desktop, sidebar should be open
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Click the trigger button to collapse
    await page.locator('button[data-sidebar="trigger"]').click();

    // Sidebar should be collapsed
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    // Click the trigger button to expand
    await page.locator('button[data-sidebar="trigger"]').click();

    // Sidebar should be expanded again
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });`;

code = code.replace(oldSidebarTest, newSidebarTest);

fs.writeFileSync(filePath, code);
