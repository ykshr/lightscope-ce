import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { initPerformanceTracking } from '@/features/performanceTracking';
import type { Tracker } from '@/trackers/tracker';

describe('PerformanceTracking', () => {
  let mockTracker: Partial<Tracker>;

  beforeEach(() => {
    mockTracker = {
      trackPageEvent: vi.fn(),
    };

    // Setup window environment
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('should not crash if PerformanceObserver throws', () => {
    // Mock PerformanceObserver to throw
    vi.stubGlobal('window', {
      PerformanceObserver: class {
        constructor() {
          throw new Error('PerformanceObserver error');
        }
        observe() {}
        disconnect() {}
      },
    });
    vi.stubGlobal('PerformanceObserver', vi.mocked(window).PerformanceObserver);

    expect(() => {
      initPerformanceTracking(mockTracker as Tracker);
    }).not.toThrow();
  });

  test('should correctly track largest-contentful-paint', () => {
    let observerCallback: any;

    vi.stubGlobal('window', {
      PerformanceObserver: class {
        constructor(callback: any) {
          observerCallback = callback;
        }
        observe() {}
        disconnect() {}
      },
    });
    vi.stubGlobal('PerformanceObserver', vi.mocked(window).PerformanceObserver);

    initPerformanceTracking(mockTracker as Tracker);

    // Simulate callback
    observerCallback({
      getEntries: () => [
        { entryType: 'largest-contentful-paint', startTime: 100.5 },
        { entryType: 'other', startTime: 50 },
      ],
    });

    expect(mockTracker.trackPageEvent).toHaveBeenCalledWith('page_performance', {
      event_value: 101,
    });
  });

  test('should not track if window does not have PerformanceObserver', () => {
    vi.stubGlobal('window', {}); // No PerformanceObserver

    expect(() => {
      initPerformanceTracking(mockTracker as Tracker);
    }).not.toThrow();

    expect(mockTracker.trackPageEvent).not.toHaveBeenCalled();
  });

  test('cleanup should correctly disconnect observer', () => {
    let disconnectCalled = false;

    vi.stubGlobal('window', {
      PerformanceObserver: class {
        constructor() {}
        observe() {}
        disconnect() {
          disconnectCalled = true;
        }
      },
    });
    vi.stubGlobal('PerformanceObserver', vi.mocked(window).PerformanceObserver);

    const cleanup = initPerformanceTracking(mockTracker as Tracker);
    cleanup();

    expect(disconnectCalled).toBe(true);
  });
});
