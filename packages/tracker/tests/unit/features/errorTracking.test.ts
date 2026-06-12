import { initErrorTracking } from '@/features/errorTracking';
import { Tracker } from '@/trackers/tracker';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('errorTracking', () => {
  let mockTracker: Partial<Tracker>;

  beforeEach(() => {
    mockTracker = {
      trackPageEvent: vi.fn(),
    };

    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('should register error event listener on window', () => {
    initErrorTracking(mockTracker as Tracker);
    expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('should call tracker.trackPageEvent when window error occurs', () => {
    initErrorTracking(mockTracker as Tracker);

    // Extract the registered listener
    const addEventListenerMock = window.addEventListener as any;
    const errorListener = addEventListenerMock.mock.calls.find(
      (call: any[]) => call[0] === 'error'
    )?.[1];

    expect(errorListener).toBeDefined();

    // Simulate error event
    const mockErrorEvent = { message: 'Test error message' };
    errorListener(mockErrorEvent);

    expect(mockTracker.trackPageEvent).toHaveBeenCalledTimes(1);
    expect(mockTracker.trackPageEvent).toHaveBeenCalledWith('page_error', {
      event_value: 'Test error message',
    });
  });
});
