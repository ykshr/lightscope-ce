import type { Tracker } from '@/trackers/tracker';

export function initPerformanceTracking(tracker: Tracker): () => void {
  let observer: PerformanceObserver | undefined;

  if ('PerformanceObserver' in window) {
    try {
      observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.entryType === 'largest-contentful-paint') {
            const value = Math.round(entry.startTime);
            tracker.trackPageEvent('page_performance', { event_value: value });
          }
        });
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  }

  const cleanup = () => {
    if (observer) observer.disconnect();
  };

  return cleanup;
}
