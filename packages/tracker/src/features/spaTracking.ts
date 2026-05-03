import type { Tracker } from '@/trackers/tracker';

export function initSpaTracking(tracker: Tracker): () => void {
  let lastUrl = window.location.href;

  const handleUrlChange = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // Update metadata and send page view since URL changed
      tracker.updatePageMetadata();
      tracker.trackPageView();
    }
  };

  // Detect browser back/forward navigation
  window.addEventListener('popstate', handleUrlChange);

  // Hook into SPA client-side routing (pushState, replaceState)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange();
  };

  const cleanup = () => {
    window.removeEventListener('popstate', handleUrlChange);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };

  return cleanup;
}
