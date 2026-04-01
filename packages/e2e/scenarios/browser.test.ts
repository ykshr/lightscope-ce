import { expect, test } from '@playwright/test';
import { generatePayload } from '../utils/generator';

const ONE_HOUR_MS = 3600000;
const API_URL = 'http://127.0.0.1:3001';
const MOCK_SITE_URL = 'http://127.0.0.1:8080';

test('Browser Tracking Script Verification', async ({ browser }) => {
  const generated = generatePayload();
  const userAgent = generated.user_agent;

  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();

  // 1. Navigate to the page and verify Page View event sent
  const pageViewPromise = page.waitForRequest(
    (req) =>
      req.url().includes('/events') &&
      req.method() === 'POST' &&
      JSON.parse(req.postData() || '{}').event_name === 'page_view'
  );

  const utmParams = '?utm_source=test_source&utm_medium=test_medium&utm_campaign=test_campaign';
  const refererUrl = 'https://example.com/referrer-page';

  await page.goto(`${MOCK_SITE_URL}/index.html${utmParams}`, {
    referer: refererUrl,
  });

  const pageViewReq = await pageViewPromise;
  expect(pageViewReq).toBeTruthy();
  console.log('Page view event verified.');

  const postData = JSON.parse(pageViewReq.postData() || '{}');
  expect(postData.query_params?.utm_source).toBe('test_source');
  expect(postData.referrer).toBe(refererUrl);
  // Optional: User agent should be sent in headers, verified by API
  const headers = await pageViewReq.headers();
  expect(headers['user-agent']).toBe(userAgent);

  // 2. Click button and verify Custom Event sent
  const clickPromise = page.waitForRequest(
    (req) =>
      req.url().includes('/events') &&
      req.method() === 'POST' &&
      JSON.parse(req.postData() || '{}').event_name === 'manual_click'
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

  // Use a more efficient polling mechanism that overlaps fetch latency with wait time
  // but avoids a mandatory 500ms delay on the first successful attempt.
  for (let i = 0; i < 20; i++) {
    // Start the 500ms timer
    const waitPromise = new Promise((resolve) => setTimeout(resolve, 500));

    const gqlRes = await fetch(`${API_URL}/gql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NO_AUTH_TOKEN || 'dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg=='}`,
      },
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
