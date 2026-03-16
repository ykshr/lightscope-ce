import { serve } from '@hono/node-server';
import { createApp } from './app';
import NoAuth from '@/middlewares/auth/noAuth';
import type { Env } from './types';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
