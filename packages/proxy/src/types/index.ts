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
    event_value: z.any().optional().nullable(),
    event_time: z.string().datetime(), // ISO8601
    event_time_utc: z.string().datetime(), // ISO8601
    created_at: z.string().datetime(), // ISO8601
    visit_id: z.string(),
    visitor_id: z.string(),
    referrer: z.string().optional().nullable(),
    user_agent: z.string(),
    language: z.string().optional().nullable(),
    device: z.string().optional().nullable(),
    device_type: z.string().optional().nullable(),
    device_vendor: z.string().optional().nullable(),
    os: z.string().optional().nullable(),
    os_version: z.string().optional().nullable(),
    app: z.string().optional().nullable(),
    app_type: z.string().optional().nullable(),
    app_version: z.string().optional().nullable(),
    query_params: z.record(z.string()).optional().nullable(),
    user_id: z.string().optional().nullable(),
    age: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    url: z.string().url(),
    site_name: z.string(),
    title: z.string(),
    locale: z.string(),
    'og:url': z.string().url().optional().nullable(),
    'og:title': z.string().optional().nullable(),
    'og:type': z.string().optional().nullable(),
    'og:image': z.string().optional().nullable(),
    'og:description': z.string().optional().nullable(),
    'og:site_name': z.string().optional().nullable(),
    'og:locale': z.string().optional().nullable(),
    'article:published_time': z.string().optional().nullable(),
    'article:modified_time': z.string().optional().nullable(),
    'article:expiration_time': z.string().optional().nullable(),
    'article:authors': z.array(z.string()).optional().nullable(),
    'article:section': z.string().optional().nullable(),
    'article:tags': z.array(z.string()).optional().nullable(),
    element_id: z.string().optional().nullable(),
    element_label: z.string().optional().nullable(),
    element_type: z.string().optional().nullable(),
    ip: z.string().optional().nullable(),
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
