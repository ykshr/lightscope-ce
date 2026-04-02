import { API_URL } from '@/helpers/env';
import { APIRequestContext } from '@playwright/test';

export default async function setupUserAndOrganization(
  requestContext: APIRequestContext,
  data: {
    userEmail: string;
    userPassword: string;
    userName: string;
    orgName: string;
    orgSlug: string;
  }
) {
  const userData = { email: data.userEmail, password: data.userPassword, name: data.userName };
  const user = await setupUser(requestContext, userData);

  const orgData = { name: data.orgName, slug: data.orgSlug };
  const org = await setupOrganization(requestContext, orgData);

  return { user, org };
}

async function setupUser(
  requestContext: APIRequestContext,
  {
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }
) {
  // 1. Attempt to Sign Up the user
  const signUpResponse = await requestContext.post(`${API_URL}/api/auth/sign-up/email`, {
    data: { email, password, name },
  });

  if (signUpResponse.ok()) {
    // Return user data if signup is successful
    return await signUpResponse.json();
  }

  // 2. Handle cases where the user already exists (Status 422)
  if (signUpResponse.status() !== 422) {
    const errorBody = await signUpResponse.text();
    throw new Error(`SignUp failed: [${signUpResponse.status()}] ${errorBody}`);
  }

  // 3. Attempt to Sign In if the user already exists
  console.log('User already exists, attempting to sign in...');
  const signInResponse = await requestContext.post(`${API_URL}/api/auth/sign-in/email`, {
    data: { email, password },
  });

  if (signInResponse.ok()) {
    // Return session/user data if signin is successful
    // The session cookie is automatically stored in the requestContext here
    return await signInResponse.json();
  }

  // 4. Throw error if both signup and signin fail
  const signInErrorBody = await signInResponse.text();
  throw new Error(`SignIn failed: [${signInResponse.status()}] ${signInErrorBody}`);
}

async function setupOrganization(
  requestContext: APIRequestContext,
  { name, slug }: { name: string; slug: string }
) {
  let activeOrg = null;

  // 1. Attempt to create a new organization
  const createRes = await requestContext.post(`${API_URL}/api/auth/organization/create`, {
    data: { name, slug },
  });

  if (createRes.ok()) {
    activeOrg = await createRes.json();
  } else {
    // 2. If creation fails (e.g., slug already taken), fetch the existing organization list
    console.log('Organization might already exist, fetching existing list...');

    const listRes = await requestContext.get(`${API_URL}/api/auth/organization/list`);

    if (!listRes.ok()) {
      const errText = await listRes.text();
      throw new Error(`Failed to fetch organization list: ${listRes.status()} ${errText}`);
    }

    const orgs = await listRes.json();
    // Search for the organization by slug or name in the user's joined list
    activeOrg = orgs.find((o: any) => o.slug === slug || o.name === name);

    if (!activeOrg) {
      const createErr = await createRes.text();
      throw new Error(`Failed to create or find organization. Create Error: ${createErr}`);
    }
  }

  // 3. Set the organization as active for the current session
  // This updates the session cookie to include the organization context
  if (activeOrg) {
    const setActiveRes = await requestContext.post(`${API_URL}/api/auth/organization/set-active`, {
      data: { organizationId: activeOrg.id },
    });

    if (!setActiveRes.ok()) {
      const setActiveErr = await setActiveRes.text();
      throw new Error(
        `Failed to set active organization: ${setActiveRes.status()} ${setActiveErr}`
      );
    }
  }

  return activeOrg;
}
