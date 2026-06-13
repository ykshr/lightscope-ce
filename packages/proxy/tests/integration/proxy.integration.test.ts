import { createApp } from '@/app';
import createContext from '@/createContext';
import { AlgorithmTypes, sign } from 'hono/jwt';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const mockClickhouseClient = {
  insert: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ data: [] }) }),
  ping: vi.fn().mockResolvedValue(true),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@clickhouse/client', () => ({
  createClient: vi.fn(() => mockClickhouseClient),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'ci-test-secret-do-not-use-in-prod';
const JWT_ALGORITHM = AlgorithmTypes.HS256;

// Bind mocked env variables
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_ALGORITHM = JWT_ALGORITHM;
process.env.CLICKHOUSE_URL = 'http://localhost:8123';
process.env.CLICKHOUSE_USERNAME = 'default';
process.env.CLICKHOUSE_PASSWORD = '';

const app = createApp(createContext);

describe('Proxy Integration Test', () => {
  const origin = 'https://example.com';
  let validToken: string;

  beforeAll(async () => {
    validToken = await sign(
      {
        organizationId: 'org_123',
        origin,
        exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
      },
      JWT_SECRET,
      JWT_ALGORITHM
    );
  });

  const createValidPayload = () => ({
    event_id: crypto.randomUUID(),
    event_name: 'page_view',
    event_time_utc: new Date().toISOString(),
    event_time: new Date().toISOString(),
    created_at: new Date().toISOString(),
    visit_id: crypto.randomUUID(),
    visitor_id: crypto.randomUUID(),
    url: 'https://example.com/page1',
    site_name: 'Test Site',
    title: 'Test Title',
    locale: 'en-US',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  });

  it('should return health check', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
  });

  describe('Events Endpoint (Normal Cases)', () => {
    it('should accept valid required payload', async () => {
      const payload = createValidPayload();
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual({ ok: true });
    });

    it('should accept valid payload with optional fields', async () => {
      const payload = {
        ...createValidPayload(),
        engagement_time: 120,
        referrer: 'https://google.com',
        'og:title': 'Test Page',
      };
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual({ ok: true });
    });
  });

  describe('Events Endpoint (Abnormal Cases)', () => {
    it('should reject malformed event data', async () => {
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: 'bad-json',
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Bad request: Invalid JSON');
    });

    it('should reject missing Authorization header', async () => {
      const payload = createValidPayload();
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(401);
    });

    it('should reject invalid JWT token', async () => {
      const payload = createValidPayload();
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid_token',
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(401);
    });

    it('should reject missing Origin header', async () => {
      const payload = createValidPayload();
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(401);
    });

    it('should reject mismatched Origin header', async () => {
      const payload = createValidPayload();
      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: 'https://malicious.com',
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(401);
    });

    it('should reject payload missing required fields', async () => {
      const payload = createValidPayload();
      // @ts-ignore
      delete payload.event_id;

      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(400);
    });

    it('should reject payload with invalid url format', async () => {
      const payload = {
        ...createValidPayload(),
        url: 'not-a-url',
      };

      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(400);
    });

    it('should reject invalid data types for optional fields', async () => {
      const payload = {
        ...createValidPayload(),
        event_time: null, // not allowed value
      };

      const res = await app.request('/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${validToken}`,
          Origin: origin,
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(400);
    });
  });
});
