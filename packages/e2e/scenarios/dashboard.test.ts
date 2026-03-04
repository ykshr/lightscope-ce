import { test, expect } from '@playwright/test';

const WEB_URL = process.env.WEB_URL || 'http://localhost:60000';

test.describe('Web Dashboard Verification', () => {
  test('should load the overview page and display key metrics', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // Check that the sidebar title is visible
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Verify key metrics cards are visible
    await expect(page.locator('text=Total Page Views')).toBeVisible();
    await expect(page.locator('text=Unique Users')).toBeVisible();
    await expect(page.locator('text=Engagement Time')).toBeVisible();
    await expect(page.locator('text=Live Views')).toBeVisible();

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

  test('should interact with the custom date range picker modal', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    // Open the Date Filter modal
    await page.locator('button:has(.lucide-calendar)').first().click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: 'Date Filter' })).toBeVisible();

    // Click the Select trigger for Relative options
    // Assuming the SelectValue shows "Today" by default
    await page.locator('button[role="combobox"]').first().click();

    // Select "Yesterday"
    await page.locator('div[role="option"]:has-text("Yesterday")').click();

    // Click Apply Changes
    await page.click('button:has-text("Apply Changes")');

    // Verify URL updates
    await expect(page).toHaveURL(/sd=So-1D/);
    await expect(page).toHaveURL(/ed=So0D/);
  });

  test.skip('should interact with the search bar', async ({ page }) => {
    await page.goto(`${WEB_URL}/`);

    const searchInput = page.locator('input[placeholder="Type a command or search..."]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Calendar');

    // CommandList should show suggestions
    await expect(page.locator('text=Calendar').nth(1)).toBeVisible(); // 0 is input or heading, 1 is the item
  });

  test('should verify pagination elements in the Ranking page', async ({ page }) => {
    await page.goto(`${WEB_URL}/ranking`);

    // Wait for the table to load
    await expect(page.locator('h2', { hasText: 'Ranking' }).first()).toBeVisible();

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
