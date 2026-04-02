import { API_URL } from '@/helpers/env';
import { createAuthClient } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [organizationClient()],
});
