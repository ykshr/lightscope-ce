import { describe, it, expect } from 'vitest';

const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';

describe('API Integration Test', () => {
  it('should return health check', async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('OK');
  });

  it('should return GraphQL error for missing query', async () => {
    const res = await fetch(`${API_URL}/gql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400); // Bad request or missing query
  });
});
