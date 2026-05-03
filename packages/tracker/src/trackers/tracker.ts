import { initScrollTracking } from '@/features/scrollTracking';
import { initSpaTracking } from '@/features/spaTracking';
import { initViewabilityTracking } from '@/features/viewabilityTracking';
import { getOrCreateVisitId, getOrCreateVisitorId } from '@/helpers/id';
import { extractPageMetadata, PageMetadata } from '@/helpers/pageMetadata';
import { getQueryParams } from '@/helpers/queryParameters';
import type { AnalyticsConfig, BrowsingAttributes, UserAttributes } from '@/types';
import { UAParser } from 'ua-parser-js';
import { ElementMetadata, getElementMetadata } from '../helpers/elementMetadata';

/**
 * Analytics Payload Interface
 */
interface Payload extends UserAttributes, PageMetadata {
  // Event identification
  event_id: string; // String: UUID v4
  event_name: string; // String: Event name (page_view, click, heartbeat, viewability)

  event_category?: string;
  event_action?: string;
  event_label?: string;
  event_value?: any;

  // Timestamp and engagement
  event_time: string; // DateTime: 'YYYY-MM-DD HH:mm:ss' format
  event_time_utc: string; // ISO8601
  created_at: string; // DateTime: time of sending
  engagement_time?: number; // UInt32: seconds elapsed since last event sent

  // User and session information
  visit_id: string; // String: each session (updated after 30 minutes of inactivity)
  visitor_id: string; // String: fixed for one day

  // Browsing environment (UAParser.js)
  referrer: string; // String: referrer URL
  user_agent: string; // String: browser UA string
  language: string; // LowCardinality(String): browser language (e.g., ja-JP)
  device: string; // LowCardinality(String): model name
  device_type: string; // LowCardinality(String): desktop, mobile, tablet, etc.
  device_vendor: string; // LowCardinality(String): Apple, Samsung, etc.
  os: string; // LowCardinality(String): iOS, Android, Windows, etc.
  os_version: string; // String: OS version
  app: string; // LowCardinality(String): Browser name (Chrome, Safari, etc.)
  app_type: string; // LowCardinality(String): 'browser' fixed
  app_version: string; // String: Browser version

  // Dynamic data
  query_params: Record<string, string>; // Map(String, String): URL query parameters

  // Event-specific extended fields
  element_label?: string; // String: clicked button name or Viewability element name
}

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
  private pageMetadata: PageMetadata;
  private viewabilityCleanup?: () => void;
  private spaCleanup?: () => void;
  private scrollCleanup?: () => void;

  private defaultVisitTimeoutMinutes = 30;
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
    this.pageMetadata = extractPageMetadata(pageMetadata);

    // Initialise tracking
    this.viewabilityCleanup = initViewabilityTracking(this);
    this.scrollCleanup = initScrollTracking(this);
    this.spaCleanup = initSpaTracking(this);

    // initExitTracking(this);
    // initPerformanceTracking(this);
    // initErrorTracking(this);

    this.startHeartbeat();
  }

  // --- Sending Logic ---

  private async sendEvent(eventName: string, extraData: Record<string, any> = {}) {
    const now = Date.now();
    const queryParams = getQueryParams();

    const payload: Payload = {
      event_id: crypto.randomUUID(),
      event_name: eventName,
      event_time: new Date(now).toISOString().replace('T', ' ').split('.')[0],
      event_time_utc: new Date(now).toISOString(),
      visit_id: this.visitId,
      visitor_id: this.visitorId,
      referrer: document.referrer,
      device: this.ua.device.model || 'unknown',
      device_type: this.ua.device.type || 'unknown',
      device_vendor: this.ua.device.vendor || 'unknown',
      os: this.ua.os.name || 'unknown',
      os_version: this.ua.os.version || 'unknown',
      app: this.ua.browser.name || 'unknown',
      app_type: this.ua.browser.type || 'unknown',
      app_version: this.ua.browser.version || 'unknown',
      user_agent: navigator.userAgent,
      language: navigator.language,
      query_params: queryParams,
      ...this.user,
      ...this.browsing,
      ...this.pageMetadata,
      ...extraData,
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
      localStorage.setItem('analytics_visit_last_ts', this.lastEventTime.toString());
    } catch (e) {
      // Error handling can be added here if needed
    }
  }

  private async sendPageEvent(eventName: string) {
    if (eventName === 'heartbeat') {
      const now = Date.now();
      const engagementTimeSeconds = Math.floor((now - this.lastHeartbeatTime) / 1000);
      await this.sendEvent(eventName, {
        engagement_time: engagementTimeSeconds,
      });
      this.lastHeartbeatTime = Date.now();
      return;
    }
    await this.sendEvent(eventName);
  }

  private async sendElementEvent(eventName: string, elementMetadata: ElementMetadata) {
    await this.sendEvent(eventName, elementMetadata);
  }

  // --- Automatic Event Settings ---

  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      this.sendPageEvent('heartbeat');
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

  public trackPageView() {
    this.sendPageEvent('page_view');
  }

  public trackScroll(t: number) {
    this.sendPageEvent(`scroll-${t}`);
  }

  public trackViewability(eventName: 'view' | 'click', element: HTMLElement) {
    const elementMetadata = getElementMetadata(element);
    this.sendElementEvent(eventName, elementMetadata);
  }

  public destroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.viewabilityCleanup) this.viewabilityCleanup();
    if (this.spaCleanup) this.spaCleanup();
    if (this.scrollCleanup) this.scrollCleanup();
  }
}
