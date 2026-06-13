import autocannon from 'autocannon';
import { faker } from '@faker-js/faker';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const PROXY_URL = process.env.PROXY_URL || 'http://localhost:3001';
const DURATION = 30; // seconds

async function benchmarkApi() {
  console.log('--- Benchmarking API Read Performance ---');

  const query = `
    query {
      rank(
        startDate: "${new Date(Date.now() - 7 * 24 * 3600000).toISOString()}"
        endDate: "${new Date().toISOString()}"
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

  return new Promise((resolve) => {
    const instance = autocannon(
      {
        url: `${API_URL}/graphql`,
        connections: 10,
        pipelining: 1,
        duration: DURATION,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      },
      console.log
    );

    instance.on('done', (result) => {
      console.log('API Benchmark Complete.');
      resolve(result);
    });
  });
}

async function benchmarkProxy() {
  console.log('--- Benchmarking Proxy Ingestion Performance ---');

  return new Promise((resolve) => {
    const instance = autocannon(
      {
        url: `${PROXY_URL}/events`,
        connections: 100,
        pipelining: 1,
        duration: DURATION,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        requests: [
          {
            setupRequest: (req) => {
              const payload = {
                event_id: faker.string.uuid(),
                event_name: 'page_view',
                event_time: new Date().toISOString(),
                event_time_utc: new Date().toISOString(),
                url: faker.internet.url(),
                site_name: 'test-site',
                user_id: faker.string.uuid(),
                visit_id: faker.string.uuid(),
                visitor_id: faker.string.uuid(),
                referrer: faker.internet.url(),
                user_agent: faker.internet.userAgent(),
              };
              req.body = JSON.stringify(payload);
              return req;
            },
          },
        ],
      },
      console.log
    );

    instance.on('done', (result) => {
      console.log('Proxy Benchmark Complete.');
      resolve(result);
    });
  });
}

async function main() {
  await benchmarkProxy();
  await benchmarkApi();
}

main().catch(console.error);
