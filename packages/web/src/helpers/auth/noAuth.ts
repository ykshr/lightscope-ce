import type { AuthProvider } from './index';

export default class NoAuthProvider implements AuthProvider {
  async getUser() {
    return { id: 'anonymous', role: 'admin', organizationId: 'none' };
  }
}
