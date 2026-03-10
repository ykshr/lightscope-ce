import { Context, Next } from 'hono';
import createAuthProvider from './factory';

export default function authMiddleware() {
  const auth = createAuthProvider();

  return async (c: Context, next: Next) => {
    const user = await auth.getUser(c);

    if (!user) {
      return c.json({ error: 'unauthorized' }, 401);
    }

    c.set('user', user);
    return await next();
  };
}
