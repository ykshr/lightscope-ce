import { randomUUID } from 'crypto';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const DURATION_SECONDS = parseInt(process.argv[2] || '60', 10);
const INTERVAL_MS = 1000;

async function sendEvent() {
  const eventPayload = {
    event_id: randomUUID(),
    event_name: 'long_run_event',
    site_name: 'long-run-test',
    url: 'http://localhost:60000/long-run-page',
    event_time: new Date().toISOString().replace('T', ' ').split('.')[0],
    created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
    visit_id: randomUUID(),
    visitor_id: randomUUID(),
    engagement_time: 0,
    referrer: '',
    user_agent: 'Long Run Test Agent',
    language: 'en-US',
    device: 'NodeJS',
    device_type: 'server',
    device_vendor: 'LongRunner',
    os: 'Linux',
    os_version: '1.0',
    app: 'NodeJS',
    app_type: 'browser',
    app_version: '1.0',
    title: 'Long Run Test',
    type: 'website',
    image: '',
    description: 'Long Run Event',
    locale: 'en-US',
    published_time: null,
    modified_time: null,
    expiration_time: null,
    authors: [],
    section: 'long-run',
    tags: [],
    query_params: {},
  };

  try {
    const res = await fetch(`${API_URL}/events`, {
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
  await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for ingestion

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
