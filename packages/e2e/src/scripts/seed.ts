import { createClient } from '@clickhouse/client';
import { faker } from '@faker-js/faker';

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://localhost:8123';
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER || 'lightscope';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD || 'lightscope';
const CLICKHOUSE_DATABASE = process.env.CLICKHOUSE_DATABASE || 'lightscope';

const BATCH_SIZE = 100_000;
const TOTAL_ROWS = 1_000_000;

const client = createClient({
  url: CLICKHOUSE_URL,
  username: CLICKHOUSE_USER,
  password: CLICKHOUSE_PASSWORD,
  database: CLICKHOUSE_DATABASE,
});

async function seed() {
  console.log(`Starting to seed ${TOTAL_ROWS} rows...`);
  const orgId = faker.string.uuid();

  for (let i = 0; i < TOTAL_ROWS; i += BATCH_SIZE) {
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_ROWS - i);
    const rows = [];

    for (let j = 0; j < currentBatchSize; j++) {
      rows.push({
        event_id: faker.string.uuid(),
        organization_id: orgId,
        site_name: 'test-site',
        url: faker.internet.url(),
        event_time: new Date().toISOString().substring(0, 19).replace('T', ' '),
        user_id: faker.string.uuid(),
        visit_id: faker.string.uuid(),
        visitor_id: faker.string.uuid(),
        domain: faker.internet.domainName(),
        referrer: faker.internet.url(),
        device: 'unknown',
        device_type: 'desktop',
        device_vendor: 'unknown',
        os: 'macOS',
        os_version: '10.15.7',
        app: 'Chrome',
        app_type: 'browser',
        app_version: '120.0.0.0',
        age: '25-34',
        gender: 'unknown',
        geo_continent: 'NA',
        geo_country: 'US',
        geo_subdivision: 'CA',
        geo_city: 'San Francisco',
        query_params: {},
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        language: 'en-US',
        engagement_time: 0,
        created_at: new Date().toISOString().substring(0, 19).replace('T', ' '),
      });
    }

    await client.insert({
      table: 'pv_raw',
      values: rows,
      format: 'JSONEachRow',
    });

    console.log(`Inserted ${i + currentBatchSize} of ${TOTAL_ROWS} rows`);
  }

  console.log('Seeding complete.');
}

seed()
  .catch(console.error)
  .finally(() => client.close());
