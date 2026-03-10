import { Hono } from 'hono';
import { geo } from '@/helpers/context';
import { PayloadSchema, type Payload } from '@/types';
import { createArticle, createPV } from './processEvent';
import trackerAuthMiddleware from '../trackerAuth';
import createDestinationProvider from '@/destination/factory';

const router = new Hono<{ Variables: { tenant_id: number } }>();
const destinationProvider = createDestinationProvider();

router.use('/*', trackerAuthMiddleware());

router.post('/', async (c) => {
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

    const tenant_id = c.get('tenant_id');
    if (tenant_id === undefined || isNaN(tenant_id)) {
      return c.json({ error: 'Missing or invalid tenant_id' }, 400);
    }

    const article = createArticle(payload, tenant_id);
    destinationProvider.insertArticle(article);

    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '';
    const geoInfo = geo && ip ? geo.get(ip) : undefined;

    const pv = createPV(payload, geoInfo, tenant_id);
    destinationProvider.insertPV(pv);

    return c.json({ ok: true }, 201);
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    throw e;
  }
});

export default router;
