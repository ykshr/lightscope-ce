import { Request, Response, NextFunction } from 'express';
import createTrackerAuthProvider from './factory';

export default function trackerAuthMiddleware() {
  const auth = createTrackerAuthProvider();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant_id = await auth.getTenantId(req);

      if (tenant_id === null) {
        res.status(401).json({ error: 'Missing or invalid token' });
        return;
      }

      req.tenant_id = tenant_id;
      next();
    } catch (e) {
      console.error('Tracker authentication failed:', e);
      res.status(500).json({ error: 'internal server error' });
    }
  };
}
