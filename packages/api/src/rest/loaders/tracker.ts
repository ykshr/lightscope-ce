import type { Context } from '@/types';

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

  return trackers as Tracker[];
}
