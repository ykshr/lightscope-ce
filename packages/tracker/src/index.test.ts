import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock ua-parser-js at the module level.
vi.mock('ua-parser-js', () => {
  return {
    UAParser: class {
      getResult() {
        return {
          browser: { name: 'Chrome', version: '120' },
          os: { name: 'Windows', version: '10' },
          device: { model: 'PC', type: 'desktop', vendor: 'Unknown' },
        };
      }
    },
  };
});

// Pre-define globals used by initialization
global.window = {
  location: {
    hostname: 'localhost',
    pathname: '/',
    search: '',
    href: 'http://localhost/',
  },
  setInterval: () => 1,
  clearInterval: () => {},
} as any;

global.document = {
  title: 'Test Page',
  referrer: '',
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => ({}),
  body: {
    appendChild: () => {},
  },
} as any;

global.navigator = {
  language: 'en-US',
  userAgent: 'test-ua',
} as any;

const store: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: any) => {
    store[key] = value.toString();
  },
} as any;

global.crypto = {
  randomUUID: () => 'test-uuid',
} as any;

global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

global.MutationObserver = class {
  observe() {}
  disconnect() {}
} as any;

import { AnalyticsTracker } from './index';

describe('AnalyticsTracker', () => {
  let tracker: AnalyticsTracker;
  const apiEndpoint = 'https://api.example.com/events';
  const config = { token: 'test-token' };

  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response)) as any;
    tracker = new AnalyticsTracker(apiEndpoint, config);
  });

  afterEach(() => {
    tracker.destroy();
  });

  test('should not crash when fetch fails', async () => {
    // Mock fetch to reject
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

    // This should not throw because of the try-catch block in sendEvent
    try {
      await tracker.trackPageView();
    } catch (e) {
      throw new Error('Tracker should have caught the fetch error');
    }

    expect(global.fetch).toHaveBeenCalled();
  });
});
