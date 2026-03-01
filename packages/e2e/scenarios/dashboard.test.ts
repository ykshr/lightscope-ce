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
});
