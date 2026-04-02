import { env } from '@/helpers/env';
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

  const org = testUtils.createOrganization({ name: 'Test Org' });
  await testUtils.saveOrganization(org);
  await testUtils.addMember({
    userId: user.id,
    organizationId: org.id as string,
    role: 'admin',
  });

  const req = await request.newContext();
  await req.post(`${env.apiURL}/auth/sign-in/email`, {
    data: { email, password },
  });

  const storage = await req.storageState();

  return { storage, user, org };
};
