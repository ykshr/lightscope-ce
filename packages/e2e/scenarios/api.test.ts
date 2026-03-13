import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const INSERT_URL = process.env.INSERT_URL || 'http://localhost:3001';

test.describe('API Error Handling and GraphQL Tests', () => {
  test('POST /events should handle malformed JSON', async ({ request }) => {
    const response = await request.post(`${INSERT_URL}/events`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{"bad json"',
    });
    // Should return 400 Bad Request
    expect(response.status()).toBe(400);
  });

  test('POST /events should handle missing required fields', async ({ request }) => {
    const response = await request.post(`${INSERT_URL}/events`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      data: {
        event_name: 'page_view',
        // missing url, which is required
      },
    });
    // Assume API returns 400 for missing required fields
    expect(response.status()).toBe(400);
  });

  test('GraphQL queries should return expected structures for trend and aggregations', async ({
    request,
  }) => {
    const query = `
      query {
        trend(
          startDate: "${new Date(Date.now() - 3600000).toISOString()}"
          endDate: "${new Date(Date.now() + 3600000).toISOString()}"
          aggregation: { unit: DAY }
        ) {
          total {
            date
            value
          }
        }
      }
    `;

    const res = await request.post(`${API_URL}/gql`, {
      data: { query },
      headers: { Authorization: 'Bearer dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg==' },
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
          startDate: "${new Date(Date.now() - 3600000).toISOString()}"
          endDate: "${new Date(Date.now() + 3600000).toISOString()}"
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

    const res = await request.post(`${API_URL}/gql`, {
      data: { query },
      headers: { Authorization: 'Bearer dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg==' },
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
            startDate: "${new Date(Date.now() - 3600000).toISOString()}"
            endDate: "${new Date(Date.now() + 3600000).toISOString()}"
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

    const res = await request.post(`${API_URL}/gql`, {
      data: { query },
      headers: { Authorization: 'Bearer dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg==' },
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
