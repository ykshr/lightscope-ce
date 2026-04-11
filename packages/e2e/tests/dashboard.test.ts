import { expect, test } from '@playwright/test';

test.describe('Web Dashboard Verification', () => {
  test('should display total page views properly', async ({ page }) => {
    // Wait for initial render and data fetch
    await page.goto('/');

    // Wait until the "Total Page Views" card finishes loading
    await expect(page.locator('.lucide-loader-circle')).toHaveCount(0);

    // Assert that the card title exists
    await expect(page.locator('h3', { hasText: 'Total Page Views' })).toBeVisible();

    // The mock data logic injects '2,400' on the overview page for 24h
    // Check that '2,400' is displayed within the card (assuming mock data hasn't mutated yet)
    await expect(
      page.locator('div:has(> h3:text-is("Total Page Views")) >> text="2,400"')
    ).toBeVisible();
  });

  test('should display pie charts data properly', async ({ page }) => {
    await page.goto('/');

    // Wait for the loaders to disappear
    await expect(page.locator('.lucide-loader-circle')).toHaveCount(0);

    // Verify the Top Referrer Domains title is visible
    await expect(page.locator('h3', { hasText: 'Top Referrer Domains' })).toBeVisible();

    // The Top Referrer pie chart should have segments rendered (SVG paths inside rechart)
    const pieChartPaths = page.locator('.recharts-pie-sector');
    expect(await pieChartPaths.count()).toBeGreaterThan(0);
  });

  test('should interact with the date range filter', async ({ page }) => {
    await page.goto('/');

    // Click the date filter trigger to open the modal/popover
    const dateFilterTrigger = page.locator('button', { hasText: 'Today' }).first();
    await dateFilterTrigger.click();

    // The DateFilter has a quick access button "This week" on desktop
    const thisWeekBtn = page.locator('button', { hasText: 'This week' }).first();
    await thisWeekBtn.click();

    // Verify the URL gets updated with the date range query parameters
    await expect(page).toHaveURL(/sd=So0W/);
    await expect(page).toHaveURL(/ed=So1D/);
  });

  test('should interact with the advanced article filter', async ({ page }) => {
    await page.goto('/article');
    // await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Click the filter button (has the lucide-funnel icon)
    await page
      .locator('button')
      .filter({ has: page.locator('.lucide-funnel') })
      .first()
      .click();

    // Verify modal is open
    await expect(page.locator('text=Advanced Filter')).toBeVisible();

    // Find the TagInput container for "Site Names"
    const tagInputContainer = page.locator('div:has(> label:text-is("Site Names"))');

    const siteNamesInput = tagInputContainer.locator('input[placeholder="New..."]');

    await siteNamesInput.fill('test-site');
    await siteNamesInput.press('Enter');

    // Wait for the badge to be rendered inside the modal
    const tagBadge = tagInputContainer.locator('span', { hasText: 'test-site', exact: true });
    await expect(tagBadge).toBeVisible();

    // Click "Apply Changes"
    await page.getByRole('button', { name: 'Apply Changes', exact: true }).dispatchEvent('click');

    // Wait for the modal to close and the filter to apply
    await expect(page.locator('text=Advanced Filter')).toBeHidden();

    // Verify URL updates with the filter
    await expect(page).toHaveURL(/isn=test-site/, { timeout: 10000 });
  });

  test('should collapse and expand the sidebar', async ({ page }) => {
    await page.goto('/');

    // On desktop, sidebar should be open
    const sidebar = page.locator('div[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Click the trigger button to collapse
    const triggerBtn = page.locator('button[data-sidebar="trigger"]').first();
    await triggerBtn.click();

    // Verify sidebar collapsed
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    // Click again to expand
    await triggerBtn.click();
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });

  test('should open organization switcher', async ({ page }) => {
    await page.goto('/');

    // Click the organization switcher button
    const orgSwitcherBtn = page.locator('div[data-sidebar="menu"] button').first();
    await orgSwitcherBtn.click();

    // Verify the dropdown menu appears
    const dropdown = page.locator('.lucide-plus').locator('..'); // The "Add organization" button container
    await expect(dropdown).toBeVisible();
  });
});
