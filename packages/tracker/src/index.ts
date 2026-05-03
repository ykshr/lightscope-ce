import { AnalyticsTracker } from '@/trackers/tracker';

// --- Auto-initialization Logic ---
if (typeof window !== 'undefined') {
  // 1. Look for its script tag
  const currentScript = document.currentScript as HTMLScriptElement;

  // 2. Get configs from data
  const endpoint = currentScript?.getAttribute('data-endpoint');
  const token = currentScript?.getAttribute('data-token');

  // 3. Initialisation
  if (endpoint && token) {
    const init = () => {
      if ((window as any).LightscopeTracker) return;

      const tracker = new AnalyticsTracker(endpoint, { token });
      tracker.trackPageView();
      (window as any).LightscopeTracker = tracker;
      console.log('Lightscope initialized.');
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      init();
    } else {
      window.addEventListener('load', init);
    }
  } else {
    console.warn('Lightscope: data-token or data-endpoint missing.');
  }
}
