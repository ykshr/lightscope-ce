import { serve } from '@hono/node-server';
import { PORT } from '@/helpers/env';
import { createApp } from './app';
import NoAuth from '@/middlewares/auth/noAuth';
import type { Env } from './types';

const app = createApp<Env>({ authProvider: new NoAuth() });

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
