import { serve } from '@hono/node-server';
import { PORT } from '@/helpers/env';
import { createApp } from './app';

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`insert server listening on ${info.port}`);
  }
);
