import { UAParser } from 'ua-parser-js';

export interface UserAttributes {
  user_id: string;
  age: string;
  gender: string;
}

export interface BrowsingAttributes {
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
  token: string;
  site_name?: string;
  visit_timeout_minutes?: number;
  heartbeat_interval_ms?: number;
}

// OpenGraph
export interface OGMetadata {
  url: string;
  'og:title': string;
  'og:type': string;
  'og:image': string;
  'og:description': string;
  'og:site_name': string;
  'og:locale': string;
  'article:published_time': string | null;
  'article:modified_time': string | null;
  'article:expiration_time': string | null;
  'article:authors': string[];
  'article:section': string;
  'article:tags': string[];
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
  event_time_utc: string; // ISO8601
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
  'og:title': string; // String: og:title
  'og:type': string; // LowCardinality(String): og:type (article, website, etc.)
  'og:image': string; // String: og:image URL
  'og:description': string; // String: og:description
  'og:site_name': string;
  'og:locale': string; // LowCardinality(String): og:locale
  'article:published_time': string | null; // DateTime (Nullable): article published date
  'article:modified_time': string | null; // DateTime (Nullable): article modified date
  'article:expiration_time': string | null; // DateTime (Nullable): article expiration date
  'article:authors': string[]; // Array(String): article:author list
  'article:section': string; // LowCardinality(String): article:section (category)
  'article:tags': string[]; // Array(String): article:tag list

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
        const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
        if (el) return el.getAttribute('content') || '';
      }
      return '';
    };

    const getMetaArray = (prop: string) => {
      const elements = document.querySelectorAll(`meta[property="${prop}"], meta[name="${prop}"]`);
      return Array.from(elements)
        .map((el) => el.getAttribute('content') || '')
        .filter(Boolean);
    };

    return {
      url: getMeta(['og:url']) || window.location.href,
      'og:title': getMeta(['og:title']) || document.title,
      'og:type': getMeta(['og:type']) || 'website',
      'og:image': getMeta(['og:image']),
      'og:description': getMeta(['og:description', 'description']),
      'og:site_name':
        this.config.site_name || getMeta(['og:site_name']) || this.resolveFallbackSiteName(),
      'og:locale': getMeta(['og:locale']) || navigator.language,
      'article:published_time': this.formatDate(getMeta(['article:published_time'])),
      'article:modified_time': this.formatDate(getMeta(['article:modified_time'])),
      'article:expiration_time': this.formatDate(getMeta(['article:expiration_time'])),
      'article:authors': getMetaArray('article:author'),
      'article:section': getMeta(['article:section']),
      'article:tags': getMetaArray('article:tag'),
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

  private async sendEvent(eventName: string, extraData: Record<string, any> = {}) {
    const payload = generateAnalyticsPayload({
      eventName,
      uaResult: this.ua,
      visitId: this.visitId,
      visitorId: this.visitorId,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      lastEventTime: this.lastEventTime,
      queryParams: this.getQueryParams(),
      userAttributes: this.user,
      browsingAttributes: this.browsing,
      pageMetadata: this.pageMetadata,
      extraData,
    });

    this.lastEventTime = Date.now();
    localStorage.setItem('analytics_visit_last_ts', this.lastEventTime.toString());

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

export const generateAnalyticsPayload = (params: {
  eventName: string;
  uaResult: any; // UAParser.IResult
  visitId: string;
  visitorId: string;
  referrer: string;
  userAgent: string;
  language: string;
  lastEventTime: number;
  queryParams: Record<string, string>;
  userAttributes?: UserAttributes;
  browsingAttributes?: BrowsingAttributes;
  pageMetadata: OGMetadata;
  extraData?: Record<string, any>;
}): AnalyticsPayload => {
  const now = Date.now();
  const engagementTimeSeconds = Math.floor((now - params.lastEventTime) / 1000);

  return {
    event_id: crypto.randomUUID(),
    event_name: params.eventName,
    site_name: params.pageMetadata['og:site_name'],
    event_time: new Date(now).toISOString().replace('T', ' ').split('.')[0],
    event_time_utc: new Date(now).toISOString(),
    visit_id: params.visitId,
    visitor_id: params.visitorId,
    referrer: params.referrer,
    device: params.uaResult.device.model || 'unknown',
    device_type: params.uaResult.device.type || 'desktop',
    device_vendor: params.uaResult.device.vendor || 'unknown',
    os: params.uaResult.os.name || 'unknown',
    os_version: params.uaResult.os.version || 'unknown',
    app: params.uaResult.browser.name || 'unknown',
    app_type: 'browser',
    app_version: params.uaResult.browser.version || 'unknown',
    user_agent: params.userAgent,
    language: params.language,
    engagement_time: engagementTimeSeconds,
    query_params: params.queryParams,
    ...params.userAttributes,
    ...params.browsingAttributes,
    ...params.pageMetadata,
    ...params.extraData,
    created_at: new Date().toISOString().replace('T', ' ').split('.')[0],
  };
};
