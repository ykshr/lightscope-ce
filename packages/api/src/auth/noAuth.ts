import { Context } from 'hono';
import AuthProvider from './provider';

export class NoAuthProvider implements AuthProvider {
  async getUser(_c: Context) {
    return { id: 'anonymous', role: 'admin', tenant_id: 1 };
  }
}
