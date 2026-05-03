export interface UserAttributes {
  user_id?: string;
  age?: string;
  gender?: string;
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

export interface AnalyticsConfig {
  token: string;
  visit_timeout_minutes?: number;
  heartbeat_interval_ms?: number;
}

export interface PageMetadata {
  url: string;
  site_name: string;
  title: string;
  locale: string;
  'og:url'?: string;
  'og:title'?: string;
  'og:type'?: string;
  'og:image'?: string;
  'og:description'?: string;
  'og:site_name'?: string;
  'og:locale'?: string;
  'article:published_time'?: string;
  'article:modified_time'?: string;
  'article:expiration_time'?: string;
  'article:authors'?: string[];
  'article:section'?: string;
  'article:tags'?: string[];
}

export interface ElementMetadata {
  element_id: string;
  element_label: string;
  element_type: string;
}

/**
 * Analytics Payload Interface
 */
export interface Payload extends UserAttributes, PageMetadata, Partial<ElementMetadata> {
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
}

export type EventName =
  | 'page_view'
  | 'heartbeat'
  | 'page_exit'
  | 'page_hidden'
  | 'scroll-25'
  | 'scroll-50'
  | 'scroll-75'
  | 'scroll-100'
  | 'click'
  | 'view';
