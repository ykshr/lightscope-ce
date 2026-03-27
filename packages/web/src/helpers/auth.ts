import { API_URL } from '@/helpers/env';
import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export default createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [organizationClient()],
});
