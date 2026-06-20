import createContext from '@/createContext';
import { serve } from '@hono/node-server';
import { createApp } from './app';

const PROXY_PORT = process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT, 10) : 3002;

const app = createApp(createContext);

serve(
  {
    fetch: app.fetch,
    port: PROXY_PORT,
  },
  (info) => {
    console.log(`insert server listening on ${info.port}`);
  }
);
