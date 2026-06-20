import { createApp } from '@/app';
import createContext from '@/createContext';
import { serve } from '@hono/node-server';

const API_PORT = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3001;

const app = createApp(createContext);

serve(
  {
    fetch: app.fetch,
    port: API_PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
