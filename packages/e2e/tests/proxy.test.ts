import { PROXY_URL } from '@/helpers/env';
import { generateToken } from '@/setup/tracker';
import { expect, test } from '@playwright/test';

test.describe('PROXY Error Handling and GraphQL Tests', () => {
  let token;
  test.beforeEach(async () => {
    const org = JSON.parse(process.env.ORG_DATA || '{}');
    token = generateToken(org.id as string, 'https://example.com');
  });

  test('POST /events should handle malformed JSON', async ({ request }) => {
    const response = await request.post(`${PROXY_URL}/events`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: '{"bad json"',
    });
    // Should return 400 Bad Request
    expect(response.status()).toBe(400);
  });

  test('POST /events should handle missing required fields', async ({ request }) => {
    const response = await request.post(`${PROXY_URL}/events`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        event_name: 'page_view',
        // missing url, which is required
      },
    });
    // Assume API returns 400 for missing required fields
    expect(response.status()).toBe(400);
  });

  // test('POST /events should work', async ({ request }) => {
  //   const response = await request.post(`${PROXY_URL}/events`, {
  //     headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  //     data: {
  //       event_name: 'page_view',
  //     },
  //   });
  //   expect(response.status()).toBe(200);
  // });
});
