import { Context } from 'hono';
import { AuthProvider, Tracker } from './index';
import { LRUCache } from 'lru-cache';

// Cache invalidation: Keep token resolution for 5 minutes
const tokenCache = new LRUCache<string, Tracker | 'INVALID'>({
  max: 10000,
  ttl: 1000 * 60 * 5,
});

export default class BasicAuth implements AuthProvider {
  async getTracker(c: Context): Promise<Tracker | null> {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) return null;

    // Return from cache if we already resolved this recently
    if (tokenCache.has(token)) {
      const cached = tokenCache.get(token);
      return cached === 'INVALID' ? null : (cached as Tracker);
    }

    try {
      // Use internal api url or the public api url
      const API_URL = process.env.API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Cache negative responses shortly to prevent retry storms
        tokenCache.set(token, 'INVALID', { ttl: 1000 * 60 });
        return null;
      }

      const sessionData = await response.json();

      if (!sessionData || !sessionData.user) {
        tokenCache.set(token, 'INVALID', { ttl: 1000 * 60 });
        return null;
      }

      const tracker: Tracker = {
        tenantId: sessionData.user.tenantId || 1,
      };

      // Set to cache
      tokenCache.set(token, tracker);

      return tracker;
    } catch (e) {
      console.error('BasicAuth Proxy error verifying token', e);
      // Don't cache unexpected errors for long, so we can retry
      return null;
    }
  }
}
