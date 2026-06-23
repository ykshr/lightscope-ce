import { MOCK_SITE_URL, PROXY_URL } from '@/helpers/env';
import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe.only('Comprehensive Flow', () => {
  test('should execute full e2e scenario successfully', async ({ page, browser }) => {
    const testEmail = `e2e-test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testOrgName = `Org-${Date.now()}`;
    console.log({ testEmail, testPassword, testOrgName });

    // Step 1: Sign up
    await page.goto('/signup');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('submit-btn').click();

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
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill(testPassword);
    await page.getByTestId('submit-btn').click();

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

    // Verify Total Page Views card value (3 page views)
    const totalViewsCard = page
      .locator('div.rounded-xl', { has: page.getByText('Total Page Views', { exact: true }) })
      .first();
    await expect(totalViewsCard.locator('h3')).toHaveText('3');

    // Verify Unique Users card value (1 unique user)
    const uniqueUsersCard = page
      .locator('div.rounded-xl', { has: page.getByText('Unique Users', { exact: true }) })
      .first();
    await expect(uniqueUsersCard.locator('h3')).toHaveText('1');

    // Verify Referrer Domains pie chart values
    const referrerCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Referrer Domains') })
      .first();

    await expect(referrerCard).toBeVisible();

    // Verify donut chart center text
    await expect(referrerCard.locator('svg text').getByText('3')).toBeVisible();
    await expect(referrerCard.locator('svg text').getByText('Visits')).toBeVisible();

    // Verify legend entries
    const legend = referrerCard.locator('.mt-6 > div');

    await expect(legend.filter({ hasText: 'google.com' })).toContainText('google.com1 (33%)');

    await expect(legend.filter({ hasText: 'facebook.com' })).toContainText('facebook.com1 (33%)');

    await expect(legend.filter({ hasText: 'twitter.com' })).toContainText('twitter.com1 (33%)');

    // Step 8: Verify ranking page
    await page.goto('/ranking');
    const rows = page.getByTestId('ranking-table-row');
    const targetRow = rows.filter({
      has: page.locator('td').nth(2).filter({ hasText: 'E2E Test Article Title' }),
    });
    await expect(targetRow.first()).toBeVisible({ timeout: 30_000 });

    // Verify all columns in the ranking table based on the exact metadata values
    await expect(targetRow.locator('td').nth(0)).toHaveText('1'); // Rank
    await expect(targetRow.locator('td').nth(1).locator('img')).toHaveAttribute(
      'src',
      /\/LittleScope_logo\.png$/
    ); // Image
    await expect(targetRow.locator('td').nth(2).locator('a')).toHaveText('E2E Test Article Title'); // Title
    await expect(targetRow.locator('td').nth(3)).toHaveText(
      new Date('2024-01-01T10:00:00Z').toLocaleDateString()
    ); // Published Date
    await expect(targetRow.locator('td').nth(4)).toHaveText('Lightscope E2E Test Site'); // Site name
    await expect(targetRow.locator('td').nth(5)).toHaveText('article'); // Type
    await expect(targetRow.locator('td').nth(6)).toHaveText('3'); // Visits (Metric Value)

    // Step 9: Verify article page
    const targetUrl = encodeURIComponent(`${MOCK_SITE_URL}/index.html`);
    await page.goto(`/article?url=${targetUrl}`);

    // Wait for the main elements to load
    await expect(page.locator('h1.text-3xl.font-bold')).toHaveText('E2E Test Article Title', {
      timeout: 30_000,
    });

    // Verify Metadata Card Info
    await expect(page.locator('img[alt="Thumbnail"]')).toHaveAttribute(
      'src',
      'http://localhost:3000/fixtures/test-image.jpg'
    );
    await expect(page.getByText('Status: Published')).toBeVisible();

    const publishedTimeGrid = page
      .locator('div.space-y-2')
      .filter({
        has: page.getByText('Published Time', { exact: true }),
      })
      .first();
    await expect(publishedTimeGrid.locator('p.font-mono')).toHaveText('1/1/2024, 10:00:00 AM');

    const modifiedTimeGrid = page
      .locator('div.space-y-2')
      .filter({
        has: page.getByText('Modified Time', { exact: true }),
      })
      .first();
    await expect(modifiedTimeGrid.locator('p.font-mono')).toHaveText('1/2/2024, 12:00:00 PM');

    // Expand & Verify Accordion/Details
    await page.getByRole('button', { name: 'Details' }).click();

    const siteNameGrid = page.locator('.space-y-2').filter({
      has: page.getByText('Site Name', { exact: true }),
    });
    await expect(siteNameGrid.locator('p')).toHaveText('Lightscope E2E Test Site');

    const localeGrid = page.locator('.space-y-2').filter({
      has: page.getByText('Locale', { exact: true }),
    });
    await expect(localeGrid.locator('p')).toHaveText('en_US');

    const sectionGrid = page.locator('.space-y-2').filter({
      has: page.getByText('Section', { exact: true }),
    });
    await expect(sectionGrid.locator('p')).toHaveText('Testing');

    const typeGrid = page.locator('.space-y-2').filter({
      has: page.getByText('Type', { exact: true }),
    });
    await expect(typeGrid.locator('p')).toHaveText('article');

    const authorsGrid = page.locator('.space-y-2').filter({
      has: page.getByText('Authors', { exact: true }),
    });
    await expect(authorsGrid.locator('p span').nth(0)).toHaveText('E2E Tester');
    await expect(authorsGrid.locator('p span').nth(1)).toHaveText('Gemini CLI');

    const tagsGrid = page.locator('.space-y-2').filter({
      has: page.getByText('Tags', { exact: true }),
    });
    await expect(tagsGrid.locator('p span').nth(0)).toHaveText('e2e');
    await expect(tagsGrid.locator('p span').nth(1)).toHaveText('test');

    // Verify Stats Cards
    const articleTotalViewsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Total Page Views', { exact: true }) })
      .first();
    await expect(articleTotalViewsCard.locator('h3')).toHaveText('3');

    const articleUniqueUsersCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Unique Users', { exact: true }) })
      .first();
    await expect(articleUniqueUsersCard.locator('h3')).toHaveText('1');

    const engagementTimeCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Avg. Engagement Time', { exact: true }) })
      .first();
    await expect(engagementTimeCard.locator('h3')).toHaveText('N/A');

    const liveViewsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Realtime Visitors', { exact: true }) })
      .first();
    await expect(liveViewsCard.locator('h3')).toHaveText('3');

    // Verify Referrer Domains pie chart
    const articleReferrerCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Referrer Domains') })
      .first();
    await expect(articleReferrerCard).toBeVisible();
    await expect(articleReferrerCard.locator('svg text').getByText('3')).toBeVisible();
    await expect(articleReferrerCard.locator('svg text').getByText('Visits')).toBeVisible();

    const referrerLegend = articleReferrerCard.locator('.mt-6 > div');
    await expect(referrerLegend.filter({ hasText: 'google.com' })).toContainText(
      'google.com1 (33%)'
    );
    await expect(referrerLegend.filter({ hasText: 'facebook.com' })).toContainText(
      'facebook.com1 (33%)'
    );
    await expect(referrerLegend.filter({ hasText: 'twitter.com' })).toContainText(
      'twitter.com1 (33%)'
    );

    // Verify UTM Campaign pie chart (should be empty/0 Visits as it wasn't tracked)
    const campaignCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('UTM Campaign', { exact: true }) })
      .first();

    await expect(campaignCard).toBeVisible();

    // Donut center value
    await expect(campaignCard.locator('tspan').filter({ hasText: '3' })).toBeVisible();
    await expect(campaignCard.locator('tspan').filter({ hasText: 'Visits' })).toBeVisible();

    // Legend
    await expect(campaignCard).toContainText('no name');
    await expect(campaignCard).toContainText('3 (100%)');

    // Verify Locations card is visible
    const locationsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.getByText('Locations', { exact: true }) })
      .first();
    await expect(locationsCard).toBeVisible();
    await expect(locationsCard.locator('h3')).toHaveText('Top Countries');

    // Verify AreaStacked chart recharts wrapper is visible
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
  });
});
