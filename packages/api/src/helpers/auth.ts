import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';
import { betterAuth as createBetterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { organization } from 'better-auth/plugins';

const adapter = new PrismaLibSql({
  url: '',
});
const prisma = new PrismaClient({ adapter });
export const betterAuth = createBetterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  plugins: [organization()],
});
