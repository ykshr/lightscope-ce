import { createAuthClient } from 'better-auth/react';
import type { AuthProvider } from './index';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export default class BasicAuthProvider implements AuthProvider {
  async getUser() {
    const { data: session } = await authClient.useSession();
    if (!session || !session.user) return null;
    return {
      id: session.user.id,
      role: (session.user as any).role || 'user',
      tenantId: (session.user as any).tenantId || 1,
    };
  }

  async getToken() {
    // Better Auth uses HTTP-only cookies by default or sets headers automatically.
    // If needed, we can extract it or rely on credentials.
    // Since LightScope passes headers manually in some places,
    // we may need to handle this differently if cookies are not used.
    // better-auth-react sets the cookie. So returning null allows browser to handle it.
    // However, if we need it for explicitly setting `Authorization: Bearer <token>`:
    // Better auth doesn't expose the raw token directly easily without custom plugins
    // if using cookies, but we'll return an empty string since headers are sent via cookies.
    return '';
  }

  async login() {
    // To be implemented by UI components using `authClient.signIn.email`
    console.log('Login should be handled by UI using authClient');
  }

  async logout() {
    await authClient.signOut();
  }
}
