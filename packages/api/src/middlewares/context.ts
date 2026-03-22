import { $ } from '@/types';
import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';

let $: $;

export default function createContextMiddleware(createContext: (c: Context) => Promise<$>) {
  return createMiddleware(async (c, next) => {
    if (!$) $ = await createContext(c);

    c.set('$', $);
    await next();
  });
}
