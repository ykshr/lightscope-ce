import { Auth, betterAuth, BetterAuthOptions } from 'better-auth';
import { Context } from 'hono';
import { AuthProvider, User } from './index';

export default class BetterAuth implements AuthProvider {
  private auth: Auth;

  constructor(options: BetterAuthOptions) {
    // @ts-ignore
    this.auth = betterAuth({
      emailAndPassword: {
        enabled: true,
      },
      user: {
        additionalFields: {
          role: {
            type: ['user', 'admin'],
            required: false,
            defaultValue: 'user',
            input: false,
          },
          tenantId: {
            type: 'string',
            required: true,
            input: false,
          },
        },
      },
      ...options,
    });
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
      role: (session.user as any).role,
      tenantId: (session.user as any).tenantId,
    };
  }

  async handler(c: Context): Promise<Response> {
    return await this.auth.handler(c.req.raw);
  }
}
