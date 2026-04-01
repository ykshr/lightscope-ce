import { generatePayload } from '../utils/generator';

const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';
const INSERT_URL = process.env.INSERT_URL || 'http://127.0.0.1:3002';
const DURATION_SECONDS = parseInt(process.argv[2] || '60', 10);
const INTERVAL_MS = 1000;
const ONE_HOUR_MS = 3600000;

async function sendEvent() {
  const eventPayload = generatePayload({
    event_name: 'long_run_event',
    site_name: 'long-run-test',
    url: 'http://127.0.0.1:5173/long-run-page',
    user_agent: 'Long Run Test Agent',
  });

  try {
    const res = await fetch(`${INSERT_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const gqlRes = await fetch(`${API_URL}/gql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  const timer = setInterval(() => {
    if (Date.now() - startTime >= DURATION_SECONDS * 1000) {
      clearInterval(timer);
      console.log(`Finished sending events. Total sent: ${sentCount}`);
      verifyData();
    } else {
      sendEvent();
      sentCount++;
    }
  }, INTERVAL_MS);
}

runLongRunTest().catch(console.error);
