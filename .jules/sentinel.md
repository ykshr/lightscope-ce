## 2024-05-30 - Fix XSS Vulnerability in Chart Component
**Vulnerability:** The `ChartStyle` component in `packages/web/src/components/ui/chart.tsx` constructed CSS directly using template literals inside `dangerouslySetInnerHTML` without properly sanitizing `id`, `key`, and `color`.
**Learning:** This exposes the application to CSS declaration injection and tag breakout risks. An attacker might inject malicious payloads through a crafted config.
**Prevention:** Always sanitize variables passed into `dangerouslySetInnerHTML` template literals, specifically stripping unwanted characters (e.g. `<>{};`) to ensure the CSS is harmless.
