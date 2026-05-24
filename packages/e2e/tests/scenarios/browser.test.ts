import { API_URL, MOCK_SITE_URL } from '@/helpers/env';
import { injectTracker } from '@/setup/tracker';
import { expect, test } from '@playwright/test';

const ONE_HOUR_MS = 3600000;

test.only('Browser Tracking Script Verification', async ({ browser, request, page }) => {
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
      const foundArticle = articles.find((a: any) => a.url.includes(`${MOCK_SITE_URL}/index.html`));
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

  // 4. Verify on Web Dashboard
  console.log('Verifying data on Web Dashboard...');
  await page.goto('/ranking');
  const rows = page.locator('table[data-slot="table"] tbody tr');
  const targetRow = rows.filter({
    has: page.locator('td').nth(2).filter({ hasText: 'E2E Test Article Title' }),
  });
  await expect(targetRow.locator('td').nth(6)).toHaveText('1');

  console.log('Data verification successful on Web Dashboard.');
});
