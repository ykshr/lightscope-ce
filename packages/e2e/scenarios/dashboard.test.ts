import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:60000';

test.describe('Web Dashboard Verification', () => {
  test('should load the overview page and display key metrics', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // Check that the sidebar title is visible
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Verify key metrics cards are visible
    await expect(page.locator('text=Total Page Views')).toBeVisible();

    // The table should have the title "Ranking"
    await expect(page.locator('h2', { hasText: 'Ranking' }).first()).toBeVisible();
  });

  test('should navigate to the ranking page', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // Find link to ranking and click it
    await page.click('a[href="/ranking"]');

    // Verify navigation to ranking
    await expect(page).toHaveURL(`${WEB_URL}/ranking`);

    // Verify the page content is loaded
    await expect(page.locator('h2', { hasText: 'Ranking' }).first()).toBeVisible();
  });

  test('should navigate to the article page', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // Find link to article and click it
    await page.click('a[href="/article"]');

    // Verify navigation to article
    await expect(page).toHaveURL(`${WEB_URL}/article`);

    // Verify article page specific content
    await expect(page.locator('text=Global Economy Trends')).toBeVisible();
  });

  test('should interact with date range picker and filtering', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // The DateFilter has a quick access button "This week" on desktop
    const thisWeekBtn = page.locator('button', { hasText: 'This week' }).first();
    await thisWeekBtn.click();

    // Verify the URL gets updated with the date range query parameters
    await expect(page).toHaveURL(/sd=So0W/);
    await expect(page).toHaveURL(/ed=So1D/);
  });

  test('should interact with the advanced article filter', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // Click the filter button (has the lucide-filter icon)
    await page.locator('button:has(.lucide-filter)').click();

    // Verify modal is open
    await expect(page.locator('text=Advanced Filter')).toBeVisible();

    // Input "test-site" into "Site Names" TagInput
    const siteNamesInput = page.locator('div:has(> label:has-text("Site Names")) >> input');
    await siteNamesInput.fill('test-site');
    await siteNamesInput.press('Enter');

    // Click "Apply Changes"
    await page.click('button:has-text("Apply Changes")');

    // Verify URL updates with the filter
    await expect(page).toHaveURL(/articleFilter/);
    await expect(page).toHaveURL(/test-site/);
  });

  test('should collapse and expand the sidebar', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

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
  });
});
