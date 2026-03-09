import { generatePayload } from '../utils/generator';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const INSERT_URL = process.env.INSERT_URL || 'http://localhost:3001';
const CONCURRENCY = 100;
const DURATION_SECONDS = 5;

async function sendEvent() {
  const eventPayload = generatePayload({
    event_name: 'load_test_event',
    site_name: 'load-test',
    url: 'http://localhost:5173/load-test',
    user_agent: 'Load Test Agent',
  });

  try {
    const res = await fetch(`${INSERT_URL}/events`, {
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
  console.log(`Success Rate: ${((successCount / totalSent) * 100).toFixed(2)}%`);
  console.log(`RPS: ${(totalSent / duration).toFixed(2)}`);
}

runLoadTest().catch(console.error);
