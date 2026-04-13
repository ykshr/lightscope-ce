import { describe, it, expect } from 'vitest';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:3000';

describe('Web Integration Test', () => {
  it('should return the index HTML page', async () => {
    const res = await fetch(`${WEB_URL}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<!doctype html>');
  });
});
