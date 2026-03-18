import { prisma } from '@/helpers/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { Context } from 'hono';
import { AuthProvider, User } from './index';

export default class BasicAuth implements AuthProvider {
  async getUser(c: Context): Promise<User | null> {
    const session = await auth.api.getSession({
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
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
});
