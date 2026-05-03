import type { Tracker } from '@/trackers/tracker';
import type { EventName } from '@/types';

export function initScrollTracking(tracker: Tracker): () => void {
  const thresholds = [25, 50, 75, 100];
  const scrollTracked = new Set<number>();

  const scrollHandler = () => {
    const depth = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100;

    thresholds.forEach((t) => {
      if (depth >= t && !scrollTracked.has(t)) {
        scrollTracked.add(t);
        const eventName = `scroll-${t}` as EventName;
        tracker.trackPageEvent(eventName);
      }
    });
  };

  window.addEventListener('scroll', scrollHandler);

  const cleanup = () => {
    window.removeEventListener('scroll', scrollHandler);
  };

  return cleanup;
}
