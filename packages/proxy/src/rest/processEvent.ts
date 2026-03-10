import { type CityResponse } from 'maxmind';
import processReferrer from '../helpers/referrer';
import { type Payload, type Article, type PV } from '../types';

function formatDate(date: Date | string): string {
  return new Date(date).toISOString().substring(0, 19);
}

export function createArticle(payload: Payload, tenant_id: number): Article {
  const url = payload['og:url'] || payload.url;
  const site_name = payload['og:site_name'] || 'unknown';

  return {
    tenant_id,
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
  payload: Payload,
  geoInfo: CityResponse | null | undefined,
  tenant_id: number
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
    tenant_id,
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
    geo_continent: geoInfo?.continent?.code,
    geo_country: geoInfo?.country?.iso_code,
    geo_subdivision:
      geoInfo?.subdivisions && geoInfo.subdivisions.length > 0
        ? geoInfo.subdivisions[0].iso_code
        : undefined,
    geo_city: geoInfo?.city?.names?.en,
    query_params,
    utm_source: query_params.utm_source,
    utm_medium: query_params.utm_medium,
    utm_campaign: query_params.utm_campaign,
    language: payload.language ?? undefined,
    engagement_time: payload.engagement_time ?? 0,
  };
}
