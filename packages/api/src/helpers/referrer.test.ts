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

  it('should return "unknown" domain when psl cannot parse it', () => {
      // psl returns null or error for IP addresses or local domains depending on config,
      // but let's test a case that might fail psl parsing or be invalid
      const referrer = 'http://localhost:3000'; 
      // localhost might not be in the public suffix list in the way psl expects for a "domain"
      // psl.parse('localhost') returns { input: 'localhost', error: ... } or just input depending on version
      // Let's check the behavior. Based on code: if ('error' in parsed || !parsed.domain)
      
      // Actually localhost usually doesn't have a 'domain' property in psl result (it has 'tld': null or similar).
      expect(processReferrer(referrer).domain).toBe('unknown');
  });
});
