import eventsRouter, { createArticle, createPV } from '@/routers/events/index';
import { type Payload } from '@/types';
import { Hono } from 'hono';
import { describe, expect, it, vi } from 'vitest';

// Mock Payload data
const mockPayload: Payload = {
  url: 'https://example.com/article?utm_source=google&utm_medium=cpc',
  event_name: 'page_view',
  created_at: '2023-01-03T12:00:00Z',
  site_name: 'Example Site',
  title: 'Test Article',
  locale: 'en_US',
  'og:url': 'https://example.com/article',
  'og:title': 'Test Article',
  'og:type': 'article',
  'og:image': 'https://example.com/image.jpg',
  'og:description': 'Test Description',
  'og:site_name': 'Example Site',
  'og:locale': 'en_US',
  'article:published_time': '2023-01-01T00:00:00Z',
  'article:modified_time': '2023-01-02T00:00:00Z',
  'article:expiration_time': '2023-12-31T00:00:00Z',
  'article:authors': ['John Doe'],
  'article:section': 'Tech',
  'article:tags': ['testing', 'vitest'],
  referrer: 'https://google.com',
  event_id: 'evt_123',
  event_time_utc: '2023-01-03T12:00:00Z',
  event_time: '2023-01-03T12:00:00Z',
  user_agent: 'Mozilla/5.0 (Test)',
  user_id: 'user_123',
  visit_id: 'visit_123',
  visitor_id: 'visitor_123',
  device: 'Desktop',
  device_type: 'desktop',
  device_vendor: 'Apple',
  os: 'macOS',
  os_version: '13.0',
  app: 'Browser',
  app_type: 'browser',
  app_version: '1.0',
  age: '25-34',
  gender: 'male',
  language: 'en-US',
  event_value: 100,
};

describe('eventsRouter', () => {
  it('should process a valid payload and return 201', async () => {
    const app = new Hono();
    // Setup mock context environment expected by the router
    app.use('*', async (c, next) => {
      c.set('$' as any, {
        egress: {
          insertArticle: vi.fn().mockResolvedValue(undefined),
          insertPV: vi.fn().mockResolvedValue(undefined),
        },
        geo: {
          getGeoData: vi.fn().mockResolvedValue({
            continent: 'NA',
            country: 'US',
          }),
        },
      });
      c.set('tracker' as any, { organizationId: 'org_123' });
      await next();
    });
    app.route('/', eventsRouter);

    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPayload),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('should return 400 for invalid payload format', async () => {
    const app = new Hono();
    app.route('/', eventsRouter);

    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'payload' }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error).toBe('Invalid payload');
  });

  it('should return 400 for SyntaxError in JSON body', async () => {
    const app = new Hono();
    app.route('/', eventsRouter);

    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json{',
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error).toBe('Bad request: Invalid JSON');
  });

  it('should throw other errors', async () => {
    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('$' as any, {
        egress: {
          insertArticle: vi.fn().mockRejectedValue(new Error('DB Error')),
        },
      });
      c.set('tracker' as any, { organizationId: 'org_123' });
      await next();
    });
    app.route('/', eventsRouter);

    // Hono apps catch errors silently if no explicit error handler, returning 500
    // but the test environment setup might differ. We check the status to verify it fell through the handler
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockPayload),
    });

    expect(res.status).toBe(500);
  });
});

describe('processEvent', () => {
  describe('createArticle', () => {
    it('should create an article object from payload', () => {
      const article = createArticle('default', mockPayload);

      expect(article).toEqual({
        organization_id: 'default',
        url: 'https://example.com/article',
        title: 'Test Article',
        type: 'article',
        image: 'https://example.com/image.jpg',
        description: 'Test Description',
        site_name: 'Example Site',
        locale: 'en_US',
        published_time: '2023-01-01T00:00:00Z',
        modified_time: '2023-01-02T00:00:00Z',
        expiration_time: '2023-12-31T00:00:00Z',
        authors: ['John Doe'],
        section: 'Tech',
        tags: ['testing', 'vitest'],
      });
    });

    it('should use payload.url if og:url is missing', () => {
      const payload = { ...mockPayload };
      delete payload['og:url'];
      const article = createArticle('default', payload);
      expect(article.url).toBe('https://example.com/article');
    });

    it('should use site_name if og:site_name is missing', () => {
      const payload = { ...mockPayload };
      delete payload['og:site_name'];
      const article = createArticle('default', payload);
      expect(article.site_name).toBe('Example Site');
    });
  });

  describe('createPV', () => {
    it('should create a PV object from payload with full geo info', () => {
      const mockGeo = {
        continent: 'NA',
        country: 'US',
        subdivision: 'CA',
        city: 'San Francisco',
      };

      const pv = createPV('default', mockPayload, mockGeo);

      expect(pv.site_name).toBe('Example Site');
      expect(pv.event_id).toBe('evt_123');
      expect(pv.url).toBe('https://example.com/article'); // Uses og:url preference
      expect(pv.referrer).toBe('https://google.com');
      expect(pv.domain).toBe('google.com'); // From processReferrer
      expect(pv.geo_continent).toBe('NA');
      expect(pv.geo_country).toBe('US');
      expect(pv.geo_subdivision).toBe('CA');
      expect(pv.geo_city).toBe('San Francisco');
      expect(pv.utm_source).toBe('google');
      expect(pv.utm_medium).toBe('cpc');
      expect(pv.engagement_time).toBe(100);
    });

    it('should handle missing geo info', () => {
      const pv = createPV('default', mockPayload, null);

      expect(pv.geo_continent).toBeUndefined();
      expect(pv.geo_country).toBeUndefined();
      expect(pv.geo_subdivision).toBeUndefined();
      expect(pv.geo_city).toBeUndefined();
    });

    it('should extract query params from url', () => {
      const payloadWithParams = {
        ...mockPayload,
        url: 'https://example.com/article?foo=bar&utm_source=test',
      };
      const pv = createPV('default', payloadWithParams, null);

      expect(pv.query_params?.['foo']).toBe('bar');
      expect(pv.utm_source).toBe('test');
    });

    it('should throw an error for invalid URL', () => {
      const payload = {
        ...mockPayload,
        'og:url': 'invalid-url',
        url: 'invalid-url',
      };
      expect(() => createPV('default', payload, null)).toThrow('Invalid URL');
    });
  });
});
