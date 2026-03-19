import { Auth, betterAuth, BetterAuthOptions } from 'better-auth';
import { Context } from 'hono';
import { AuthProvider, User } from './index';

export default class BetterAuth implements AuthProvider {
  private auth: Auth;

  constructor(options: BetterAuthOptions) {
    this.auth = betterAuth(options);
  }

  async getUser(c: Context): Promise<User | null> {
    const session = await this.auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      return null;
    }

    return {
      id: session.user.id,
      role: (session.user as any).role || 'user',
      tenantId: (session.user as any).tenantId || 1,
    };
  }

  async handler(c: Context): Promise<Response> {
    return await this.auth.handler(c.req.raw);
  }
}
