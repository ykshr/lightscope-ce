import { test, expect } from '@playwright/test';
import { generatePayload } from '../utils/generator';

const API_URL = 'http://localhost:3000';
const MOCK_SITE_URL = 'http://localhost:8080';

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

  await page.goto(`${MOCK_SITE_URL}/index.html`);
  const pageViewReq = await pageViewPromise;
  expect(pageViewReq).toBeTruthy();
  console.log('Page view event verified.');

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

  // 3. Wait for ingestion
  console.log('Waiting for ingestion...');
  await page.waitForTimeout(3000);

  // 4. Verify in ClickHouse via GraphQL
  const query = `
    query {
      rank(
        startDate: "${new Date(Date.now() - 3600000).toISOString()}"
        endDate: "${new Date(Date.now() + 3600000).toISOString()}"
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

  const gqlRes = await fetch(`${API_URL}/gql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const gqlData = await gqlRes.json();
  const articles = gqlData.data?.rank?.articles || [];
  const found = articles.find((a: any) => a.url.includes('index.html'));

  expect(found).toBeTruthy();
  console.log('Data verification successful in GraphQL.');
});
