import { Tracker } from '@/trackers/tracker';
import { beforeEach, describe, expect, test } from 'vitest';

describe('Metadata Extraction', () => {
  beforeEach(() => {
    // Reset global mocks
    const localStorageMock = {
      getItem: () => null,
      setItem: () => {},
    };
    global.localStorage = localStorageMock as any;

    vi.stubGlobal('window', {
      location: {
        hostname: 'example.com',
        pathname: '/test',
        href: 'https://example.com/test',
      },
      navigator: { language: 'en-US' },
      addEventListener: () => {},
      setInterval: () => {},
      localStorage: localStorageMock,
      crypto: {
        randomUUID: () => 'uuid',
      },
    };

    vi.stubGlobal('document', {
      title: 'Page Title',
      location: global.window.location,
      addEventListener: () => {},
      querySelectorAll: () => [],
      currentScript: {
        getAttribute: () => null,
      },
    } as any;

    vi.stubGlobal('navigator', { language: 'en-US' });

    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
    vi.stubGlobal('MutationObserver', class {
      observe() {}
      disconnect() {}
    } as any;
  });

  test('should extract basic metadata', () => {
    const metaData = [
      { property: 'og:title', content: 'Test Title' },
      { name: 'description', content: 'Test Description' },
    ];
    global.document.getElementsByTagName = ((tagName: string) => {
      if (tagName === 'meta') {
        return metaData.map((m) => ({
          getAttribute: (attr: string) => (m as any)[attr] || null,
        }));
      }
      return [];
    }) as any;

    const tracker = new Tracker('http://api', { token: 'token' });
    const metadata = (tracker as any).pageMetadata;

    expect(metadata['og:title']).toBe('Test Title');
    expect(metadata['og:description']).toBe('Test Description');
  });

  test('should handle multiple values for same property (arrays)', () => {
    const metaData = [
      { property: 'article:author', content: 'Author 1' },
      { property: 'article:author', content: 'Author 2' },
      { property: 'article:tag', content: 'Tag 1' },
    ];
    global.document.getElementsByTagName = ((tagName: string) => {
      if (tagName === 'meta') {
        return metaData.map((m) => ({
          getAttribute: (attr: string) => (m as any)[attr] || null,
        }));
      }
      return [];
    }) as any;

    const tracker = new Tracker('http://api', { token: 'token' });
    const metadata = (tracker as any).pageMetadata;

    expect(metadata['article:authors']).toEqual(['Author 1', 'Author 2']);
    expect(metadata['article:tags']).toEqual(['Tag 1']);
  });

  test('should avoid duplicates when name and property are identical', () => {
    const metaData = [{ property: 'article:author', name: 'article:author', content: 'Author 1' }];
    global.document.getElementsByTagName = ((tagName: string) => {
      if (tagName === 'meta') {
        return metaData.map((m) => ({
          getAttribute: (attr: string) => (m as any)[attr] || null,
        }));
      }
      return [];
    }) as any;

    const tracker = new Tracker('http://api', { token: 'token' });
    const metadata = (tracker as any).pageMetadata;

    expect(metadata['article:authors']).toEqual(['Author 1']);
  });

  test('should be resistant to prototype pollution', () => {
    const metaData = [{ property: 'toString', content: 'polluted' }];
    global.document.getElementsByTagName = ((tagName: string) => {
      if (tagName === 'meta') {
        return metaData.map((m) => ({
          getAttribute: (attr: string) => (m as any)[attr] || null,
        }));
      }
      return [];
    }) as any;

    // This should not throw even if "toString" is a key
    expect(() => new Tracker('http://api', { token: 'token' })).not.toThrow();
  });

  test('should skip tags with no content or empty content', () => {
    const metaData = [
      { property: 'og:title', content: '' },
      { property: 'og:description' }, // content is undefined
      { property: 'og:image', content: 'http://image.jpg' },
    ];
    global.document.getElementsByTagName = ((tagName: string) => {
      if (tagName === 'meta') {
        return metaData.map((m) => ({
          getAttribute: (attr: string) => (m as any)[attr] || null,
        }));
      }
      return [];
    }) as any;

    const tracker = new Tracker('http://api', { token: 'token' });
    const metadata = (tracker as any).pageMetadata;

    expect(metadata['og:title']).toBe('Page Title');
    expect(metadata['og:description']).toBe('');
    expect(metadata['og:image']).toBe('http://image.jpg');
  });
});
