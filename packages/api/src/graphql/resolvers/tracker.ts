import { MutationTrackerArgs, Resolvers, Tracker } from '@/__generated__/graphql/resolvers';
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
  const { organizationId } = c.var.user;
  const { origin, availableMinutes } = args;

  const iat = availableMinutes ? Math.floor(Date.now() / 1000) + 60 * availableMinutes : undefined;
  const payload = {
    organizationId,
    origin,
    iat,
  };

  const { secret, algorithm } = c.var.$.jwt;
  const token = await sign(payload, secret, algorithm);
  const expiresAt = iat ? new Date(iat * 1000) : undefined;

  const data = {
    organizationId,
    origin,
    token,
    expiresAt,
  };

  await c.var.$.prisma.tracker.create({ data });

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
