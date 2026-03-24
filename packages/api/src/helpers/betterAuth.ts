import deepMerge from '@/helpers/deepMerge';
import { PrismaClient } from '@prisma/client';
import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export default function createBetterAuth(prisma: PrismaClient, options: BetterAuthOptions = {}) {
  const defaultOptions: BetterAuthOptions = {
    emailAndPassword: {
      enabled: true,
    },
    database: prismaAdapter(prisma, {
      provider: 'sqlite',
    }),
    user: {
      additionalFields: {
        role: {
          type: ['user', 'admin'],
          required: false,
          defaultValue: 'user',
          input: false,
        },
        tenantId: {
          type: 'string',
          required: true,
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const userData = user as any;
            const userCountInTenant = await prisma.user.count({
              where: {
                tenantId: userData.tenantId,
              },
            });

            if (userCountInTenant === 0) {
              return {
                data: {
                  ...userData,
                  role: 'admin',
                },
              };
            }

            return { data: userData };
          },
        },
      },
    },
  };
  return betterAuth(deepMerge<BetterAuthOptions>(defaultOptions, options));
}
