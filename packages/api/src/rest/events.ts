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

// Middleware to authenticate token and origin, and assign tenant_id
const authenticateTracker = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const origin = req.headers.origin || req.headers.referer;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  // In CE (Community Edition), we assume a single tenant and no user management.
  // We just assign tenant_id = 1 as long as a token is provided.
  //
  // In the commercial version with multiple tenants, this is where you would
  // verify the token AND the origin domain against the database to find the
  // corresponding tenant_id.
  // Example:
  // const tenant = await db.findTenantByTokenAndOrigin(token, origin);
  // if (!tenant) return res.status(403).json({ error: 'Invalid token or origin' });
  // req.tenant_id = tenant.id;

  req.tenant_id = 1;
  next();
};

router.post('/', authenticateTracker, async (req: Request, res: Response, next: NextFunction) => {
  // Validate payload
  const parseResult = PayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid payload',
      details: parseResult.error.format(),
    });
  }
  const payload: Payload = parseResult.data;

  const tenant_id = req.tenant_id;
  if (tenant_id === undefined || isNaN(tenant_id)) {
    return res.status(400).json({ error: 'Missing or invalid tenant_id' });
  }

  const article = createArticle(payload, tenant_id);
  const articleKey = `${tenant_id}:${article.url}`;
  articleBuffers[articleKey] = article;

  const ip = req.ip;
  const geoInfo = geo && ip ? geo.get(ip) : undefined;

  const pv = createPV(payload, geoInfo, tenant_id);
  pvBuffers.push(pv);

  await insertBuffer();

  return res.status(201).json({ ok: true });
});

export default router;
