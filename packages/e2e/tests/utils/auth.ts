import { betterAuth } from 'better-auth';
import { organization, testUtils } from 'better-auth/plugins';
import { sign } from 'hono/jwt';

export const auth = betterAuth({
  plugins: [organization(), testUtils()],
});

export async function sign(payload: any, secret: string, algorithm: string) {
  const token = await sign(payload, secret, algorithm);
  return token;
}
