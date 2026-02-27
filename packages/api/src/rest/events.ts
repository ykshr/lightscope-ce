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
import { PayloadSchema, type Payload, type PV, type Article } from '@/types';
import { createArticle, createPV } from './processEvent';

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
  if (flush || Object.keys(articleBuffers).length >= CLICKHOUSE_INSERT_BATCH_SIZE) {
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

  const tenant_id = Number(req.headers['x-tenant-id']);
  if (isNaN(tenant_id)) {
    return res.status(400).json({ error: 'Missing or invalid X-Tenant-Id header' });
  }

  const article = createArticle(payload, tenant_id);
  articleBuffers[article.url] = article;

  const ip = req.ip;
  const geoInfo = geo && ip ? geo.get(ip) : undefined;

  const pv = createPV(payload, geoInfo, tenant_id);
  pvBuffers.push(pv);

  await insertBuffer();

  return res.status(201).json({ ok: true });
});

export default router;
