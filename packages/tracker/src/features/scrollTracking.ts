import type { Tracker } from '@/trackers/tracker';

export function initScrollTracking(tracker: Tracker) {
  const thresholds = [25, 50, 75, 100];
  const scrollTracked = new Set<number>();

  window.addEventListener('scroll', () => {
    const depth = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100;

    thresholds.forEach((t) => {
      if (depth >= t && !scrollTracked.has(t)) {
        scrollTracked.add(t);
        tracker.track('scroll', {
          event_category: 'engagement',
          event_action: 'scroll_depth',
          event_value: t,
        });
      }
    });
  });
}
