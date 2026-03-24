import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export default function createBetterAuth(prisma: PrismaClient) {
  return betterAuth({
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
  });
}

// export class BetterAuth implements AuthProvider {
//   private auth: Auth;

//   constructor(options: BetterAuthOptions) {
//     // @ts-ignore
//     this.auth = betterAuth({
//       emailAndPassword: {
//         enabled: true,
//       },
//       user: {
//         additionalFields: {
//           role: {
//             type: ['user', 'admin'],
//             required: false,
//             defaultValue: 'user',
//             input: false,
//           },
//           tenantId: {
//             type: 'string',
//             required: true,
//             input: false,
//           },
//         },
//       },
//     });
//   }

//   async getUser(c: Context): Promise<User | null> {
//     const session = await this.auth.api.getSession({
//       headers: c.req.raw.headers,
//     });

//     if (!session || !session.user) {
//       return null;
//     }

//     return {
//       id: session.user.id,
//       role: (session.user as any).role,
//       tenantId: (session.user as any).tenantId,
//     };
//   }

//   async handler(c: Context): Promise<Response> {
//     return await this.auth.handler(c.req.raw);
//   }
// }
