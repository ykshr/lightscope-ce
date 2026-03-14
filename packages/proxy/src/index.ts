import { serve } from '@hono/node-server';
import { PORT } from '@/helpers/env';
import NoAuthProvider from '@/middlewares/auth/noAuth';
import ClickHouseEgress from '@/middlewares/egress/clickhouse';
import MaxmindProvider from '@/middlewares/geo/maxmind';
import { createApp } from './app';

const app = createApp({
  authProvider: new NoAuthProvider(),
  egressProvider: new ClickHouseEgress(),
  geoProvider: new MaxmindProvider(),
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
