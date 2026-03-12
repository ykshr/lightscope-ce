import { Context } from 'hono';
import { AuthProvider } from './index';

export default class NoAuthProvider implements AuthProvider {
  async getTracker(_c: Context) {
    return { tenantId: '1' };
  }
}
