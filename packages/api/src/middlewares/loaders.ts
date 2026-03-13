import { createMiddleware } from 'hono/factory';

export type Loaders = Map<string, any>;

export default function createLoadersMiddleware() {
  return createMiddleware(async (c, next) => {
    c.set('loaders', new Map());
    await next();
  });
}
