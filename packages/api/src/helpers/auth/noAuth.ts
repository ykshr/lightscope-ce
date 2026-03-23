import { Context } from 'hono';
import { AuthProvider } from './index';

export default class NoAuth implements AuthProvider {
  async getUser(_c: Context) {
    return { id: 'anonymous', role: 'admin', tenantId: 'none' };
  }

  async handler(_c: Context): Promise<Response> {
    return new Response('Unauthorized', { status: 401 });
  }
}
