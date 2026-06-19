import { initExitTracking } from '@/features/exitTracking';
import { Tracker } from '@/trackers/tracker';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('exitTracking', () => {
  let mockTracker: Partial<Tracker>;

  beforeEach(() => {
    mockTracker = {
      trackPageEvent: vi.fn(),
    };

    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    vi.stubGlobal('document', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      visibilityState: 'visible',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('should register beforeunload and visibilitychange listeners', () => {
    initExitTracking(mockTracker as Tracker);

    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(document.addEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function)
    );
  });

  test('should call tracker.trackPageEvent when beforeunload occurs', () => {
    initExitTracking(mockTracker as Tracker);

    // Extract the registered listener
    const addEventListenerMock = window.addEventListener as any;
    const beforeUnloadListener = addEventListenerMock.mock.calls.find(
      (call: any[]) => call[0] === 'beforeunload'
    )?.[1];

    expect(beforeUnloadListener).toBeDefined();

    // Simulate beforeunload event
    beforeUnloadListener();

    expect(mockTracker.trackPageEvent).toHaveBeenCalledTimes(1);
    expect(mockTracker.trackPageEvent).toHaveBeenCalledWith('page_exit');
  });

  test('should call tracker.trackPageEvent when visibilitychange occurs and state is hidden', () => {
    initExitTracking(mockTracker as Tracker);

    // Extract the registered listener
    const addEventListenerMock = document.addEventListener as any;
    const visibilityChangeListener = addEventListenerMock.mock.calls.find(
      (call: any[]) => call[0] === 'visibilitychange'
    )?.[1];

    expect(visibilityChangeListener).toBeDefined();

    // Set visibility state to hidden
    vi.stubGlobal('document', {
      ...global.document,
      visibilityState: 'hidden',
    });

    // Simulate visibilitychange event
    visibilityChangeListener();

    expect(mockTracker.trackPageEvent).toHaveBeenCalledTimes(1);
    expect(mockTracker.trackPageEvent).toHaveBeenCalledWith('page_hidden');
  });

  test('should not call tracker.trackPageEvent when visibilitychange occurs and state is visible', () => {
    initExitTracking(mockTracker as Tracker);

    // Extract the registered listener
    const addEventListenerMock = document.addEventListener as any;
    const visibilityChangeListener = addEventListenerMock.mock.calls.find(
      (call: any[]) => call[0] === 'visibilitychange'
    )?.[1];

    expect(visibilityChangeListener).toBeDefined();

    // Set visibility state to visible
    vi.stubGlobal('document', {
      ...global.document,
      visibilityState: 'visible',
    });

    // Simulate visibilitychange event
    visibilityChangeListener();

    expect(mockTracker.trackPageEvent).not.toHaveBeenCalled();
  });

  test('cleanup should remove event listeners', () => {
    const cleanup = initExitTracking(mockTracker as Tracker);

    // Extract registered listeners to verify exact instances are removed
    const winAddEventListenerMock = window.addEventListener as any;
    const beforeUnloadListener = winAddEventListenerMock.mock.calls.find(
      (call: any[]) => call[0] === 'beforeunload'
    )?.[1];

    const docAddEventListenerMock = document.addEventListener as any;
    const visibilityChangeListener = docAddEventListenerMock.mock.calls.find(
      (call: any[]) => call[0] === 'visibilitychange'
    )?.[1];

    cleanup();

    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', beforeUnloadListener);
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'visibilitychange',
      visibilityChangeListener
    );
  });
});
