import { createApp } from '@/app';
import createContext from '@/createContext';
import { serve } from '@hono/node-server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = createApp(createContext);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
