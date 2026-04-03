import { Context } from '@/types';

type Tracker = {
  id: string;
  origin: string;
  token: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export default async function getLoader(c: Context) {
  const { id: organizationId } = c.var.organization;

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
    expiresAt: t.expiresAt ? new Date(t.expiresAt) : null,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  })) as Tracker[];

  return trackersTransformed;
}
