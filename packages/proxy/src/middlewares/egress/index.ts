import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { type Article, type PV } from '@/types';

export interface EgressProvider {
  setup(c: Context): Promise<void>;
  insertArticle(article: Article): Promise<void>;
  insertPV(pv: PV): Promise<void>;
}

export default function createEgressMiddleware(egress: EgressProvider) {
  return createMiddleware(async (c, next) => {
    await egress.setup(c);
    c.set('egress', egress);
    return await next();
  });
}
