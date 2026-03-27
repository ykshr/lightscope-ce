import { API_URL } from '@/helpers/env';
import { createAuthClient } from 'better-auth/react';
import { organizationClient } from 'better-auth/client/plugins';

export default createAuthClient({
  baseURL: `${API_URL}/api/auth`,
  plugins: [
    organizationClient()
  ]
});
