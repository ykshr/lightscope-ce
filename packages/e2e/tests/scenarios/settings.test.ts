import { expect, test } from '@playwright/test';

test.describe('Settings Page Verification', () => {
  test('should load the settings page and display tabs', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');

    // Check that the page has loaded properly (using a key element like the TabsList)
    await expect(page.getByRole('tablist')).toBeVisible({ timeout: 10000 });

    // Verify the "My Profile" and "Organization" tabs are visible
    const profileTab = page.getByRole('tab', { name: 'My Profile' });
    const orgTab = page.getByRole('tab', { name: 'Organization' });

    await expect(profileTab).toBeVisible();
    await expect(orgTab).toBeVisible();

    // Profile tab is selected by default, verify it shows relevant content
    await expect(profileTab).toHaveAttribute('data-state', 'active');
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/settings');

    const orgTab = page.getByRole('tab', { name: 'Organization' });

    // Click Organization tab
    await orgTab.click();

    // Verify Organization tab is active
    await expect(orgTab).toHaveAttribute('data-state', 'active');
  });
});
