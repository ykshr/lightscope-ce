import { Context } from 'hono';
import { AuthProvider, Tracker } from './index';

export default class BasicAuth implements AuthProvider {
  async getTracker(c: Context): Promise<Tracker | null> {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) return null;

    try {
      // Use internal api url or the public api url
      const API_URL = process.env.API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const sessionData = await response.json();

      if (!sessionData || !sessionData.user) return null;

      return {
        tenantId: sessionData.user.tenantId || 1,
      };
    } catch (e) {
      console.error('BasicAuth Proxy error verifying token', e);
      return null;
    }
  }
}
