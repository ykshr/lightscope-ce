import { serve } from '@hono/node-server';
import app from './index';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`insert server listening on ${info.port}`);
});
