import { type Payload } from '@/types';
import { describe, expect, it } from 'vitest';
import { createArticle, createPV } from '@/routers/events/index';

// Mock Payload data
const mockPayload: Payload = {
  url: 'https://example.com/article?utm_source=google&utm_medium=cpc',
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
  engagement_time: 100,
};

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
      // Note: mockPayload.url has query params, createPV strips them in PV but createArticle takes exact string
      // The implementation uses: const url = payload['og:url'] || payload.url;
      const article = createArticle('default', payload);
      expect(article.url).toBe('https://example.com/article?utm_source=google&utm_medium=cpc');
    });

    it('should default site_name to "unknown" if missing', () => {
      const payload = { ...mockPayload };
      delete payload['og:site_name'];
      const article = createArticle('default', payload);
      expect(article.site_name).toBe('unknown');
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
      expect(pv.utm_source).toBeUndefined();
      expect(pv.utm_medium).toBeUndefined();
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
      // payload.url has query params, but createPV prefers og:url if present.
      // If we want to test extraction from the *active* url, we rely on the implementation logic.
      // The implementation takes `url` (og:url || url) and parses it.
      // mockPayload['og:url'] does NOT have params.
      // mockPayload.url DOES have params.

      // Case 1: og:url present (no params in this mock), but payload.url has params.
      // The implementation uses `const url = payload['og:url'] || payload.url;`
      // Then `new URL(url).searchParams`.
      // So if og:url is used, and it has no params, query_params will be empty.

      // Let's modify payload to have params in og:url for this test case
      const payloadWithParamsInOg = {
        ...mockPayload,
        'og:url': 'https://example.com/article?foo=bar&utm_source=test',
      };
      const pv = createPV('default', payloadWithParamsInOg, null);

      expect(pv.query_params?.['foo']).toBe('bar');
      expect(pv.utm_source).toBe('test');
    });

    it('should handle invalid URL gracefully', () => {
      const payload = {
        ...mockPayload,
        'og:url': 'invalid-url',
        url: 'invalid-url',
      };
      // Implementation wraps URL parsing in try/catch
      const pv = createPV('default', payload, null);
      expect(pv.query_params).toEqual({});
    });
  });
});
