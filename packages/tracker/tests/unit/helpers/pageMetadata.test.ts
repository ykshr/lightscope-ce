import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { extractPageMetadata } from '@/helpers/pageMetadata';

describe('extractPageMetadata', () => {
  let metaData: Array<{ property?: string; name?: string; content?: string }> = [];

  beforeEach(() => {
    metaData = [];

    vi.stubGlobal('window', {
      location: {
        hostname: 'example.com',
        pathname: '/shop/item/123',
        href: 'https://example.com/shop/item/123',
      },
    });

    vi.stubGlobal('document', {
      title: 'Default Page Title',
      getElementsByTagName: vi.fn((tag) => {
        if (tag === 'meta') {
          return metaData.map((m) => ({
            getAttribute: (attr: string) => (m as any)[attr] || null,
          }));
        }
        return [];
      }),
    });

    vi.stubGlobal('navigator', {
      language: 'en-US',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('should extract basic metadata correctly using fallbacks', () => {
    const metadata = extractPageMetadata();
    expect(metadata.title).toBe('Default Page Title');
    expect(metadata.url).toBe('https://example.com/shop/item/123');
    expect(metadata.locale).toBe('en-US');
    expect(metadata.site_name).toBe('/shop');
  });

  test('should extract OpenGraph and article scalar metadata', () => {
    metaData = [
      { property: 'og:title', content: 'OG Title' },
      { property: 'og:description', content: 'OG Description' },
      { property: 'og:image', content: 'https://example.com/image.png' },
      { property: 'og:url', content: 'https://example.com/og-url' },
      { property: 'og:site_name', content: 'OG Site Name' },
      { property: 'og:locale', content: 'en-GB' },
      { property: 'og:type', content: 'article' },
      { property: 'article:section', content: 'Technology' },
    ];

    const metadata = extractPageMetadata();

    expect(metadata['og:title']).toBe('OG Title');
    expect(metadata['og:description']).toBe('OG Description');
    expect(metadata['og:image']).toBe('https://example.com/image.png');
    expect(metadata['og:url']).toBe('https://example.com/og-url');
    expect(metadata['og:site_name']).toBe('OG Site Name');
    expect(metadata['og:locale']).toBe('en-GB');
    expect(metadata['og:type']).toBe('article');
    expect(metadata['article:section']).toBe('Technology');
  });

  test('should fallback to description if og:description is missing', () => {
    metaData = [{ name: 'description', content: 'Fallback Description' }];

    const metadata = extractPageMetadata();
    expect(metadata['og:description']).toBe('Fallback Description');
  });

  test('should extract og:image correctly based on priority', () => {
    metaData = [
      { property: 'og:image:secure_url', content: 'https://secure.com/image.png' },
      { property: 'og:image:url', content: 'http://insecure.com/image.png' },
      { property: 'og:image', content: 'http://fallback.com/image.png' },
    ];

    const metadataSecure = extractPageMetadata();
    expect(metadataSecure['og:image']).toBe('https://secure.com/image.png');

    metaData = [
      { property: 'og:image:url', content: 'http://insecure.com/image.png' },
      { property: 'og:image', content: 'http://fallback.com/image.png' },
    ];
    const metadataUrl = extractPageMetadata();
    expect(metadataUrl['og:image']).toBe('http://insecure.com/image.png');
  });

  test('should format date properties correctly', () => {
    metaData = [
      { property: 'article:published_time', content: '2023-10-01T12:00:00Z' },
      { property: 'article:modified_time', content: '2023-10-02T15:30:00.000Z' },
      { property: 'article:expiration_time', content: 'invalid-date' },
    ];

    const metadata = extractPageMetadata();
    expect(metadata['article:published_time']).toBe('2023-10-01 12:00:00');
    expect(metadata['article:modified_time']).toBe('2023-10-02 15:30:00');
    expect(metadata['article:expiration_time']).toBeUndefined();
  });

  test('should extract array properties correctly', () => {
    metaData = [
      { property: 'article:author', content: 'Author One' },
      { property: 'article:author', content: 'Author Two' },
      { property: 'article:tag', content: 'Tag1' },
      { property: 'article:tag', content: 'Tag2' },
    ];

    const metadata = extractPageMetadata();
    expect(metadata['article:authors']).toEqual(['Author One', 'Author Two']);
    expect(metadata['article:tags']).toEqual(['Tag1', 'Tag2']);
  });

  test('should avoid duplication if name and property match', () => {
    metaData = [
      { property: 'article:author', name: 'article:author', content: 'Duplicate Author' },
    ];

    const metadata = extractPageMetadata();
    expect(metadata['article:authors']).toEqual(['Duplicate Author']);
  });

  test('should skip meta tags without content', () => {
    metaData = [
      { property: 'og:title', content: '' },
      { property: 'og:title' }, // no content
    ];

    const metadata = extractPageMetadata();
    expect(metadata['og:title']).toBeUndefined();
  });

  test('should allow overriding metadata with pageMetadata argument', () => {
    metaData = [{ property: 'og:title', content: 'Original Title' }];

    const override = {
      title: 'Overridden Page Title',
      'og:title': 'Overridden OG Title',
    };

    const metadata = extractPageMetadata(override);

    expect(metadata.title).toBe('Overridden Page Title');
    expect(metadata['og:title']).toBe('Overridden OG Title');
    expect(metadata.url).toBe('https://example.com/shop/item/123'); // still extracts others
  });
});
