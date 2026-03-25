import { Tracker } from '@/__generated__/graphql/resolvers';
import { Context } from '@/types';

export default async function getLoader(c: Context) {
  const { organizationId } = c.var.user;

  const trackers = await c.var.$.prisma.tracker.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const trackersTransformed = trackers.map((t) => ({
    ...t,
    expiresAt: t.expiresAt ? t.expiresAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })) as Tracker[];

  return trackersTransformed;
}
