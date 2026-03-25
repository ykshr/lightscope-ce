import type { Context } from '@/types';
import { PayloadSchema, type Payload } from '@/types';
import { Hono } from 'hono';
import { createArticle, createPV } from './processEvent';

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
    const article = createArticle(payload, organizationId);
    await egress.insertArticle(article);

    const geo = c.var.$.geo;
    const geoData = await geo.getGeoData(c);

    const pv = createPV(payload, geoData, organizationId);
    await egress.insertPV(pv);

    return c.json({ ok: true }, 201);
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      return c.json({ error: 'Bad request: Invalid JSON' }, 400);
    }
    throw e;
  }
});

export default eventsRouter;
