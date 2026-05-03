import { Tracker } from '@/trackers/tracker';

export function initErrorTracking(tracker: Tracker) {
  window.addEventListener('error', (e) => {
    tracker.trackPageEvent('page_error', {
      event_value: e.message,
    });
  });
}
