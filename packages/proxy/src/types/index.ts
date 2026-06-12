import { AuthProvider, Tracker } from '@/helpers/auth';
import { EgressProvider } from '@/helpers/egress';
import { GeoProvider } from '@/helpers/geo';
import type { Context as HonoContext } from 'hono';
import { AlgorithmTypes } from 'hono/jwt';
import { z } from 'zod';

export type Bindings = {
  JWT_SECRET: string;
  JWT_ALGORITHM: AlgorithmTypes;
  CLICKHOUSE_URL: string;
  CLICKHOUSE_USERNAME: string;
  CLICKHOUSE_PASSWORD: string;
  CLICKHOUSE_INSERT_BATCH_SIZE: number;
  CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS: number;
  CLICKHOUSE_INSERT_MAX_TRY: number;
  MAXMIND_DB_PATH: string;
  ALLOWED_ORIGINS?: string;
};

export type $ = {
  auth: AuthProvider;
  egress: EgressProvider;
  geo: GeoProvider;
};

export type Variables = { tracker: Tracker; $: $ };

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export type Context = HonoContext<Env>;

// --------------------
// Zod schema for incoming payload
// --------------------
export const PayloadSchema = z
  .object({
    event_id: z.string(),
    event_name: z.string(),
    event_value: z.any().optional(),
    event_time: z.string(), // ISO8601
    event_time_utc: z.string(), // ISO8601
    created_at: z.string(), // ISO8601
    visit_id: z.string(),
    visitor_id: z.string(),
    referrer: z.string().optional(),
    user_agent: z.string(),
    language: z.string().optional(),
    device: z.string().optional(),
    device_type: z.string().optional(),
    device_vendor: z.string().optional(),
    os: z.string().optional(),
    os_version: z.string().optional(),
    app: z.string().optional(),
    app_type: z.string().optional(),
    app_version: z.string().optional(),
    query_params: z.record(z.string()).optional(),
    user_id: z.string().optional(),
    age: z.string().optional(),
    gender: z.string().optional(),
    url: z.string().url(),
    site_name: z.string(),
    title: z.string(),
    locale: z.string(),
    'og:url': z.string().url().optional(),
    'og:title': z.string().optional(),
    'og:type': z.string().optional(),
    'og:image': z.string().optional(),
    'og:description': z.string().optional(),
    'og:site_name': z.string().optional(),
    'og:locale': z.string().optional(),
    'article:published_time': z.string().optional(),
    'article:modified_time': z.string().optional(),
    'article:expiration_time': z.string().optional(),
    'article:authors': z.array(z.string()).optional(),
    'article:section': z.string().optional(),
    'article:tags': z.array(z.string()).optional(),
    element_id: z.string().optional(),
    element_label: z.string().optional(),
    element_type: z.string().optional(),
    ip: z.string().optional(),
  })
  .passthrough();

export type Payload = z.infer<typeof PayloadSchema>;

// --------------------
// PV type definition
// --------------------
export interface PV {
  organization_id: string;
  site_name: string;
  url: string;
  event_id: string;
  event_time: string;
  user_id?: string;
  visit_id?: string;
  visitor_id?: string;
  domain?: string;
  referrer?: string;
  device?: string;
  device_type?: string;
  device_vendor?: string;
  os?: string;
  os_version?: string;
  app?: string;
  app_type?: string;
  app_version?: string;
  age?: string;
  gender?: string;
  geo_continent?: string;
  geo_country?: string;
  geo_subdivision?: string;
  geo_city?: string;
  query_params?: Record<string, string>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  language?: string;
  engagement_time?: number;
}

// --------------------
// Article type definition
// --------------------
export interface Article {
  organization_id: string;
  url: string;
  title?: string;
  type?: string;
  image?: string;
  description?: string;
  site_name?: string;
  locale?: string;
  published_time?: string;
  modified_time?: string;
  expiration_time?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}
