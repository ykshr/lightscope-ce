import type { Tracker } from '@/trackers/tracker';

export function initScrollTracking(tracker: Tracker): () => void {
  const thresholds = [25, 50, 75, 100];
  const scrollTracked = new Set<number>();

  const scrollHandler = () => {
    const depth = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100;

    thresholds.forEach((t) => {
      if (depth >= t && !scrollTracked.has(t)) {
        scrollTracked.add(t);
        tracker.trackPageEvent('page_scroll', { event_value: t });
      }
    });
  };

  window.addEventListener('scroll', scrollHandler);

  const cleanup = () => {
    window.removeEventListener('scroll', scrollHandler);
  };

  return cleanup;
}
