import { Tracker } from '@/trackers/tracker';

export function initPerformanceTracking(tracker: Tracker) {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.entryType === 'largest-contentful-paint') {
            tracker.sendPage('performance', {
              event_category: 'performance',
              event_action: 'LCP',
              event_value: Math.round(entry.startTime),
            });
          }
        });
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  }
}
