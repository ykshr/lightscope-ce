import { MutationCreateTokenArgs, Resolvers, Token } from '@/__generated__/resolvers';
import { Context } from '@/types';
import { sign } from 'hono/jwt';

export const createToken = async (
  parent: any,
  args: MutationCreateTokenArgs,
  c: Context
): Promise<Token[]> => {
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

  const expirationTime = iat ? new Date(iat * 1000).toISOString() : undefined;
  return [
    {
      origin,
      token,
      expirationTime,
    },
  ];
};

const resolvers: Resolvers = {
  Mutation: {
    createToken,
  },
};

export default resolvers;
