## 2024-05-24 - React Anti-Pattern: useEffect for Derived State
**Learning:** `packages/web/src/components/linecharts/helpers/useProcessData.tsx` and `packages/web/src/components/tables/helpers/useProcessData.tsx` used `useState` + `useEffect` to manage derived state based on props (`data`). This anti-pattern forces React to render twice every time data updates (once with old state, then `useEffect` fires, state updates, and it renders again).
**Action:** Always compute derived state synchronously during render using `useMemo` instead of synchronizing it with `useEffect`. This eliminates the unnecessary double-render cycle and simplifies the code.

## 2024-05-24 - Tracker Scroll Event Performance
**Learning:** `packages/tracker/src/features/scrollTracking.ts` executed layout-thrashing calculations (`window.innerHeight`, `document.body.scrollHeight`) synchronously on every scroll event without any debouncing or throttling. It also omitted the `{ passive: true }` flag.
**Action:** When adding `scroll` listeners in performance-critical tracker scripts, always mark them as `{ passive: true }` and throttle expensive DOM reads using `requestAnimationFrame` to avoid main-thread blocking.
