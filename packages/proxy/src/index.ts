import { serve } from '@hono/node-server';
import NoAuth from '@/middlewares/auth/noAuth';
import ClickHouseEgress from '@/middlewares/egress/clickhouse';
import MaxmindGeo from '@/middlewares/geo/maxmind';
import { createApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const app = createApp({
  authProvider: new NoAuth(),
  egressProvider: new ClickHouseEgress(),
  geoProvider: new MaxmindGeo(),
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`insert server listening on ${info.port}`);
  }
);
