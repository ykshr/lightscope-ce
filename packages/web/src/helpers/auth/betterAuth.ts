import { API_URL } from '@/helpers/env';
import { createAuthClient } from 'better-auth/react';
import type { AuthProvider } from './index';

export const authClient = createAuthClient({
  baseURL: API_URL,
});

export default class BetterAuthProvider implements AuthProvider {
  async getUser() {
    const { data: session } = authClient.useSession();
    if (!session || !session.user) return null;
    return {
      id: session.user.id,
      role: (session.user as any).role || 'user',
      tenantId: (session.user as any).tenantId || 1,
    };
  }

  async login() {
    // To be implemented by UI components using `authClient.signIn.email`
    console.log('Login should be handled by UI using authClient');
  }

  async logout() {
    await authClient.signOut();
  }
}
