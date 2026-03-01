import { z } from 'zod';

// --------------------
// Zod schema for incoming payload
// --------------------
export const PayloadSchema = z
  .object({
    event_id: z.string(),
    event_time_utc: z.string(), // ISO8601
    event_time: z.string(), // ISO8601
    user_id: z.string().optional(),
    visit_id: z.string(),
    visitor_id: z.string(),
    url: z.string().url(),
    referrer: z.string().optional(),
    'og:title': z.string().optional(),
    'og:type': z.string().optional(),
    'og:image': z.string().optional(),
    'og:url': z.string().optional(),
    'og:description': z.string().optional(),
    'og:site_name': z.string().optional(),
    'og:locale': z.string().optional(),
    'article:published_time': z.string().optional(),
    'article:modified_time': z.string().optional(),
    'article:expiration_time': z.string().optional(),
    'article:authors': z.array(z.string()).optional(),
    'article:section': z.string().optional(),
    'article:tags': z.array(z.string()).optional(),
    user_agent: z.string(),
    device: z.string().optional(),
    device_type: z.string().optional(),
    device_vendor: z.string().optional(),
    os: z.string().optional(),
    os_version: z.string().optional(),
    app: z.string().optional(),
    app_type: z.string().optional(),
    app_version: z.string().optional(),
    age: z.string().optional(),
    gender: z.string().optional(),
    ip: z.string().optional(),
    language: z.string().optional(),
    engagement_time: z.number().int().nonnegative().optional().default(0),
  })
  .passthrough();

export type Payload = z.infer<typeof PayloadSchema>;

// --------------------
// PV type definition
// --------------------
export interface PV {
  tenant_id: number;
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
  tenant_id: number;
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
