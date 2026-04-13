import { describe, it, expect } from 'vitest';

const PROXY_URL = process.env.PROXY_URL || 'http://127.0.0.1:3002';

describe('Proxy Integration Test', () => {
  it('should return health check', async () => {
    const res = await fetch(`${PROXY_URL}/health`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('OK');
  });

  it('should reject malformed event data', async () => {
    const res = await fetch(`${PROXY_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'bad-json',
    });
    expect(res.status).toBe(400);
  });
});
