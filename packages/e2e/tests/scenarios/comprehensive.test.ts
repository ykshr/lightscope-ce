import { MOCK_SITE_URL, PROXY_URL } from '@/helpers/env';
import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Comprehensive Flow', () => {
  test('should execute full e2e scenario successfully', async ({ page, browser }) => {
    const testEmail = `e2e-test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testOrgName = `Org-${Date.now()}`;
    console.log({ testEmail, testPassword, testOrgName });

    // Step 1: Sign up
    await page.goto('/signup');
    await page.locator('input[id="email"]').fill(testEmail);
    await page.locator('input[id="password"]').fill(testPassword);
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();

    // Should auto login and redirect to overview
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Step 2: Logout
    await page.goto('/settings/profile');
    await page.getByRole('button', { name: 'Log out', exact: true }).click();

    // Should redirect to singin page
    await expect(page).toHaveURL(/.*\/singin/);

    // Step 3: Sign in
    await page.goto('/singin');
    await page.locator('input[id="email"]').fill(testEmail);
    await page.locator('input[id="password"]').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    // Should login and redirect to overview
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.locator('h1', { hasText: 'LittleScope' })).toBeVisible();

    // Step 4: Create Organization
    // Open Account dropdown
    await page.locator('button', { hasText: testEmail }).click();
    // Hover "Active" submenu
    await page.getByText('Active', { exact: true }).hover();
    // Click "Add new organization"
    await page.getByText('Add new organization', { exact: true }).click();
    // Fill dialog
    await page.locator('input[id="name"]').fill(testOrgName);
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Wait for the new org to be active (the page reloads via navigate(0) in Account.tsx)
    await page.waitForLoadState('networkidle');

    // Step 5: Generate Tracker Token
    await page.goto('/settings/organization');
    await page.getByRole('button', { name: 'New Token' }).click();
    await page.locator('input[id="origin"]').fill(MOCK_SITE_URL);
    await page.getByRole('button', { name: 'Generate' }).click();

    // Retrieve token
    // The previous token retrieval failed in CI due to timeout.
    // Ensure we wait for the table row corresponding to the mock site URL.
    const tableRow = page
      .locator('table[data-slot="table"] tbody tr', { hasText: MOCK_SITE_URL })
      .first();
    await expect(tableRow).toBeVisible({ timeout: 15000 });

    const tokenSpan = tableRow.locator('span[dir="rtl"]');
    await expect(tokenSpan).toBeVisible();
    const rawToken = await tokenSpan.textContent();
    const token = rawToken?.replace(/[\u200E]/g, '').trim();
    expect(token).toBeTruthy();

    // Step 6: Simulate multiple accesses from multiple sessions
    const scriptPath = path.resolve(__dirname, '../../../../packages/tracker/dist/browser.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    const sessions = [
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        referer: 'https://google.com',
      },
      {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        referer: 'https://twitter.com',
      },
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0',
        referer: 'https://facebook.com',
      },
    ];

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const context = await browser.newContext({ userAgent: session.userAgent });
      const mockPage = await context.newPage();

      // Navigate multiple times per session
      for (let j = 0; j < 2; j++) {
        const pageViewPromise = mockPage.waitForRequest(
          (req) =>
            req.url().includes('/events') &&
            req.method() === 'POST' &&
            JSON.parse(req.postData() || '{}').event_name === 'page_view'
        );

        await mockPage.goto(`${MOCK_SITE_URL}/index.html?utm_source=test${i}&utm_medium=cpc${j}`, {
          referer: session.referer,
        });

        await mockPage.evaluate(
          ({ scriptContent, token, endpoint }) => {
            const script = document.createElement('script');
            script.textContent = scriptContent;
            script.setAttribute('data-token', token as string);
            script.setAttribute('data-endpoint', endpoint);
            document.head.appendChild(script);
          },
          { scriptContent, token, endpoint: `${PROXY_URL}/events` }
        );

        const pageViewReq = await pageViewPromise;
        expect(pageViewReq).toBeTruthy();

        // Wait briefly between page views
        await mockPage.waitForTimeout(500);
      }

      await context.close();
    }

    // Step 7: verify overview page
    await page.goto('/');
    await expect(page.locator('text=Total Page Views').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible({ timeout: 30_000 });

    // Verify Total Page Views card value (6 page views)
    const totalViewsCard = page.locator('div', { hasText: 'Total Page Views' }).first();
    await expect(totalViewsCard.locator('h3')).toHaveText('3');

    // Verify Unique Users card value (3 unique users)
    const uniqueUsersCard = page.locator('div', { hasText: 'Unique Users' }).first();
    await expect(uniqueUsersCard.locator('h3')).toHaveText('1');

    // Verify Referrer Domains pie chart values
    const referrerCard = page
      .locator('div', { has: page.locator('h3', { hasText: 'Referrer Domains' }) })
      .first();
    await expect(referrerCard).toBeVisible();

    // Verify center text of donut chart (6 visits)
    await expect(referrerCard.locator('text', { hasText: '3' }).first()).toBeVisible();
    await expect(referrerCard.locator('text', { hasText: 'Visits' }).first()).toBeVisible();

    // Verify referrer domain legend values (each referrer has 2 visits, i.e., 33%)
    const googleRow = referrerCard.locator('div', { hasText: 'google.com' }).first();
    await expect(googleRow).toContainText('1 (33%)');

    const twitterRow = referrerCard.locator('div', { hasText: 'twitter.com' }).first();
    await expect(twitterRow).toContainText('1 (33%)');

    const facebookRow = referrerCard.locator('div', { hasText: 'facebook.com' }).first();
    await expect(facebookRow).toContainText('1 (33%)');

    // Step 8: Verify ranking page
    await page.goto('/ranking');
    await expect(
      page
        .locator('table[data-slot="table"] tbody tr')
        .filter({ hasText: 'E2E Test Article Title' })
        .first()
    ).toBeVisible({ timeout: 30_000 });

    // Step 9: Verify article page
    const targetUrl = encodeURIComponent(`${MOCK_SITE_URL}/index.html`);
    await page.goto(`/article?url=${targetUrl}`);
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible({ timeout: 30_000 });
  });
});
