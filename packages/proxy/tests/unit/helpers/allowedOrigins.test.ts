import { describe, it, expect } from 'vitest';
import processAllowedOriginsString, { splitCommaSeparated } from '@/helpers/allowedOrigins';

describe('processAllowedOriginsString', () => {
  it('should return undefined if allowedOrigins is undefined', () => {
    expect(processAllowedOriginsString(undefined)).toBeUndefined();
  });

  it('should return undefined if allowedOrigins is empty string', () => {
    expect(processAllowedOriginsString('')).toBeUndefined();
  });

  it('should return an array of origins when given a comma-separated string', () => {
    expect(processAllowedOriginsString('http://example.com, https://test.com')).toEqual([
      'http://example.com',
      'https://test.com',
    ]);
  });

  it('should return an array of one origin when given a single origin', () => {
    expect(processAllowedOriginsString('http://example.com')).toEqual(['http://example.com']);
  });
});

describe('splitCommaSeparated', () => {
  it('should return undefined if input is undefined', () => {
    expect(splitCommaSeparated(undefined)).toBeUndefined();
  });

  it('should return undefined if input is empty string', () => {
    expect(splitCommaSeparated('')).toBeUndefined();
  });

  it('should correctly split and trim elements', () => {
    expect(splitCommaSeparated('a, b , c  ')).toEqual(['a', 'b', 'c']);
  });
});
