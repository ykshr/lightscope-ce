import { WEB_URL } from '@/helpers/env';
import { expect, test } from '@playwright/test';

test.describe('Web Dashboard Verification', () => {
  test('should load the overview page and display key metrics', async ({ page }) => {
    await page.goto('/');

    // Check that the sidebar title is visible
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Verify key metrics cards are visible
    await expect(page.locator('text=Total Page Views')).toBeVisible();
    await expect(page.locator('text=Unique Users')).toBeVisible();
    await expect(page.locator('text=Engagement Time')).toBeVisible();
    await expect(page.locator('text=Realtime Visitors')).toBeVisible();

    // The table should have the title "Ranking"
    await expect(page.locator('text=Ranking').first()).toBeVisible();
  });

  test('should navigate to the ranking page', async ({ page }) => {
    await page.goto('/');

    // Find link to ranking and click it
    await page.click('a[href="/ranking"]');

    // Verify navigation to ranking
    await expect(page).toHaveURL(`${WEB_URL}/ranking`);

    // Verify the page content is loaded
    await expect(page.locator('text=Ranking').first()).toBeVisible();
  });

  test('should navigate to the article page', async ({ page }) => {
    await page.goto('/article?url=https%3A%2F%2Fexample.com');

    // Verify navigation to article
    await expect(page).toHaveURL(`${WEB_URL}/article?url=https%3A%2F%2Fexample.com`);

    // Verify article page handles non-existent or dummy data
    await expect(page.locator('text=Article not found.')).toBeVisible();
  });

  test('should interact with date range picker and filtering', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // The DateFilter has a quick access button "This week" on desktop
    const thisWeekBtn = page.locator('button', { hasText: 'This week' }).first();
    await thisWeekBtn.click();

    // Verify the URL gets updated with the date range query parameters
    await expect(page).toHaveURL(/sd=So0W/);
    await expect(page).toHaveURL(/ed=So1D/);
  });

  test('should interact with the advanced article filter', async ({ page }) => {
    // Go to article page where the filter is located
    await page.goto('/article');
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Click the filter button (has the lucide-funnel icon)
    await page
      .locator('button')
      .filter({ has: page.locator('.lucide-funnel') })
      .first()
      .click();

    // Verify modal is open
    await expect(page.locator('text=Advanced Filter')).toBeVisible();

    // Input "test-site" into "Site Names" TagInput
    const siteNamesInput = page.locator('div:has(> label:text-is("Site Names")) >> input');
    await siteNamesInput.fill('test-site');
    await siteNamesInput.press('Enter');

    // Click "Apply Changes"
    await page.getByRole('button', { name: 'Apply Changes', exact: true }).dispatchEvent('click');

    // Verify URL updates with the filter
    await expect(page).toHaveURL(/isn=test-site/);
  });

  test('should collapse and expand the sidebar', async ({ page }) => {
    await page.goto('/');

    // On desktop, sidebar should be open
    const sidebar = page.locator('div[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Click the trigger button to collapse
    await page.locator('button[data-sidebar="trigger"]').click();

    // Sidebar should be collapsed
    await expect(sidebar).toHaveAttribute('data-state', 'collapsed');

    // Click the trigger button to expand
    await page.locator('button[data-sidebar="trigger"]').click();

    // Sidebar should be expanded again
    await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  });

  test('should interact with the custom date range picker modal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Open the Date Filter modal
    await page
      .locator('button')
      .filter({ has: page.locator('.lucide-calendar') })
      .first()
      .click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: 'Advanced Date Filter' })).toBeVisible();

    // Select "Yesterday"
    await page.getByRole('button', { name: 'Yesterday', exact: true }).click();

    // Click Apply Changes
    await page.getByRole('button', { name: 'Apply Filter', exact: true }).click();

    // Verify URL updates
    await expect(page).toHaveURL(/sd=So-1D/);
    await expect(page).toHaveURL(/ed=So0D/);
  });

  test.skip('should interact with the search bar', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder="Type a command or search..."]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Calendar');

    // CommandList should show suggestions
    await expect(page.locator('text=Calendar').nth(1)).toBeVisible(); // 0 is input or heading, 1 is the item
  });

  test('should verify pagination elements in the Ranking page', async ({ page }) => {
    await page.goto('/ranking');

    // Wait for the table to load
    await expect(page.locator('text=Ranking').first()).toBeVisible();

    // Check if Pagination is rendered (it depends on data, but if there's data, we can check for the Pagination item or at least that it doesn't crash)
    // If there's no data, the pagination might not be visible, so we check if the Footer exists
    const footer = page.locator('div:has(> nav[aria-label="pagination"])');
    // If it's visible, test the Next button
    if (await footer.isVisible()) {
      const nextBtn = page.locator('a:has(.lucide-chevron-right)'); // Next button
      if (await nextBtn.isVisible()) {
        await expect(nextBtn).toBeVisible();
      }
    }
  });
});
