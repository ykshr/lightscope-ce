import type { Tracker } from '@/trackers/tracker';

export const clickableString = 'button, a, [role="button"]';

export function initClickTracking(tracker: Tracker) {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      const clickable = target.closest(clickableString) as HTMLElement;
      tracker.trackElement('click', clickable);
    },
    true
  );
}
