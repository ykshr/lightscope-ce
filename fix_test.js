const fs = require('fs');

const file = 'packages/e2e/tests/dashboard.test.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  `const siteNamesInput = page.locator('div:has(> label:has-text("Site Names")) >> input');`,
  `const siteNamesInput = page.locator('.flex-col').filter({ has: page.locator('label', { hasText: /^Site Names$/ }) }).locator('input');`
);

const oldSidebarTest = `  test('should collapse and expand the sidebar', async ({ page }) => {
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

const newSidebarTest = `  test('should collapse and expand the sidebar', async ({ page }) => {
    await page.goto('/');

    // On desktop, sidebar should be open
    const sidebar = page.locator('[data-sidebar="sidebar"]');
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

fs.writeFileSync(file, code);
