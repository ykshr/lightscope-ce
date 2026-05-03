// GTM integration layer

type TrackPayload = {
  event?: string;
  event_name?: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  event_value?: any;
  [key: string]: any;
};

declare global {
  interface Window {
    LightscopeTracker?: any;
    Lightscope?: {
      track: (payload: TrackPayload) => void;
      identify: (user: any) => void;
    };
  }
}

(function initGTMBridge() {
  if (typeof window === 'undefined') return;

  // queue for early GTM calls
  const queue: TrackPayload[] = [];

  const flushQueue = () => {
    if (!window.LightscopeTracker) return;

    while (queue.length > 0) {
      const payload = queue.shift();
      if (payload) {
        window.LightscopeTracker.track(
          payload.event_name || payload.event || 'custom_event',
          payload
        );
      }
    }
  };

  window.Lightscope = {
    track(payload: TrackPayload) {
      if (!window.LightscopeTracker) {
        queue.push(payload);
        return;
      }

      window.LightscopeTracker.track(
        payload.event_name || payload.event || 'custom_event',
        payload
      );
    },

    identify(user: any) {
      if (!window.LightscopeTracker) {
        queue.push({ __identify: true, user });
        return;
      }

      window.LightscopeTracker.identify(user);
    },
  };

  const interval = setInterval(() => {
    if (window.LightscopeTracker) {
      flushQueue();
      clearInterval(interval);
    }
  }, 100);
})();
