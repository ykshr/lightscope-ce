import { initExitTracking } from '@/features/exitTracking';
import { initPerformanceTracking } from '@/features/performanceTracking';
import { initScrollTracking } from '@/features/scrollTracking';
import { initSpaTracking } from '@/features/spaTracking';
import { initViewabilityTracking } from '@/features/viewabilityTracking';
import { getElementMetadata } from '@/helpers/elementMetadata';
import { getOrCreateVisitId, getOrCreateVisitorId } from '@/helpers/id';
import { extractPageMetadata } from '@/helpers/pageMetadata';
import type {
  AnalyticsConfig,
  BrowsingAttributes,
  ElementEventPayload,
  ElementMetadata,
  EventData,
  EventName,
  PageEventPayload,
  PageMetadata,
  UserAttributes,
} from '@/types';
import { UAParser } from 'ua-parser-js';

export class Tracker {
  private apiEndpoint: string;
  private config: AnalyticsConfig;
  private user?: UserAttributes;
  private browsing?: BrowsingAttributes;
  private ua: any;
  private visitorId: string;
  private visitId: string;
  private lastEventTime: number;
  private lastHeartbeatTime: number;
  private heartbeatTimer: number | null = null;
  private pageMetadata: Partial<PageMetadata>;
  private viewabilityCleanup?: () => void;
  private spaCleanup?: () => void;
  private scrollCleanup?: () => void;
  private exitCleanup?: () => void;
  private performanceCleanup?: () => void;

  private defaultVisitTimeoutMinutes = 30;
  private pendingStorageWrite = false;
  private defaultHeartbeatIntervalMs = 10 * 1000;

  constructor(
    apiEndpoint: string,
    config: AnalyticsConfig,
    pageMetadata: Partial<PageMetadata> = {}
  ) {
    this.apiEndpoint = apiEndpoint;
    this.config = {
      visit_timeout_minutes: this.defaultVisitTimeoutMinutes,
      heartbeat_interval_ms: this.defaultHeartbeatIntervalMs,
      ...config,
    };
    this.ua = new UAParser().getResult();

    this.visitorId = getOrCreateVisitorId();
    this.visitId = getOrCreateVisitId({ visitTimeoutMinutes: this.config.visit_timeout_minutes });
    this.lastEventTime = Date.now();
    this.lastHeartbeatTime = Date.now();

    // Cache OpenGraph metadata on initialization
    this.pageMetadata = pageMetadata;

    // Initialise tracking
    this.viewabilityCleanup = initViewabilityTracking(this);
    this.scrollCleanup = initScrollTracking(this);
    this.spaCleanup = initSpaTracking(this);
    this.exitCleanup = initExitTracking(this);
    this.performanceCleanup = initPerformanceTracking(this);

    // initErrorTracking(this);

    this.startHeartbeat();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.flushStorageWrite);
    }
  }

  // --- Sending Logic ---

  private scheduleStorageWrite() {
    if (this.pendingStorageWrite) return;
    this.pendingStorageWrite = true;

    const write = () => {
      if (!this.pendingStorageWrite) return;
      try {
        localStorage.setItem('analytics_visit_last_ts', this.lastEventTime.toString());
      } catch (e) {
        // Ignore quota errors
      }
      this.pendingStorageWrite = false;
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(write, { timeout: 2000 });
    } else {
      setTimeout(write, 100);
    }
  }

  private flushStorageWrite = () => {
    if (this.pendingStorageWrite) {
      try {
        localStorage.setItem('analytics_visit_last_ts', this.lastEventTime.toString());
      } catch (e) {
        // Ignore quota errors
      }
      this.pendingStorageWrite = false;
    }
  };

  private async sendEvent(
    eventName: EventName,
    eventData: EventData,
    elementMetadata?: ElementMetadata
  ) {
    const now = Date.now();
    const pageMetadata = extractPageMetadata(this.pageMetadata);

    const payload: PageEventPayload | ElementEventPayload = {
      event_id: crypto.randomUUID(),
      event_name: eventName,
      event_time: new Date(now).toISOString().replace('T', ' ').split('.')[0],
      event_time_utc: new Date(now).toISOString(),
      visit_id: this.visitId,
      visitor_id: this.visitorId,
      referrer: document.referrer,
      device: this.ua.device.model,
      device_type: this.ua.device.type,
      device_vendor: this.ua.device.vendor,
      os: this.ua.os.name,
      os_version: this.ua.os.version,
      app: this.ua.browser.name,
      app_type: this.ua.browser.type,
      app_version: this.ua.browser.version,
      user_agent: navigator.userAgent,
      language: navigator.language,
      ...this.user,
      ...this.browsing,
      ...pageMetadata,
      ...elementMetadata,
      ...eventData,
      created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
    };

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.token}`,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });

      this.lastEventTime = now;
      this.scheduleStorageWrite();
    } catch (e) {
      // Error handling can be added here if needed
    }
  }

  private async sendPageEvent(eventName: EventName, eventData: EventData = {}) {
    await this.sendEvent(eventName, eventData);
  }

  private async sendElementEvent(
    eventName: EventName,
    eventData: EventData = {},
    elementMetadata: ElementMetadata
  ) {
    await this.sendEvent(eventName, eventData, elementMetadata);
  }

  // --- Automatic Event Settings ---

  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      const now = Date.now();
      const engagementTimeSeconds = Math.floor((now - this.lastHeartbeatTime) / 1000);
      this.sendPageEvent('page_engagement', { event_value: engagementTimeSeconds });
      this.lastHeartbeatTime = Date.now();
    }, this.config.heartbeat_interval_ms);
  }

  // --- Public Methods ---

  public setUser(user: UserAttributes) {
    this.user = user;
  }

  public setBrowser(browsing: BrowsingAttributes) {
    this.browsing = browsing;
  }

  public updatePageMetadata() {
    this.pageMetadata = extractPageMetadata(this.pageMetadata);
  }

  public trackPageEvent(eventName: EventName, eventData: EventData = {}) {
    this.sendPageEvent(eventName, eventData);
  }

  public trackViewability(eventName: 'element_view' | 'element_click', element: HTMLElement) {
    const elementMetadata = getElementMetadata(element);
    this.sendElementEvent(eventName, undefined, elementMetadata);
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.flushStorageWrite);
    }
    this.flushStorageWrite();
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.viewabilityCleanup) this.viewabilityCleanup();
    if (this.spaCleanup) this.spaCleanup();
    if (this.scrollCleanup) this.scrollCleanup();
    if (this.exitCleanup) this.exitCleanup();
    if (this.performanceCleanup) this.performanceCleanup();
  }
}
