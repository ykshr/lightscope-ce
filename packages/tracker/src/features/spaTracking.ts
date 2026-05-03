import type { Tracker } from '@/trackers/tracker';

export function initSpaTracking(tracker: Tracker): () => void {
  let lastUrl = window.location.href;

  const handleUrlChange = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      // URLが変わったのでメタデータを再取得してからページビューを送信
      tracker.updatePageMetadata();
      tracker.trackPageView();
    }
  };

  // ブラウザの「戻る・進む」を検知
  window.addEventListener('popstate', handleUrlChange);

  // SPAのクライアントサイドルーティング（pushState, replaceState）をフックして検知
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

  return () => {
    window.removeEventListener('popstate', handleUrlChange);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}
