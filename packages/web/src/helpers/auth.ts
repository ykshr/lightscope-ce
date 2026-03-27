import { API_URL } from '@/helpers/env';
import { createAuthClient } from 'better-auth/react';

export default createAuthClient({
  baseURL: `${API_URL}/api/auth`,
});
