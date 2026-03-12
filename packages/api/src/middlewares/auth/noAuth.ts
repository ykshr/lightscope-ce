import { Context } from 'hono';
import { AuthProvider } from './index';

export default class NoAuthProvider implements AuthProvider {
  async getUser(_c: Context) {
    return { id: 'anonymous', role: 'admin', tenantId: String(1) };
  }
}
