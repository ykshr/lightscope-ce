import { serve } from '@hono/node-server';
import { PORT } from '@/helpers/env';
import NoAuth from '@/middlewares/auth/noAuth';
import ClickHouseEgress from '@/middlewares/egress/clickhouse';
import MaxmindGeo from '@/middlewares/geo/maxmind';
import { createApp } from './app';

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
