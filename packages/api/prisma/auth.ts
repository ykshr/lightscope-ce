import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import { betterAuth as createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

export const prisma = new PrismaClient({ adapter });
export default createBetterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  plugins: [organization()],
});
