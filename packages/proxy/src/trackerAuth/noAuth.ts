import { Context } from 'hono';
import TrackerAuthProvider from './provider';

export class NoAuthTrackerProvider implements TrackerAuthProvider {
  async getTenantId(c: Context): Promise<number | null> {
    const authHeader = c.req.header('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    return 1;
  }
}
