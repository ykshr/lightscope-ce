import { UAParser } from 'ua-parser-js';

interface UserAttributes {
  use_id: string;
  age: string;
  gender: string;
}

interface BrowsingAttributes {
  referrer: string;
  user_agent: string;
  language: string;
  device: string;
  device_type: string;
  device_vendor: string;
  os: string;
  os_version: string;
  app: string;
  app_type: string;
  app_version: string;
}

interface AnalyticsConfig {
  tenant_id: number;
  token: string;
  site_name?: string;
  visit_timeout_minutes?: number;
  heartbeat_interval_ms?: number;
}

// OpenGraph
interface OGMetadata {
  url: string;
  title: string;
  type: string;
  image: string;
  description: string;
  site_name: string;
  locale: string;
  published_time: string | null;
  modified_time: string | null;
  expiration_time: string | null;
  authors: string[];
  section: string;
  tags: string[];
}

/**
 * Analytics Payload Interface
 */
export interface AnalyticsPayload {
  // Event identification
  event_id: string; // String: UUID v4
  event_name: string; // String: Event name (page_view, click, heartbeat, viewability)
  site_name: string; // LowCardinality(String): Subdomain/directory
  url: string; // String: og:url or window.location.href

  // Timestamp and engagement
  event_time: string; // DateTime: 'YYYY-MM-DD HH:mm:ss' format
  created_at: string; // DateTime: time of sending
  engagement_time: number; // UInt32: seconds elapsed since last event sent

  // User and session information
  visit_id: string; // String: each session (updated after 30 minutes of inactivity)
  visitor_id: string; // String: fixed for one day
  user_id?: string; // String: externally provided user ID
  age?: string; // LowCardinality(String): user attribute
  gender?: string; // LowCardinality(String): user attribute

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

  // OpenGraph / Content information
  title: string; // String: og:title
  type: string; // LowCardinality(String): og:type (article, website, etc.)
  image: string; // String: og:image URL
  description: string; // String: og:description
  locale: string; // LowCardinality(String): og:locale
  published_time: string | null; // DateTime (Nullable): article published date
  modified_time: string | null; // DateTime (Nullable): article modified date
  expiration_time: string | null; // DateTime (Nullable): article expiration date
  authors: string[]; // Array(String): article:author list
  section: string; // LowCardinality(String): article:section (category)
  tags: string[]; // Array(String): article:tag list

  // Dynamic data
  query_params: Record<string, string>; // Map(String, String): URL query parameters

  // Event-specific extended fields
  element_label?: string; // String: clicked button name or Viewability element name
}

export class AnalyticsTracker {
  private apiEndpoint: string;
  private config: AnalyticsConfig;
  private user?: UserAttributes;
  private browsing?: BrowsingAttributes;
  private ua: any;
  private visitorId: string;
  private visitId: string;
  private lastEventTime: number;
  private heartbeatTimer: number | null = null;
  private pageMetadata: OGMetadata;

  private defaultHeartbeatIntervalMs = 10 * 1000;

  constructor(
    apiEndpoint: string,
    config: AnalyticsConfig,
    { user, browsing }: { user?: UserAttributes; browsing?: BrowsingAttributes }
  ) {
    this.apiEndpoint = apiEndpoint;
    this.config = {
      visit_timeout_minutes: 30,
      heartbeat_interval_ms: this.defaultHeartbeatIntervalMs,
      ...config,
    };
    this.user = user;
    this.browsing = browsing;
    this.ua = new UAParser().getResult();

    this.visitorId = this.getOrCreateVisitorId();
    this.visitId = this.getOrCreateVisitId();
    this.lastEventTime = Date.now();

    // Cache OpenGraph metadata on initialization
    this.pageMetadata = this.extractOGMetadata();

    this.initGlobalEventListeners();
    this.startHeartbeat();
  }

  /**
   * Fallback method to resolve site name from URL
   * Example: https://sub.example.com/shop/item/123
   * => "sub.example.com"
   * Example: https://example.com/shop/item/123
   * => "/shop"
   */
  private resolveFallbackSiteName(): string {
    const { hostname, pathname } = window.location;
    const domainParts = hostname.split('.');
    if (domainParts.length > 2) {
      return hostname; // Return full hostname if subdomain exists
    } else {
      const pathSegments = pathname.split('/').filter(Boolean);
      return pathSegments.length > 0 ? `/${pathSegments[0]}` : '/';
    }
  }

  /**
   * Extract information from OpenGraph and Article meta tags
   */
  private extractOGMetadata(): OGMetadata {
    const getMeta = (props: string[]) => {
      for (const prop of props) {
        const el = document.querySelector(
          `meta[property="${prop}"], meta[name="${prop}"]`
        );
        if (el) return el.getAttribute('content') || '';
      }
      return '';
    };

    const getMetaArray = (prop: string) => {
      const elements = document.querySelectorAll(
        `meta[property="${prop}"], meta[name="${prop}"]`
      );
      return Array.from(elements)
        .map((el) => el.getAttribute('content') || '')
        .filter(Boolean);
    };

    return {
      url: getMeta(['og:url']) || window.location.href,
      title: getMeta(['og:title']) || document.title,
      type: getMeta(['og:type']) || 'website',
      image: getMeta(['og:image']),
      description: getMeta(['og:description', 'description']),
      site_name:
        this.config.site_name ||
        getMeta(['og:site_name']) ||
        this.resolveFallbackSiteName(),
      locale: getMeta(['og:locale']) || navigator.language,
      published_time: this.formatDate(getMeta(['article:published_time'])),
      modified_time: this.formatDate(getMeta(['article:modified_time'])),
      expiration_time: this.formatDate(getMeta(['article:expiration_time'])),
      authors: getMetaArray('article:author'),
      section: getMeta(['article:section']),
      tags: getMetaArray('article:tag'),
    };
  }

  /**
   * Extract query parameters from URL
   */
  private getQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(window.location.search);

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  private formatDate(dateStr: string): string | null {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().replace('T', ' ').split('.')[0];
    } catch {
      return null;
    }
  }

  // --- ID Management Logic ---

  private getOrCreateVisitorId(): string {
    const key = 'analytics_visitor_id';
    const dateKey = 'analytics_visitor_date';
    const today = new Date().toISOString().split('T')[0];
    let vid = localStorage.getItem(key);
    const lastDate = localStorage.getItem(dateKey);

    if (!vid || lastDate !== today) {
      vid = crypto.randomUUID();
      localStorage.setItem(key, vid);
      localStorage.setItem(dateKey, today);
    }
    return vid;
  }

  private getOrCreateVisitId(): string {
    const key = 'analytics_visit_id';
    const tsKey = 'analytics_visit_last_ts';
    const now = Date.now();
    const timeoutMs = (this.config.visit_timeout_minutes || 30) * 60 * 1000;

    let sid = localStorage.getItem(key);
    const lastTs = Number(localStorage.getItem(tsKey) || 0);

    if (!sid || now - lastTs > timeoutMs) {
      sid = crypto.randomUUID();
      localStorage.setItem(key, sid);
    }
    localStorage.setItem(tsKey, now.toString());
    return sid;
  }

  // --- Sending Logic ---

  private async sendEvent(
    eventName: string,
    extraData: Record<string, any> = {}
  ) {
    const now = Date.now();
    const engagementTimeSeconds = Math.floor((now - this.lastEventTime) / 1000);

    const payload: AnalyticsPayload = {
      event_id: crypto.randomUUID(),
      event_name: eventName,
      event_time: new Date(now).toISOString().replace('T', ' ').split('.')[0],
      visit_id: this.visitId,
      visitor_id: this.visitorId,
      referrer: document.referrer,
      device: this.ua.device.model || 'unknown',
      device_type: this.ua.device.type || 'desktop',
      device_vendor: this.ua.device.vendor || 'unknown',
      os: this.ua.os.name || 'unknown',
      os_version: this.ua.os.version || 'unknown',
      app: this.ua.browser.name || 'unknown',
      app_type: 'browser',
      app_version: this.ua.browser.version || 'unknown',
      user_agent: navigator.userAgent,
      language: navigator.language,
      engagement_time: engagementTimeSeconds,
      query_params: this.getQueryParams(),
      // User-provided user attributes
      ...this.user,
      // User-provided browsing attributes
      ...this.browsing,
      // OpenGraph information (included in all events)
      ...this.pageMetadata,
      // Additional information (e.g., clicked element label)
      ...extraData,
      created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
    };

    this.lastEventTime = now;
    localStorage.setItem('analytics_visit_last_ts', now.toString());

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.token}`,
          'X-Tenant-Id': String(this.config.tenant_id),
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (e) {
      // Error handling can be added here if needed
    }
  }

  // --- Automatic Event Settings ---

  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      this.sendEvent('heartbeat');
    }, this.config.heartbeat_interval_ms || this.defaultHeartbeatIntervalMs);
  }

  private getElementLabel(element: Element | null): string | undefined {
    return (
      element?.id ||
      element?.getAttribute('data-analytics-id') ||
      element?.getAttribute('aria-label') ||
      element?.textContent?.trim().substring(0, 100)
    );
  }

  private clickableString = 'button, a, [role="button"]';
  private getClickableElement(target: HTMLElement): HTMLElement | null {
    return target.closest(this.clickableString) as HTMLElement;
  }

  private initGlobalEventListeners() {
    // Click Event Listener
    document.addEventListener(
      'click',
      (event) => {
        const clickable = this.getClickableElement(event.target as HTMLElement);
        const label = this.getElementLabel(clickable);
        if (label) this.sendEvent('click', { element_label: label });
      },
      true
    );

    // Viewability Tracking
    this.observeAllClickables();
  }

  private observeAllClickables() {
    // IntersectionObserver for viewability
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            this.sendEvent('viewability', {
              element_label: this.getElementLabel(el),
              element_tag: el.tagName.toLowerCase(),
            });
            // Cease observing after first viewability event
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe existing clickable elements
    const clickables = document.querySelectorAll(this.clickableString);
    clickables.forEach((el) => observer.observe(el));

    // Observe future added clickable elements
    this.setupMutationObserver(observer);
  }

  private setupMutationObserver(viewabilityObserver: IntersectionObserver) {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the element itself is clickable or contains clickable elements
            const clickables = node.matches(this.clickableString)
              ? [node]
              : node.querySelectorAll(this.clickableString);

            clickables.forEach((el) => viewabilityObserver.observe(el));
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  // --- Public Methods ---

  public trackPageView() {
    this.sendEvent('page_view');
  }

  public trackViewability(element: HTMLElement, label: string) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.sendEvent('viewability', { element_label: label });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(element);
  }

  public destroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }
}
