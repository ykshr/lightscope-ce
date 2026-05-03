import type { Tracker } from '@/trackers/tracker';

export function initExitTracking(tracker: Tracker) {
  window.addEventListener('beforeunload', () => {
    tracker.trackPageEvent('page_exit');
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      tracker.trackPageEvent('page_hidden');
    }
  });

  const cleanup = () => {
    window.removeEventListener('beforeunload', () => {});
    document.removeEventListener('visibilitychange', () => {});
  };

  return cleanup;
}
