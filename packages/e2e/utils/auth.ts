import { betterAuth } from 'better-auth';
import { organization, testUtils } from 'better-auth/plugins';

export const auth = betterAuth({
  plugins: [organization(), testUtils()],
});
