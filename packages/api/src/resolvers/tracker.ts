import { MutationTrackerArgs, Resolvers, Tracker } from '@/__generated__/resolvers';
import { prisma } from '@/helpers/prisma';
import getLoader from '@/loaders/tracker';
import { Context } from '@/types';
import { sign } from 'hono/jwt';

export const query = async (_parent: any, _args: any, c: Context): Promise<Tracker[]> => {
  const trackers = await getLoader(c);
  return trackers;
};

export const mutation = async (
  _parent: any,
  args: MutationTrackerArgs,
  c: Context
): Promise<Tracker[]> => {
  const { tenantId } = c.var.user;
  const { origin, availableMinutes } = args;
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod';

  const iat = availableMinutes ? Math.floor(Date.now() / 1000) + 60 * availableMinutes : undefined;
  const payload = {
    tenantId,
    origin,
    iat,
  };

  const token = await sign(payload, secret);
  const expiresAt = iat ? new Date(iat * 1000) : undefined;

  const data = {
    tenantId,
    origin,
    token,
    expiresAt,
  };

  await prisma.tracker.create({ data });

  const trackers = await getLoader(c);
  return trackers;
};

const resolvers: Resolvers = {
  Query: {
    tracker: query,
  },
  Mutation: {
    tracker: mutation,
  },
};

export default resolvers;
