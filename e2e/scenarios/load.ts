import { randomUUID } from 'crypto';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENCY = 100;
const DURATION_SECONDS = 5;

async function sendEvent() {
  const eventPayload = {
    event_id: randomUUID(),
    event_name: 'load_test_event',
    site_name: 'load-test',
    url: 'http://localhost:60000/load-test',
    event_time: new Date().toISOString().replace('T', ' ').split('.')[0],
    created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
    visit_id: randomUUID(),
    visitor_id: randomUUID(),
    engagement_time: 0,
    referrer: '',
    user_agent: 'Load Test Agent',
    language: 'en-US',
    device: 'Server',
    device_type: 'server',
    device_vendor: 'LoadTester',
    os: 'Linux',
    os_version: '1.0',
    app: 'NodeJS',
    app_type: 'browser',
    app_version: '1.0',
    title: 'Load Test',
    type: 'website',
    image: '',
    description: 'Load Test Event',
    locale: 'en-US',
    published_time: null,
    modified_time: null,
    expiration_time: null,
    authors: [],
    section: 'load-test',
    tags: [],
    query_params: {},
  };

  try {
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function runLoadTest() {
  console.log(
    `Starting Load Test: ${CONCURRENCY} concurrent requests for ${DURATION_SECONDS} seconds...`
  );
  const startTime = Date.now();
  let totalSent = 0;
  let successCount = 0;

  const runWorker = async () => {
    while (Date.now() - startTime < DURATION_SECONDS * 1000) {
      const success = await sendEvent();
      totalSent++;
      if (success) successCount++;
    }
  };

  const workers = Array(CONCURRENCY)
    .fill(null)
    .map(() => runWorker());
  await Promise.all(workers);

  const duration = (Date.now() - startTime) / 1000;
  console.log(`
Load Test Completed in ${duration.toFixed(2)}s`);
  console.log(`Total Requests: ${totalSent}`);
  console.log(
    `Success Rate: ${((successCount / totalSent) * 100).toFixed(2)}%`
  );
  console.log(`RPS: ${(totalSent / duration).toFixed(2)}`);
}

runLoadTest().catch(console.error);
