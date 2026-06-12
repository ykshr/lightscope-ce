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
    const eventName = payload.event_name;

    const egress = c.var.$.egress;

    const organizationId = c.var.tracker.organizationId;

    if (eventName === 'page_view') {
      const article = createArticle(organizationId, payload);
      await egress.insertArticle(article);
    }

    if (eventName === 'page_view' || eventName === 'page_engagement') {
      const geo = c.var.$.geo;
      const geoData = await geo.getGeoData(c);

      const pv = createPV(organizationId, payload, geoData);
      await egress.insertPV(pv);
    }

    return c.json({ ok: true }, 201);
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    throw e;
  }
});

export function createArticle(organization_id: string, payload: Payload): Article {
  const url = processUrl(payload);
  const site_name = processSiteName(payload);

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
  const url = processUrl(payload);
  const site_name = processSiteName(payload);
  const event_id = payload.event_id;

  const query_params: Record<string, string> = {};
  try {
    new URL(payload.url).searchParams.forEach((value, key) => {
      query_params[key] = value;
    });
  } catch (e) {
    // Should not happen if payload validation passes url check
  }

  const processedReferrer = processReferrer(payload.referrer);

  return {
    organization_id,
    site_name,
    event_id,
    url,
    event_time: formatDate(payload.event_time_utc),
    user_id: payload.user_id,
    visit_id: payload.visit_id,
    visitor_id: payload.visitor_id,
    referrer: processedReferrer.referrer,
    domain: processedReferrer.domain,
    device: payload.device,
    device_type: payload.device_type,
    device_vendor: payload.device_vendor,
    os: payload.os,
    os_version: payload.os_version,
    app: payload.app,
    app_type: payload.app_type,
    app_version: payload.app_version,
    age: payload.age,
    gender: payload.gender,
    geo_continent: geoData?.continent,
    geo_country: geoData?.country,
    geo_subdivision: geoData?.subdivision,
    geo_city: geoData?.city,
    query_params,
    utm_source: query_params.utm_source,
    utm_medium: query_params.utm_medium,
    utm_campaign: query_params.utm_campaign,
    language: payload.language,
    engagement_time: Number(payload.engagement_time ?? 0),
  };
}

function processUrl(payload: Payload) {
  const { origin, pathname } = new URL(payload.url);
  const urlFullPathWithoutQuery = origin + pathname;
  const url = payload['og:url'] || urlFullPathWithoutQuery;
  return url;
}

function processSiteName(payload: Payload) {
  return payload['og:site_name'] || payload.site_name;
}

function formatDate(date: Date | string): string {
  return new Date(date).toISOString().substring(0, 19);
}

export default eventsRouter;
