import { expect, test } from '@playwright/test';

test.describe('Settings Page Verification', () => {
  test('should load the profile settings page', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings/profile');
    // Profile is shown
    await expect(page.locator('h1', { hasText: 'Profile' })).toBeVisible();
  });

  test('should load the organization settings page', async ({ page }) => {
    await page.goto('/settings/organization');
    // Organization is shown
    await expect(page.locator('h1', { hasText: 'Organization' })).toBeVisible();
  });
});
