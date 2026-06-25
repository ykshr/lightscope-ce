import { PrismaClient } from '@/__generated__/prisma/client';
import type { Auth } from '@/types/auth';
import { ClickHouseClient } from '@clickhouse/client';
import { Member } from 'better-auth/plugins/organization';
import type { Context as HonoContext } from 'hono';
import { AlgorithmTypes } from 'hono/jwt';

type User = {
  id: string;
};

type Organization = {
  id: string;
};

export type Bindings = {
  API_ALLOWED_ORIGINS?: string;
  API_CORS_ALLOW_HEADERS?: string;
  JWT_SECRET: string;
  JWT_ALGORITHM?: AlgorithmTypes;
  DATABASE_URL: string;
  CLICKHOUSE_URL: string;
  CLICKHOUSE_USERNAME: string;
  CLICKHOUSE_PASSWORD: string;
  CLICKHOUSE_DB: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
  APPLE_CLIENT_ID?: string;
  APPLE_TEAM_ID?: string;
  APPLE_KEY_ID?: string;
  APPLE_PRIVATE_KEY?: string;
  APPLE_APP_BUNDLE_IDENTIFIER?: string;
};

export type $ = {
  auth: Auth;
  clickhouse: ClickHouseClient;
  prisma: PrismaClient;
  jwt: {
    secret: string;
    algorithm: AlgorithmTypes;
  };
};

export type Variables = {
  user: User;
  organization: Organization;
  me: Member;
  loaders: Map<string, any>;
  $: $;
};

export type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

export type Context = HonoContext<Env>;
export type GraphQLContext = { c: Context };
