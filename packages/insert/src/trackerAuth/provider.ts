import { Request } from 'express';

export default interface TrackerAuthProvider {
  getTenantId(req: Request): Promise<number | null>;
}
