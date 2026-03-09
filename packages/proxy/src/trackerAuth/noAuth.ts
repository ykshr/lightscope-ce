import { Request } from 'express';
import TrackerAuthProvider from './provider';

export class NoAuthTrackerProvider implements TrackerAuthProvider {
  async getTenantId(req: Request): Promise<number | null> {
    const authHeader = req.headers.authorization;
    // const origin = req.headers.origin || req.headers.referer;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    // In CE (Community Edition), we assume a single tenant and no user management.
    // We just assign tenant_id = 1 as long as a token is provided.
    //
    // In the commercial version with multiple tenants, this is where you would
    // verify the token AND the origin domain against the database to find the
    // corresponding tenant_id.
    // Example:
    // const tenant = await db.findTenantByTokenAndOrigin(token, origin);
    // if (!tenant) return null;
    // return tenant.id;

    return 1;
  }
}
