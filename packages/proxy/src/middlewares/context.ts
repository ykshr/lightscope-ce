import { $, Env } from '@/types';
import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

let $: $;

export default function createContextMiddleware(createContext: (c: Context) => Promise<$>) {
  return createMiddleware<Env>(async (c, next) => {
    if (!$) $ = await createContext(c);

    c.set('$', $);
    await next();
  });
}
