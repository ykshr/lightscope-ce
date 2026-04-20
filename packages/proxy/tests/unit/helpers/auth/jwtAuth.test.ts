import { describe, it, expect, vi, beforeEach } from 'vitest';
import JwtAuth from '@/helpers/auth/jwtAuth';
import { AlgorithmTypes, sign } from 'hono/jwt';
import { Context } from 'hono';

describe('JwtAuth', () => {
  const secret = 'test-secret';
  const algorithm = 'HS256' as AlgorithmTypes;
  let auth: JwtAuth;

  beforeEach(() => {
    auth = new JwtAuth(secret, algorithm);
  });

  const createMockContext = (headers: Record<string, string>) => {
    return {
      req: {
        header: (name: string) => headers[name] || null,
      },
    } as unknown as Context;
  };

  it('should return null when no token is provided', async () => {
    const c = createMockContext({});
    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();
  });

  it('should return null when an invalid token is provided', async () => {
    const c = createMockContext({ Authorization: 'Bearer invalid-token' });
    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();
  });

  it('should return null when token payload is missing required fields', async () => {
    const token = await sign({ invalidField: 'value' }, secret, algorithm);
    const c = createMockContext({ Authorization: `Bearer ${token}` });
    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();
  });

  it('should return null when request lacks Origin header', async () => {
    const token = await sign(
      { organizationId: 'org1', origin: 'https://example.com' },
      secret,
      algorithm
    );
    const c = createMockContext({ Authorization: `Bearer ${token}` });
    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();
  });

  it('should return null when origins cannot be parsed', async () => {
    const token = await sign(
      { organizationId: 'org1', origin: 'invalid-origin' },
      secret,
      algorithm
    );
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Origin: 'https://example.com',
    });
    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();

    const token2 = await sign(
      { organizationId: 'org1', origin: 'https://example.com' },
      secret,
      algorithm
    );
    const c2 = createMockContext({ Authorization: `Bearer ${token2}`, Origin: 'invalid-origin' });
    const tracker2 = await auth.getTracker(c2);
    expect(tracker2).toBeNull();
  });

  it('should return null when Origin mismatch', async () => {
    const token = await sign(
      { organizationId: 'org1', origin: 'https://example.com' },
      secret,
      algorithm
    );
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Origin: 'https://malicious.com',
    });
    const tracker = await auth.getTracker(c);
    expect(tracker).toBeNull();
  });

  it('should return a tracker when token is valid and origins match', async () => {
    const token = await sign(
      { organizationId: 'org1', origin: 'https://example.com' },
      secret,
      algorithm
    );
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Origin: 'https://example.com',
    });
    const tracker = await auth.getTracker(c);
    expect(tracker).toEqual({ organizationId: 'org1' });
  });

  it('should return a tracker when origins subdomains match to root domain if logic applies (currently requires exact hostname match)', async () => {
    const token = await sign(
      { organizationId: 'org1', origin: 'https://example.com' },
      secret,
      algorithm
    );
    const c = createMockContext({
      Authorization: `Bearer ${token}`,
      Origin: 'https://example.com',
    });
    const tracker = await auth.getTracker(c);
    expect(tracker).toEqual({ organizationId: 'org1' });
  });
});
