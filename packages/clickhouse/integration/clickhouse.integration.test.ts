import { describe, it, expect } from 'vitest';

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://127.0.0.1:8123';

describe('Clickhouse Integration Test', () => {
  it('should respond to ping', async () => {
    const res = await fetch(`${CLICKHOUSE_URL}/ping`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.trim()).toBe('Ok.');
  });
});
