import { API_URL, MOCK_SITE_URL } from '@/helpers/env';
import { injectTracker } from '@/setup/tracker';
import { expect, test } from '@playwright/test';

const ONE_HOUR_MS = 3600000;

test.describe('Analytics', () => {
  test.beforeAll(async ({ browser, request }) => {
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const context = await browser.newContext({ userAgent });
    const articlePage = await context.newPage();
    articlePage.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));

    // 1. Navigate to the page and verify Page View event sent
    const pageViewPromise = articlePage.waitForRequest(
      (req) =>
        req.url().includes('/events') &&
        req.method() === 'POST' &&
        JSON.parse(req.postData() || '{}').event_name === 'page_view'
    );

    const utmParams = '?utm_source=test_source&utm_medium=test_medium&utm_campaign=test_campaign';
    const refererUrl = 'https://example.com/referrer-page';

    await articlePage.goto(`${MOCK_SITE_URL}/index.html${utmParams}`, {
      referer: refererUrl,
    });

    const org = JSON.parse(process.env.ORG_DATA || '{}');
    await injectTracker(articlePage, org.id as string, MOCK_SITE_URL);

    const pageViewReq = await pageViewPromise;
    expect(pageViewReq).toBeTruthy();
    console.log('Page view event verified.');

    const postData = JSON.parse(pageViewReq.postData() || '{}');
    expect(postData.referrer).toBe(refererUrl);
    // Optional: User agent should be sent in headers, verified by API
    const headers = pageViewReq.headers();
    expect(headers['user-agent']).toBe(userAgent);

    // 2. Click button
    const clickPromise = articlePage.waitForRequest(
      (req) =>
        req.url().includes('/events') &&
        req.method() === 'POST' &&
        JSON.parse(req.postData() || '{}').event_name === 'element_click'
    );

    await articlePage.click('#track-btn');
    const clickReq = await clickPromise;
    expect(clickReq).toBeTruthy();
    console.log('Click event verified.');

    // 3. Wait for ingestion with dynamic polling
    console.log('Waiting for ingestion with dynamic polling...');
    let found = false;
    let articles = [];

    const query = `
    query {
      rank(
        startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
        endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
        limit: 10
      ) {
        total
        articles {
          url
          value
          article {
            title
          }
        }
      }
    }
  `;

    // Use a more efficient polling mechanism that overlaps fetch latency with wait time
    // but avoids a mandatory 500ms delay on the first successful attempt.
    for (let i = 0; i < 20; i++) {
      // Start the 500ms timer
      const waitPromise = new Promise((resolve) => setTimeout(resolve, 500));

      const res = await request.post(`${API_URL}/graphql`, {
        headers: { 'Content-Type': 'application/json' },
        data: { query },
      });

      if (res.ok()) {
        const gqlData = await res.json();
        console.log(JSON.stringify(gqlData));
        articles = gqlData.data?.rank?.articles || [];
        const foundArticle = articles.find((a: any) =>
          a.url.includes(`${MOCK_SITE_URL}/index.html`)
        );
        if (foundArticle) {
          found = true;
          break;
        }
      }

      // If not found, wait for the remaining time of the 500ms timer
      if (i < 19) {
        await waitPromise;
      }
    }

    expect(found).toBeTruthy();
    console.log('Data verification successful in GraphQL.');

    await context.close();
  });

  test('should display ingested data on overview', async ({ page }) => {
    await page.goto('/');

    // 1. Articles Table: Wait for the table header to be loaded
    await expect(page.locator('text=Ranking').first()).toBeVisible();

    // Verify that the ingested test data (article title) is displayed in the table
    const targetRow = page
      .locator('table[data-slot="table"] tbody tr')
      .filter({ hasText: 'E2E Test Article Title' });
    await expect(targetRow.first()).toBeVisible();

    // 2. Stats Row: Verify that each stats card is loaded and displays numerical data
    const statCards = ['Total Page Views', 'Unique Users', 'Engagement Time', 'Realtime Visitors'];
    for (const title of statCards) {
      const titleLocator = page.locator(`text=${title}`).first();
      await expect(titleLocator).toBeVisible();

      // Traverse up to the parent Card element (e.g., shadcn/ui Card) and verify it contains some numbers
      const cardLocator = titleLocator.locator(
        'xpath=ancestor::div[contains(@class, "border") or contains(@class, "rounded")][1]'
      );
      await expect(cardLocator).toContainText(/\d+|N\/A/);
    }

    // 3. Charts Section: Verify that AreaStacked and PieReferrerDomain charts are rendered
    // Recharts generates a recharts-wrapper class upon rendering, so we use this as a reference for verification
    const charts = page.locator('.recharts-wrapper');
    await expect(charts.first()).toBeVisible();
    await expect(charts.nth(1)).toBeVisible();
  });

  test('should display ingested data on ranking', async ({ page }) => {
    await page.goto('/ranking');
    const rows = page.locator('table[data-slot="table"] tbody tr');
    const targetRow = rows.filter({
      has: page.locator('td').nth(2).filter({ hasText: 'E2E Test Article Title' }),
    });

    // Verify all columns in the ranking table based on the exact metadata values
    await expect(targetRow.locator('td').nth(0)).toHaveText('1'); // Rank (Dynamic)
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
    await expect(targetRow.locator('td').nth(6)).toHaveText('1'); // Metric (Value)
  });
});
