import { Env } from '@/types';
import { createMiddleware } from 'hono/factory';

export default function createLoadersMiddleware() {
  return createMiddleware<Env>(async (c, next) => {
    const loaders = new Map();
    c.set('loaders', loaders);

    return await next();
  });
}
