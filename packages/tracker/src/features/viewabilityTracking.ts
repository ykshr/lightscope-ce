import { clickableString } from '@/features/clickTracking';
import type { Tracker } from '@/trackers/tracker';

export function initViewabilityTracking(tracker: Tracker): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          tracker.trackElement('viewability', el);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  const clickables = document.querySelectorAll(clickableString);
  clickables.forEach((el) => observer.observe(el));

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          const newClickables = node.matches(clickableString)
            ? [node]
            : node.querySelectorAll(clickableString);
          newClickables.forEach((el) => observer.observe(el));
        }
      });
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
  };
}
