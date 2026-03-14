import { serve } from '@hono/node-server';
import { PORT } from '@/helpers/env';
import { createApp } from './app';
import NoAuthProvider from '@/middlewares/auth/noAuth';

const app = createApp({ authProvider: new NoAuthProvider() });

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
