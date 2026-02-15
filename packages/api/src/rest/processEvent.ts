import { type CityResponse } from 'maxmind';
import processReferrer from '../helpers/referrer';
import { type Payload, type Article, type PV } from '../types';

export function createArticle(payload: Payload): Article {
  const url = payload['og:url'] || payload.url;
  const site_name = payload['og:site_name'] || 'unknown';

  return {
    url,
    title: payload['og:title'],
    type: payload['og:type'],
    image: payload['og:image'],
    description: payload['og:description'],
    site_name,
    locale: payload['og:locale'],
    published_time: payload['article:published_time'],
    modified_time: payload['article:modified_time'],
    expiration_time: payload['article:expiration_time'],
    authors: payload['article:authors'],
    section: payload['article:section'],
    tags: payload['article:tags'],
  };
}

export function createPV(
  payload: Payload,
  geoInfo: CityResponse | null
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

  const processedReferrer = processReferrer(payload.referrer);

  return {
    site_name,
    event_id,
    url,
    event_time: payload.event_time_utc,
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
    language: payload.language,
    engagement_time: payload.engagement_time ?? 0,
  };
}
