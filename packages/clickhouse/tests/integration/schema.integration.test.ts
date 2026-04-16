import { describe, it, expect } from 'vitest';

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://127.0.0.1:8123';
const username = process.env.CLICKHOUSE_USERNAME || 'lightscope';
const password = process.env.CLICKHOUSE_PASSWORD || 'lightscope';
const db = process.env.CLICKHOUSE_DB || 'lightscope';

const query = async (q: string) => {
  const res = await fetch(`${CLICKHOUSE_URL}?database=${db}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
    body: `${q} FORMAT JSON`,
  });
  if (!res.ok) {
    throw new Error(`Query failed: ${await res.text()}`);
  }
  return await res.json();
};

describe('Clickhouse Schema Integration Test', () => {
  it('should have all expected tables', async () => {
    const res = await query('SHOW TABLES');
    const tables = res.data.map((row: any) => Object.values(row)[0]);

    expect(tables).toContain('pv_raw');
    expect(tables).toContain('pv_min');
    expect(tables).toContain('pv_hour');
    expect(tables).toContain('pv_day');
    expect(tables).toContain('article');
  });

  it('should have all expected materialized views', async () => {
    const res = await query('SHOW TABLES');
    const tables = res.data.map((row: any) => Object.values(row)[0]);

    expect(tables).toContain('pv_raw_to_min_mv');
    expect(tables).toContain('pv_min_to_hour_mv');
    expect(tables).toContain('pv_hour_to_day_mv');
  });
});
