import type { Tracker } from '@/trackers/tracker';

const clickableString = 'button, a, [role="button"]';

export function initViewabilityTracking(tracker: Tracker): () => void {
  // --- View Tracking ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          tracker.trackViewability('element_view', el);
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

  // --- Click Tracking ---
  const clickHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const clickable = target.closest(clickableString) as HTMLElement | null;
    if (clickable) {
      tracker.trackViewability('element_click', clickable);
    }
  };

  document.addEventListener('click', clickHandler, true);

  const cleanup = () => {
    observer.disconnect();
    mutationObserver.disconnect();
    document.removeEventListener('click', clickHandler, true);
  };

  return cleanup;
}
