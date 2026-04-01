import { env } from '@/fixtures/env';
import { auth } from '@/utils/auth';
import { request } from '@playwright/test';

export default async () => {
  const ctx = await auth.$context;
  const testUtils = ctx.test;

  const email = 'e2e@example.com';
  const password = 'password123';

  const user = testUtils.createUser({
    email,
    name: 'E2E User',
    password,
  });
  await testUtils.saveUser(user);

  const req = await request.newContext();
  await req.post(`${env.apiURL}/auth/sign-in/email`, {
    data: { email, password },
  });

  await req.storageState({ path: 'auth.json' });
};
