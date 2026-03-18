import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaLibSql({
  url: 'file:prisma/dev.db',
});

export const prisma = new PrismaClient({ adapter });
