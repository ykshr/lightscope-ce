import { test, expect } from '@playwright/test';
import { generatePayload, generateMinimalPayload } from '../utils/generator';

const API_URL = 'http://localhost:3000';

const sendPayload = async (payload: any) => {
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response;
};

const queryRank = async () => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const query = `
    query {
      rank(
        startDate: "${oneDayAgo.toISOString()}"
        endDate: "${oneHourLater.toISOString()}"
        limit: 100
      ) {
        articles {
          url
          title
        }
      }
    }
  `;

  const response = await fetch(`${API_URL}/gql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return response.json();
};

test.describe('Data Generator Verification', () => {
  test('Individual Case: Minimal Payload', async () => {
    const payload = generateMinimalPayload();
    // Override URL to be unique and identifiable
    const uniqueUrl = `http://e2e-minimal-${Date.now()}.com/article`;
    payload.url = uniqueUrl;
    // Set time to now to ensure it's captured in recent query
    const now = new Date().toISOString();
    payload.event_time = now;
    payload.event_time_utc = now;

    console.log(`Sending minimal payload for URL: ${uniqueUrl}`);
    const res = await sendPayload(payload);
    expect(res.status).toBe(201);

    // Wait for ingestion
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify
    const gqlData = await queryRank();
    const articles = gqlData.data?.rank?.articles || [];
    const found = articles.find((a: any) => a.url === uniqueUrl);
    expect(found).toBeTruthy();
    console.log('Minimal payload verified via GraphQL.');
  });

  test('Individual Case: Full Payload', async () => {
    const payload = generatePayload();
    const uniqueUrl = `http://e2e-full-${Date.now()}.com/article`;
    payload.url = uniqueUrl;
    payload['og:title'] = 'Full Payload E2E Test Title';
    const now = new Date().toISOString();
    payload.event_time = now;
    payload.event_time_utc = now;

    console.log(`Sending full payload for URL: ${uniqueUrl}`);
    const res = await sendPayload(payload);
    expect(res.status).toBe(201);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const gqlData = await queryRank();
    const articles = gqlData.data?.rank?.articles || [];
    const found = articles.find((a: any) => a.url === uniqueUrl);
    expect(found).toBeTruthy();
    expect(found.title).toBe('Full Payload E2E Test Title');
    console.log('Full payload verified via GraphQL.');
  });

  test('Composite Case: Random Payloads', async () => {
    const count = 5; // Generate 5 random payloads
    const payloads = [];
    for (let i = 0; i < count; i++) {
      const p = generatePayload();
      p.url = `http://e2e-random-${Date.now()}-${i}.com/article`;
      p['og:title'] = `Random Payload ${i}`;
      const now = new Date().toISOString();
      p.event_time = now;
      p.event_time_utc = now;
      payloads.push(p);
    }

    console.log(`Sending ${count} random payloads...`);
    for (const p of payloads) {
      const res = await sendPayload(p);
      expect(res.status).toBe(201);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const gqlData = await queryRank();
    const articles = gqlData.data?.rank?.articles || [];
    
    // Verify all sent payloads are present
    for (const p of payloads) {
      const found = articles.find((a: any) => a.url === p.url);
      expect(found, `URL ${p.url} not found in GraphQL results`).toBeTruthy();
      expect(found.title).toBe(p['og:title']);
    }
    console.log('All random payloads verified via GraphQL.');
  });
});
