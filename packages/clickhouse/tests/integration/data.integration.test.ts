import { describe, it, expect, beforeAll } from 'vitest';

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

const insert = async (table: string, data: any[]) => {
  const jsonEachRow = data.map((row) => JSON.stringify(row)).join('\n');
  const res = await fetch(
    `${CLICKHOUSE_URL}?database=${db}&query=INSERT INTO ${table} FORMAT JSONEachRow`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      },
      body: jsonEachRow,
    }
  );
  if (!res.ok) {
    throw new Error(`Insert failed: ${await res.text()}`);
  }
};

describe('Clickhouse Data Flow Integration Test', () => {
  beforeAll(async () => {
    // Clear out tables if any existing data
    try {
      await query('SYSTEM FLUSH LOGS');
    } catch (e) {}
  });

  it('should process pv_raw through materialized views', async () => {
    const orgId = 'test_org';
    const siteName = 'test_site';
    const url = 'https://example.com/test';

    // Using current time rounded to previous minute
    const now = new Date();
    const eventTime = new Date(Math.floor(now.getTime() / 60000) * 60000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    const testData = [
      {
        event_id: 'evt_1',
        organization_id: orgId,
        site_name: siteName,
        url: url,
        event_time: eventTime,
        user_id: 'user_1',
        visit_id: 'visit_1',
        visitor_id: 'visitor_1',
        domain: 'example.com',
        device: 'desktop',
        device_type: 'PC',
        device_vendor: 'Apple',
        os: 'Mac',
        app: 'Safari',
        engagement_time: 10,
      },
    ];

    await insert('pv_raw', testData);

    // Give MVs a tiny moment to process (ClickHouse MVs are synchronous on insert, so it should be immediate)

    const minRes = await query(`SELECT * FROM pv_min WHERE site_name = '${siteName}'`);
    expect(minRes.data.length).toBeGreaterThanOrEqual(1);
    expect(Number(minRes.data[0].engagement_time)).toBe(10);

    // Check hour rollup
    const hourRes = await query(`SELECT * FROM pv_hour WHERE site_name = '${siteName}'`);
    expect(hourRes.data.length).toBeGreaterThanOrEqual(1);

    // Check day rollup
    const dayRes = await query(`SELECT * FROM pv_day WHERE site_name = '${siteName}'`);
    expect(dayRes.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle invalid inserts gracefully (client error)', async () => {
    const testData = [
      {
        event_id: 'evt_2',
        engagement_time: 'not a number', // Invalid type
      },
    ];

    await expect(insert('pv_raw', testData)).rejects.toThrow(/Insert failed/);
  });
});
