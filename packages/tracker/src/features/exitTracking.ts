import type { Tracker } from '@/trackers/tracker';

export function initExitTracking(tracker: Tracker) {
  const onBeforeUnload = () => {
    tracker.trackPageEvent('page_exit');
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      tracker.trackPageEvent('page_hidden');
    }
  };

  window.addEventListener('beforeunload', onBeforeUnload);
  document.addEventListener('visibilitychange', onVisibilityChange);

  const cleanup = () => {
    window.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };

  return cleanup;
}
