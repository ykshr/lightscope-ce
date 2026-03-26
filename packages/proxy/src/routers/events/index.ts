import processReferrer from '@/helpers/referrer';
import type { Context } from '@/types';
import { PayloadSchema, type Article, type Payload, type PV } from '@/types';
import { Hono } from 'hono';

const eventsRouter = new Hono();

eventsRouter.post('/', async (c: Context) => {
  try {
    const body = await c.req.json();
    const parseResult = PayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return c.json(
        {
          error: 'Invalid payload',
          details: parseResult.error.format(),
        },
        400
      );
    }
    const payload: Payload = parseResult.data;
    const egress = c.var.$.egress;

    const organizationId = c.var.tracker.organizationId;
    const article = createArticle(organizationId, payload);
    await egress.insertArticle(article);

    const geo = c.var.$.geo;
    const geoData = await geo.getGeoData(c);

    const pv = createPV(organizationId, payload, geoData);
    await egress.insertPV(pv);

    return c.json({ ok: true }, 201);
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    throw e;
  }
});

export function createArticle(organization_id: string, payload: Payload): Article {
  const url = payload['og:url'] || payload.url;
  const site_name = payload['og:site_name'] || 'unknown';

  return {
    organization_id,
    url,
    title: payload['og:title'] ?? undefined,
    type: payload['og:type'] ?? undefined,
    image: payload['og:image'] ?? undefined,
    description: payload['og:description'] ?? undefined,
    site_name,
    locale: payload['og:locale'] ?? undefined,
    published_time: payload['article:published_time'] ?? undefined,
    modified_time: payload['article:modified_time'] ?? undefined,
    expiration_time: payload['article:expiration_time'] ?? undefined,
    authors: payload['article:authors'] ?? undefined,
    section: payload['article:section'] ?? undefined,
    tags: payload['article:tags'] ?? undefined,
  };
}

export function createPV(
  organization_id: string,
  payload: Payload,
  geoData:
    | {
        continent?: string;
        country?: string;
        subdivision?: string;
        city?: string;
      }
    | null
    | undefined
): PV {
  const url = payload['og:url'] || payload.url;
  const site_name = payload['og:site_name'] || 'unknown';
  const event_id = payload.event_id;

  const query_params: Record<string, string> = {};
  try {
    new URL(url).searchParams.forEach((value, key) => {
      query_params[key] = value;
    });
  } catch (e) {
    // Should not happen if payload validation passes url check
  }

  const processedReferrer = processReferrer(payload.referrer ?? undefined);

  return {
    organization_id,
    site_name,
    event_id,
    url,
    event_time: formatDate(payload.event_time_utc),
    user_id: payload.user_id ?? undefined,
    visit_id: payload.visit_id ?? undefined,
    visitor_id: payload.visitor_id ?? undefined,
    referrer: processedReferrer.referrer,
    domain: processedReferrer.domain,
    device: payload.device ?? undefined,
    device_type: payload.device_type ?? undefined,
    device_vendor: payload.device_vendor ?? undefined,
    os: payload.os ?? undefined,
    os_version: payload.os_version ?? undefined,
    app: payload.app ?? undefined,
    app_type: payload.app_type ?? undefined,
    app_version: payload.app_version ?? undefined,
    age: payload.age ?? undefined,
    gender: payload.gender ?? undefined,
    geo_continent: geoData?.continent,
    geo_country: geoData?.country,
    geo_subdivision: geoData?.subdivision,
    geo_city: geoData?.city,
    query_params,
    utm_source: query_params.utm_source,
    utm_medium: query_params.utm_medium,
    utm_campaign: query_params.utm_campaign,
    language: payload.language ?? undefined,
    engagement_time: payload.engagement_time ?? 0,
  };
}

function formatDate(date: Date | string): string {
  return new Date(date).toISOString().substring(0, 19);
}

export default eventsRouter;
