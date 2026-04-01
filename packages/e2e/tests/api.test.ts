import { env } from '@/fixtures/env';
import { expect, test } from '@playwright/test';

const ONE_HOUR_MS = 3600000;

test.describe('API Error Handling and GraphQL Tests', () => {
  test.beforeEach(() => {
    test.use({ storageState: 'auth.json' });
  });

  test('GraphQL queries should return expected structures for trend and aggregations', async ({
    request,
  }) => {
    const query = `
      query {
        trend(
          startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
          endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
          aggregation: { unit: DAY }
        ) {
          total {
            date
            value
          }
        }
      }
    `;

    const res = await request.post(`${env.apiURL}/gql`, {
      headers: { 'Content-Type': 'application/json' },
      data: { query },
    });
    const json = await res.json();
    if (!res.ok()) {
      console.log('trend error response:', JSON.stringify(json, null, 2));
    }
    expect(res.ok()).toBeTruthy();
    expect(json.data?.trend?.total).toBeDefined();
    expect(Array.isArray(json.data.trend.total)).toBe(true);
  });

  test('GraphQL queries should return expected structures for rank', async ({ request }) => {
    const query = `
      query {
        rank(
          startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
          endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
          limit: 5
        ) {
          total
          articles {
            url
            value
          }
        }
      }
    `;

    const res = await request.post(`${env.apiURL}/gql`, {
      headers: { 'Content-Type': 'application/json' },
      data: { query },
    });
    const json = await res.json();
    expect(res.ok()).toBeTruthy();
    expect(json.data?.rank?.total).toBeDefined();
    expect(Array.isArray(json.data.rank.articles)).toBe(true);
  });

  test('GraphQL queries should return expected structures for article analytics', async ({
    request,
  }) => {
    const query = `
      query {
        article(url: "https://example.com/test") {
          url
          siteName
          analytics(
            startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
            endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
          ) {
            analytics {
              date
              value
            }
            analyticsUtm {
              source
              medium
              campaign
              value
            }
          }
        }
      }
    `;

    const res = await request.post(`${env.apiURL}/gql`, {
      headers: { 'Content-Type': 'application/json' },
      data: { query },
    });
    const json = await res.json();
    expect(res.ok()).toBeTruthy();
    // It's possible the article is null if it doesn't exist, but it shouldn't error out.
    if (json.data?.article) {
      expect(json.data.article.analytics.analytics).toBeDefined();
      expect(json.data.article.analytics.analyticsUtm).toBeDefined();
    }
  });
});
