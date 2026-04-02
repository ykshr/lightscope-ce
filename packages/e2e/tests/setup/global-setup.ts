import { API_URL, ORG_NAME, ORG_SLUG, USER_EMAIL, USER_NAME, USER_PASSWORD } from '@/helpers/env';
import { authClient } from '@/utils/auth';
import { request } from '@playwright/test';

export default async () => {
  const testUserAndOrg = {
    email: USER_EMAIL,
    password: USER_PASSWORD,
    name: USER_NAME,
    orgName: ORG_NAME,
    orgSlug: ORG_SLUG,
  };

  // Create a Playwright request context to capture session cookies from authClient
  const requestContext = await request.newContext({ baseURL: API_URL });

  const { user, organization } = await setupUserAndOrganization(testUserAndOrg);

  // Save the authentication state (cookies/storage) to a file for reuse in tests
  await requestContext.storageState({ path: 'storage/auth.json' });

  // Store data in environment variables for access within test files
  process.env.USER_DATA = JSON.stringify(user);
  process.env.ORG_DATA = JSON.stringify(organization);

  await requestContext.dispose();
};

async function setupUserAndOrganization(data: any) {
  // 1. Attempt Signup
  const { data: signUpData, error: signUpError } = await authClient.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
  });

  // 2. Handle existing user (Sign In)
  if (signUpError?.status === 422) {
    await authClient.signIn.email({ email: data.email, password: data.password });
  } else if (signUpError) {
    throw new Error(`SignUp failed: ${signUpError.message}`);
  }

  // 3. Organization Logic
  let activeOrg = null;
  const { data: newOrg, error: orgError } = await authClient.organization.create({
    name: data.orgName,
    slug: data.orgSlug,
  });

  if (orgError) {
    console.log('Organization might already exist, fetching existing list...');

    // Fetch the list of organizations the user belongs to
    const { data: orgs } = await authClient.organization.list();

    // Find the organization by slug or name
    activeOrg = orgs?.find((o) => o.slug === data.orgSlug || o.name === data.orgName);

    if (!activeOrg) {
      throw new Error(`Failed to create or find organization: ${orgError.message}`);
    }
  } else {
    activeOrg = newOrg;
  }

  // 4. Set the organization as active in the current session
  if (activeOrg) {
    await authClient.organization.setActive({
      organizationId: activeOrg.id,
    });
  }

  return {
    user: signUpData?.user || (await authClient.getSession()).data?.user,
    organization: activeOrg,
  };
}
