import { NO_AUTH_TOKEN } from '@/helpers/env';
import type { AuthProvider } from './index';

export default class NoAuthProvider implements AuthProvider {
  async getUser() {
    return { id: 'anonymous', role: 'admin', tenantId: 1 };
  }

  async getToken() {
    return NO_AUTH_TOKEN;
  }
}
