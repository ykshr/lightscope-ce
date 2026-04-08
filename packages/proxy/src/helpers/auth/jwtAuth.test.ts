import { Context } from 'hono';
import { AlgorithmTypes, sign } from 'hono/jwt';
import { describe, expect, it } from 'vitest';
import JwtAuth from './jwtAuth';

describe('JwtAuth', () => {
  const secret = 'test-secret';
  const algorithm: AlgorithmTypes = AlgorithmTypes.HS256;
  const auth = new JwtAuth(secret, algorithm);

  const createMockContext = (headers: Record<string, string>) => {
    return {
      req: {
        header: (name: string) => headers[name] || headers[name.toLowerCase()],
      },
    } as unknown as Context;
  };

  it('should return tracker when Origin matches', async () => {
    const payload = {
      organizationId: 'org_123',
      origin: 'https://example.com',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = await sign(payload, secret, algorithm);
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Origin: 'https://example.com',
    });

    const tracker = await auth.getTracker(c);
    expect(tracker).toEqual({ organizationId: 'org_123' });
  });

  it('should return null even when Referer matches', async () => {
    const payload = {
      organizationId: 'org_123',
      origin: 'https://example.com',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = await sign(payload, secret, algorithm);
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Referer: 'https://example.com/some/path',
    });

    const tracker = await auth.getTracker(c);
    // CURRENTLY this returns { organizationId: 'org_123' }
    // After fix, it should return null
    expect(tracker).toBeNull();
  });

  it('should return null when Origin/Referer is missing (vulnerability reproduction)', async () => {
    const payload = {
      organizationId: 'org_123',
      origin: 'https://example.com',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = await sign(payload, secret, algorithm);
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
    });

    const tracker = await auth.getTracker(c);
    // CURRENTLY this returns { organizationId: 'org_123' }
    // After fix, it should return null
    expect(tracker).toBeNull();
  });

  it('should return null when Origin mismatch', async () => {
    const payload = {
      organizationId: 'org_123',
      origin: 'https://example.com',
      exp: Math.floor(Date.now() / 1000) + 60,
    };
    const token = await sign(payload, secret, algorithm);
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Origin: 'https://malicious.com',
    });

    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();
  });
});
