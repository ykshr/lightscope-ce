export interface AnalyticsConfig {
  token: string;
  visit_timeout_minutes?: number;
  heartbeat_interval_ms?: number;
}

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

export interface EventData {
  event_value?: any;
}

/**
 * Analytics Payload Interface
 */
interface PayloadBody {
  // Event identification
  event_id: string; // String: UUID v4
  event_name: string; // String: Event name (page_view, click, heartbeat, viewability)

  // Timestamp
  event_time: string; // DateTime: 'YYYY-MM-DD HH:mm:ss' format
  event_time_utc: string; // ISO8601
  created_at: string; // DateTime: time of sending

  // User and session information
  visit_id: string; // String: each session (updated after 30 minutes of inactivity)
  visitor_id: string; // String: fixed for one day
}

export interface PageEventPayload
  extends PayloadBody, UserAttributes, BrowsingAttributes, PageMetadata, EventData {}

export interface ElementEventPayload
  extends
    PayloadBody,
    UserAttributes,
    BrowsingAttributes,
    PageMetadata,
    ElementMetadata,
    EventData {}

export type EventName =
  | 'page_view'
  | 'page_engagement'
  | 'page_exit'
  | 'page_hidden'
  | 'page_scroll'
  | 'page_performance'
  | 'page_error'
  | 'element_click'
  | 'element_view';
