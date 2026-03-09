import { Context } from 'hono';

export default interface TrackerAuthProvider {
  getTenantId(c: Context): Promise<number | null>;
}
