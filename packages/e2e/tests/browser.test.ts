import { env } from '@/fixtures/env';
import login from '@/setup/login';
import { injectTracker } from '@/setup/tracker';
import { generatePayload } from '@/utils/generator';
import { expect, test } from '@playwright/test';

const ONE_HOUR_MS = 3600000;

test('Browser Tracking Script Verification', async ({ browser }) => {
  const generated = generatePayload();
  const userAgent = generated.user_agent;

  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();

  const { storage, org } = await login();

  // 1. Navigate to the page and verify Page View event sent
  const pageViewPromise = page.waitForRequest(
    (req) =>
      req.url().includes('/events') &&
      req.method() === 'POST' &&
      JSON.parse(req.postData() || '{}').event_name === 'page_view'
  );

  const utmParams = '?utm_source=test_source&utm_medium=test_medium&utm_campaign=test_campaign';
  const refererUrl = 'https://example.com/referrer-page';

  await page.goto(`${env.mockSiteURL}/index.html${utmParams}`, {
    referer: refererUrl,
  });

  await injectTracker(page, org.id as string, env.mockSiteURL);

  const pageViewReq = await pageViewPromise;
  expect(pageViewReq).toBeTruthy();
  console.log('Page view event verified.');

  const postData = JSON.parse(pageViewReq.postData() || '{}');
  expect(postData.query_params?.utm_source).toBe('test_source');
  expect(postData.referrer).toBe(refererUrl);
  // Optional: User agent should be sent in headers, verified by API
  const headers = await pageViewReq.headers();
  expect(headers['user-agent']).toBe(userAgent);

  // 2. Click button
  const clickPromise = page.waitForRequest(
    (req) =>
      req.url().includes('/events') &&
      req.method() === 'POST' &&
      JSON.parse(req.postData() || '{}').event_name === 'click'
  );

  await page.click('#track-btn');
  const clickReq = await clickPromise;
  expect(clickReq).toBeTruthy();
  console.log('Manual click event verified.');

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
        }
      }
    }
  `;

  const cookie = storage.cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');

  // Use a more efficient polling mechanism that overlaps fetch latency with wait time
  // but avoids a mandatory 500ms delay on the first successful attempt.
  for (let i = 0; i < 20; i++) {
    // Start the 500ms timer
    const waitPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const gqlRes = await fetch(`${env.apiURL}/gql`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (gqlRes.ok) {
      const gqlData = await gqlRes.json();
      articles = gqlData.data?.rank?.articles || [];
      const foundArticle = articles.find((a: any) => a.url.includes('index.html'));
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
});
