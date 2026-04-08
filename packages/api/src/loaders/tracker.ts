import { Context } from '@/types';

type Tracker = {
  id: string;
  origin: string;
  token: string;
  notBefore: Date;
  issuedAt: Date;
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
      createdAt: 'asc',
    },
  });

  const trackersTransformed = trackers.map((t) => ({
    ...t,
    notBefore: new Date(t.notBefore),
    issuedAt: new Date(t.issuedAt),
    expiresAt: t.expiresAt ? new Date(t.expiresAt) : null,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  })) as Tracker[];

  return trackersTransformed;
}
