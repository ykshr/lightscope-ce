import { Context } from 'hono';
import { AuthProvider, User } from './index';
import { auth } from '../../lib/auth';

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
