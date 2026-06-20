import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveSiteName } from '../../../src/helpers/siteName';

describe('resolveSiteName', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockWindowLocation = (hostname: string, pathname: string) => {
    vi.stubGlobal('window', {
      location: {
        hostname,
        pathname,
      },
    });
  };

  it('returns the full hostname if a subdomain exists', () => {
    mockWindowLocation('sub.example.com', '/path');
    expect(resolveSiteName()).toBe('sub.example.com');
  });

  it('returns the first path segment if no subdomain exists', () => {
    mockWindowLocation('example.com', '/shop/item/123');
    expect(resolveSiteName()).toBe('/shop');
  });

  it('returns "/" if no subdomain exists and path is root', () => {
    mockWindowLocation('example.com', '/');
    expect(resolveSiteName()).toBe('/');
  });

  it('returns the first path segment for localhost', () => {
    mockWindowLocation('localhost', '/dashboard/settings');
    expect(resolveSiteName()).toBe('/dashboard');
  });

  it('returns the full hostname for deeply nested subdomains', () => {
    mockWindowLocation('a.b.example.com', '/path');
    expect(resolveSiteName()).toBe('a.b.example.com');
  });

  it('handles multiple slashes in pathname correctly', () => {
    mockWindowLocation('example.com', '//shop//item//');
    expect(resolveSiteName()).toBe('/shop');
  });

  it('handles empty pathname correctly', () => {
    mockWindowLocation('example.com', '');
    expect(resolveSiteName()).toBe('/');
  });
});
