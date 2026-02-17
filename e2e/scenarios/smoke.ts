import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function main() {
  console.log('Starting E2E Test...');

  // 1. Send Event
  const eventPayload = {
    event_id: randomUUID(),
    event_name: 'page_view',
    site_name: 'localhost',
    url: 'http://localhost:60000/test-page',
    event_time: new Date().toISOString().replace('T', ' ').split('.')[0],
    created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
    engagement_time: 0,
    visit_id: randomUUID(),
    visitor_id: randomUUID(),
    referrer: '',
    user_agent: 'E2E Test Agent',
    language: 'en-US',
    device: 'Test Device',
    device_type: 'desktop',
    device_vendor: 'Test Vendor',
    os: 'Test OS',
    os_version: '1.0',
    app: 'Test Browser',
    app_type: 'browser',
    app_version: '1.0',
    title: 'Test Page Title',
    type: 'website',
    image: '',
    description: 'Test Description',
    locale: 'en-US',
    published_time: null,
    modified_time: null,
    expiration_time: null,
    authors: [],
    section: 'test',
    tags: [],
    query_params: {},
  };

  console.log('Sending event...', eventPayload.event_id);
  const eventRes = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventPayload),
  });

  if (!eventRes.ok) {
    const text = await eventRes.text();
    throw new Error(`Failed to send event: ${eventRes.status} ${text}`);
  }
  console.log('Event sent successfully.');

  // 2. Wait for ClickHouse ingestion (buffer flush is 200ms usually, but give it 2s)
  console.log('Waiting for ingestion...');
  await new Promise((r) => setTimeout(r, 2000));

  // 3. Query GraphQL
  const query = `
    query {
      rank(
        startDate: "${new Date(Date.now() - 3600000).toISOString()}"
        endDate: "${new Date(Date.now() + 3600000).toISOString()}"
        limit: 10
      ) {
        total
        articles {
          url
          value
        }
      }
    }
  `;

  console.log('Querying GraphQL...');
  const gqlRes = await fetch(`${API_URL}/gql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!gqlRes.ok) {
    const text = await gqlRes.text();
    throw new Error(`Failed to query GraphQL: ${gqlRes.status} ${text}`);
  }

  const gqlData = await gqlRes.json();
  console.log('GraphQL Response:', JSON.stringify(gqlData, null, 2));

  if (gqlData.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(gqlData.errors)}`);
  }

  // 4. Verify
  const articles = gqlData.data?.rank?.articles || [];
  const found = articles.find((a: any) => a.url === eventPayload.url);

  if (found) {
    console.log('Test Passed: Found article in rank results.');
  } else {
    console.error('Test Failed: Article not found in rank results.');
    // Don't throw error if data is empty, might be timing issue or empty DB logic
    // But strictly it's a failure.
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
