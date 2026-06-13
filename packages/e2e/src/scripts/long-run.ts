import { generateToken } from '@/setup/tracker';
import { generatePayload } from '@/utils/generator';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3001';
const DURATION_SECONDS = parseInt(process.argv[2] || '60', 10);
const INTERVAL_MS = 1000;
const ONE_HOUR_MS = 3600000;

async function sendEvent(token: string) {
  const eventPayload = generatePayload({
    event_name: 'long_run_event',
    site_name: 'long-run-test',
    url: 'http://example.com/long-run-page',
    user_agent: 'Long Run Test Agent',
  });

  try {
    const res = await fetch(`${PROXY_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(eventPayload),
    });
    if (res.ok) {
      console.log(`Sent event at ${new Date().toISOString()}`);
    } else {
      console.error(`Failed to send event: ${res.status}`);
    }
  } catch (e) {
    console.error('Error sending event:', e);
  }
}

async function verifyData() {
  console.log('Verifying data in ClickHouse...');
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for ingestion

  const query = `
    query {
      rank(
        startDate: "${new Date(Date.now() - ONE_HOUR_MS).toISOString()}"
        endDate: "${new Date(Date.now() + ONE_HOUR_MS).toISOString()}"
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

  try {
    const gqlRes = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query }),
    });

    const gqlData = await gqlRes.json();
    const articles = gqlData.data?.rank?.articles || [];
    const found = articles.find((a: any) => a.url.includes('long-run-page'));

    if (found) {
      console.log(`Success: Found ${found.value} events for long-run-page.`);
    } else {
      console.error('Failed: Could not find long-run-page events.');
    }
  } catch (e) {
    console.error('Error querying GraphQL:', e);
  }
}

async function runLongRunTest() {
  console.log(`Starting Long Run Test for ${DURATION_SECONDS} seconds...`);
  const startTime = Date.now();
  let sentCount = 0;

  const org = JSON.parse(process.env.ORG_DATA || '{}');
  const token = await generateToken(org.id as string, 'http://localhost');

  const timer = setInterval(() => {
    if (Date.now() - startTime >= DURATION_SECONDS * 1000) {
      clearInterval(timer);
      console.log(`Finished sending events. Total sent: ${sentCount}`);
      verifyData();
    } else {
      sendEvent(token);
      sentCount++;
    }
  }, INTERVAL_MS);
}

runLongRunTest().catch(console.error);
