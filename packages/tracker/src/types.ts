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
