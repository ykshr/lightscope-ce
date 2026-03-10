import { serve } from '@hono/node-server';
import app from './index';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
