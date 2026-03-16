import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

export type User = {
  id: string;
  role: string;
  tenantId: number;
};

export interface AuthProvider {
  getUser(c: Context): Promise<User | null>;
}

export default function createAuthMiddleware(authProvider: AuthProvider) {
  return createMiddleware(async (c, next) => {
    const user = await authProvider.getUser(c);

    if (!user) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    c.set('user', user);
    return await next();
  });
}
