import { MOCK_SITE_URL, PROXY_URL } from '@/helpers/env';
import { generateToken } from '@/setup/tracker';
import { expect, request, test } from '@playwright/test';

async function setup() {
  const requestContext = await request.newContext({
    baseURL: PROXY_URL,
    extraHTTPHeaders: { Origin: MOCK_SITE_URL },
  });
  const org = JSON.parse(process.env.ORG_DATA || '{}');
  const token = await generateToken(org.id as string, MOCK_SITE_URL);

  return { requestContext, token };
}

test.describe('PROXY Error Handling and GraphQL Tests', () => {
  test('POST /events should handle malformed JSON', async () => {
    const { requestContext, token } = await setup();
    const response = await requestContext.post('/events', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: '{"bad json"',
    });
    // Should return 400 Bad Request
    expect(response.status()).toBe(400);
  });

  test('POST /events should handle missing required fields', async () => {
    const { requestContext, token } = await setup();
    const response = await requestContext.post('/events', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: {
        event_name: 'page_view',
        // missing url, which is required
      },
    });
    // Assume API returns 400 for missing required fields
    expect(response.status()).toBe(400);
  });
});
