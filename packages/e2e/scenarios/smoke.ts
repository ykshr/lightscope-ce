import { strict as assert } from 'assert';
import { generatePayload } from '../utils/generator';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function main() {
  console.log('Starting E2E Test...');

  // 1. Send Event
  const eventPayload = generatePayload({
    event_name: 'page_view',
    site_name: 'localhost',
    url: 'http://localhost:5173/test-page',
    user_agent: 'E2E Test Agent',
  });

  console.log('Sending event...', eventPayload.event_id);
  const eventRes = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
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
