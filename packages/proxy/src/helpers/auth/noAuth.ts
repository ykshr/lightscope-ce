import { Context } from 'hono';
import { AuthProvider } from './index';

export default class NoAuth implements AuthProvider {
  async getTracker(c: Context) {
    return { organizationId: 'none' };
  }
}
