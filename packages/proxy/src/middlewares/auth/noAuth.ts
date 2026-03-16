import { Context } from 'hono';
import { env } from 'hono/adapter';
import { AuthProvider } from './index';

export default class NoAuth implements AuthProvider {
  async getTracker(c: Context) {
    const { NO_AUTH_TOKEN = 'dGhpcyBpcyBhbiBhbm9ueW1vdXMgdXNlcg==' } = env(c);

    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // This is an anonymous user for no auth
    if (NO_AUTH_TOKEN === token) return { tenantId: 1 };

    return null;
  }
}
