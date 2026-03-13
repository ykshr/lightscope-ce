import { Context } from 'hono';
import { NO_AUTH_TOKEN } from '@/helpers/env';
import { AuthProvider } from './index';

export default class NoAuthProvider implements AuthProvider {
  async getUser(c: Context) {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // This is an anonymous user for no auth
    if (token === NO_AUTH_TOKEN) return { id: 'anonymous', role: 'admin', tenantId: String(1) };

    return null;
  }
}
