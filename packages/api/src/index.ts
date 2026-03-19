import { prisma } from '@/helpers/prisma';
import BetterAuth from '@/middlewares/auth/betterAuth';
import { serve } from '@hono/node-server';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { createApp } from './app';
import type { Env } from './types';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const authProvider = new BetterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
});

const app = createApp<Env>({ authProvider });

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`api server listening on ${info.port}`);
  }
);
