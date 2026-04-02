import { API_URL, ORG_NAME, ORG_SLUG, USER_EMAIL, USER_NAME, USER_PASSWORD } from '@/helpers/env';
import setupUserAndOrganization from '@/setup/auth';
import { request } from '@playwright/test';

export default async () => {
  const testUserAndOrg = {
    userEmail: USER_EMAIL,
    userPassword: USER_PASSWORD,
    userName: USER_NAME,
    orgName: ORG_NAME,
    orgSlug: ORG_SLUG,
  };

  // Create a Playwright request context to capture session cookies from authClient
  const requestContext = await request.newContext({ baseURL: API_URL });

  const { user, org } = await setupUserAndOrganization(testUserAndOrg);

  // Save the authentication state (cookies/storage) to a file for reuse in tests
  await requestContext.storageState({ path: 'storage/auth.json' });

  // Store data in environment variables for access within test files
  process.env.USER_DATA = JSON.stringify(user);
  process.env.ORG_DATA = JSON.stringify(org);

  await requestContext.dispose();
};
