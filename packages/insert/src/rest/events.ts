import { Router, Request, Response, NextFunction } from 'express';
import { geo } from '@/helpers/context';
import { PayloadSchema, type Payload } from '@/types';
import { createArticle, createPV } from './processEvent';
import trackerAuthMiddleware from '../trackerAuth';
import createDestinationProvider from '@/destination/factory';

const router = Router();
const destinationProvider = createDestinationProvider();

router.post(
  '/',
  trackerAuthMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
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
    destinationProvider.insertArticle(article);

    const ip = req.ip;
    const geoInfo = geo && ip ? geo.get(ip) : undefined;

    const pv = createPV(payload, geoInfo, tenant_id);
    destinationProvider.insertPV(pv);

    return res.status(201).json({ ok: true });
  }
);

export default router;
