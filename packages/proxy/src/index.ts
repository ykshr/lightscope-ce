import createContext from '@/createContext';
import { serve } from '@hono/node-server';
import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const app = createApp(createContext);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`insert server listening on ${info.port}`);
  }
);
