import type { Context as HonoContext } from 'hono';
import type { User } from '@/middlewares/auth';
import type { Loaders } from '@/middlewares/loaders';

export type Context = HonoContext<{ Variables: { user: User; loaders: Loaders } }>;
