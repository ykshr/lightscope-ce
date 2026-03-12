import { Hono } from 'hono';
import { PayloadSchema, type Payload } from '@/types';
import { getGeoData } from '@/helpers/geo';
import { createArticle, createPV } from './processEvent';
import type { Context } from '@/types';

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

    const tenantId = c.var.tracker.tenantId;
    const article = createArticle(payload, tenantId);
    // destinationProvider.insertArticle(article);

    const geoData = getGeoData(c);

    const pv = createPV(payload, geoData, tenantId);
    // destinationProvider.insertPV(pv);

    return c.json({ ok: true }, 201);
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    throw e;
  }
});

export default eventsRouter;
