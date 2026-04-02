import { authClient } from '@/utils/auth';

export default async function setupUserAndOrganization(data: {
  userEmail: string;
  userPassword: string;
  userName: string;
  orgName: string;
  orgSlug: string;
}) {
  const userData = { email: data.userEmail, password: data.userPassword, name: data.userName };
  const user = await setupUser(userData);

  const orgData = { name: data.orgName, slug: data.orgSlug };
  const org = await setupOrganization(orgData);

  return { user, org };
}

async function setupUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  // 1. Attempt Signup
  const { data, error } = await authClient.signUp.email({
    email: email,
    password: password,
    name: name,
  });

  // 2. Handle existing user (Sign In)
  if (error?.status === 422) {
    await authClient.signIn.email({ email, password });
  } else if (error) {
    throw new Error(`SignUp failed: ${error.message}`);
  }

  return data?.user || (await authClient.getSession()).data?.user;
}

async function setupOrganization({ name, slug }: { name: string; slug: string }) {
  let activeOrg = null;
  const { data: newOrg, error: orgError } = await authClient.organization.create({ name, slug });

  if (orgError) {
    console.log('Organization might already exist, fetching existing list...');

    // Fetch the list of organizations the user belongs to
    const { data: orgs } = await authClient.organization.list();

    // Find the organization by slug or name
    activeOrg = orgs?.find((o) => o.slug === slug || o.name === name);

    if (!activeOrg) {
      throw new Error(`Failed to create or find organization: ${orgError.message}`);
    }
  } else {
    activeOrg = newOrg;
  }

  // Set the organization as active in the current session
  if (activeOrg) {
    await authClient.organization.setActive({
      organizationId: activeOrg.id,
    });
  }

  return activeOrg;
}
