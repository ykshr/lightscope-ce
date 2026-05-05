import { betterAuth } from 'better-auth';

const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: '123',
      clientSecret: '123',
    },
    apple: {
      clientId: '123',
      clientSecret: '123',
      appBundleIdentifier: '123',
    },
    microsoft: {
      clientId: '123',
      clientSecret: '123',
    },
  },
});
