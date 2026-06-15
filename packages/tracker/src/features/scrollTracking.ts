import type { Tracker } from '@/trackers/tracker';

export function initScrollTracking(tracker: Tracker): () => void {
  const thresholds = [25, 50, 75, 100];
  const scrollTracked = new Set<number>();
  // ⚡ Bolt Optimization: Throttle calculations using requestAnimationFrame to prevent main thread blocking
  let ticking = false;

  const scrollHandler = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const depth = ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100;

        thresholds.forEach((t) => {
          if (depth >= t && !scrollTracked.has(t)) {
            scrollTracked.add(t);
            tracker.trackPageEvent('page_scroll', { event_value: t });
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  };

  // ⚡ Bolt Optimization: Mark listener as passive to improve scroll performance
  window.addEventListener('scroll', scrollHandler, { passive: true });

  const cleanup = () => {
    window.removeEventListener('scroll', scrollHandler);
  };

  return cleanup;
}
