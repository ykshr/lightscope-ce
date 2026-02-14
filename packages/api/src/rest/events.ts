import { Router, Request, Response, NextFunction } from 'express';
import {
  geo,
  clickhouseClient,
  CLICKHOUSE_INSERT_BATCH_SIZE,
  CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS,
  CLICKHOUSE_ARTICLE_TABLE_NAME,
  CLICKHOUSE_PV_TABLE_NAME,
  CLICKHOUSE_INSERT_MAX_TRY,
} from '@/helpers/context';
import processReferrer from '@/helpers/referrer';
import { PayloadSchema, type Payload, type PV, type Article } from '@/types';

const router = Router();

const articleBuffers: Record<string, Article> = {};
const pvBuffers: PV[] = [];

async function insert(table: string, buffers: any[]) {
  if (!buffers || buffers.length === 0) return;
  let tryCount = 0;
  while (tryCount < CLICKHOUSE_INSERT_MAX_TRY) {
    try {
      await clickhouseClient.insert({
        table: table,
        values: buffers,
        format: 'JSONEachRow',
      });
      return;
    } catch (e) {
      console.error(`ClickHouse batch insert failed (try ${tryCount})`, e);
      tryCount++;
    }
  }
}

async function insertBuffer(flush = false) {
  // Article
  if (
    flush ||
    Object.keys(articleBuffers).length >= CLICKHOUSE_INSERT_BATCH_SIZE
  ) {
    await insert(CLICKHOUSE_ARTICLE_TABLE_NAME, Object.values(articleBuffers));
    Object.keys(articleBuffers).forEach((key) => delete articleBuffers[key]);
  }

  // PV
  if (flush || pvBuffers.length >= CLICKHOUSE_INSERT_BATCH_SIZE) {
    await insert(CLICKHOUSE_PV_TABLE_NAME, pvBuffers);
    pvBuffers.length = 0;
  }
}

setInterval(async () => {
  await insertBuffer(true);
}, CLICKHOUSE_INSERT_FLUSH_INTERVAL_MS);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  // Validate payload
  const parseResult = PayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid payload',
      details: parseResult.error.format(),
    });
  }
  const payload: Payload = parseResult.data;

  const url = payload['og:url'] || payload.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const site_name = payload['og:site_name'] || 'unknown';

  const article: Article = {
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
  articleBuffers[url] = article;

  const event_id = payload.event_id;
  if (!event_id) {
    return res.status(400).json({ error: 'Event ID is required' });
  }
  const ip = req.ip;
  const geoInfo = geo && ip ? geo.get(ip) : undefined;

  const query_params: Record<string, string> = {};
  new URL(url).searchParams.forEach((value, key) => {
    query_params[key] = value;
  });

  const processedReferrer = processReferrer(payload.referrer);

  const pv: PV = {
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
  pvBuffers.push(pv);

  await insertBuffer();

  return res.status(201).json({ ok: true });
});

export default router;
