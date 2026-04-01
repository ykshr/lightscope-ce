import { env } from '@/fixtures/env';
import { expect, test } from '@playwright/test';

test.describe('PROXY Error Handling and GraphQL Tests', () => {
  test.beforeEach(() => {
    test.use({ storageState: 'auth.json' });
  });

  test('POST /events should handle malformed JSON', async ({ request }) => {
    const response = await request.post(`${env.proxyURL}/events`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{"bad json"',
    });
    // Should return 400 Bad Request
    expect(response.status()).toBe(400);
  });

  test('POST /events should handle missing required fields', async ({ request }) => {
    const response = await request.post(`${env.proxyURL}/events`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        event_name: 'page_view',
        // missing url, which is required
      },
    });
    // Assume API returns 400 for missing required fields
    expect(response.status()).toBe(400);
  });
});
