import { describe, it, expect } from 'vitest';
import processReferrer from './referrer';

describe('processReferrer', () => {
  it('should return "direct" for undefined referrer', () => {
    expect(processReferrer(undefined)).toEqual({
      referrer: 'direct',
      domain: 'direct',
    });
  });

  it('should return "direct" for empty string referrer', () => {
    expect(processReferrer('')).toEqual({
      referrer: 'direct',
      domain: 'direct',
    });
  });

  it('should extract domain from a valid URL', () => {
    const referrer = 'https://www.google.com/search?q=test';
    expect(processReferrer(referrer)).toEqual({
      referrer,
      domain: 'google.com',
    });
  });

  it('should extract domain from a subdomain', () => {
    const referrer = 'https://blog.example.co.uk/post';
    expect(processReferrer(referrer)).toEqual({
      referrer,
      domain: 'example.co.uk',
    });
  });

  it('should return "unknown" domain for invalid URL', () => {
    const referrer = 'invalid-url';
    expect(processReferrer(referrer)).toEqual({
      referrer,
      domain: 'unknown',
    });
  });

  it('should return "unknown" domain when tldts cannot parse it', () => {
    // tldts returns null for IP addresses or local domains by default
    const referrer = 'http://localhost:3000';
    // localhost is not in the public suffix list, so tldts.getDomain('localhost') returns null
    expect(processReferrer(referrer).domain).toBe('unknown');
  });
});
