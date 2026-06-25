import { describe, expect, it } from 'vitest';
import processAllowedOriginsString, { splitCommaSeparated } from '@/helpers/allowedOrigins';

describe('processAllowedOriginsString', () => {
  it('should return undefined if allowedOrigins is undefined', () => {
    expect(processAllowedOriginsString(undefined)).toBeUndefined();
  });

  it('should return undefined if allowedOrigins is an empty string', () => {
    expect(processAllowedOriginsString('')).toBeUndefined();
  });

  it('should return a single origin array for a single origin', () => {
    expect(processAllowedOriginsString('http://localhost:3000')).toEqual(['http://localhost:3000']);
  });

  it('should return multiple origins correctly split by comma', () => {
    expect(processAllowedOriginsString('http://localhost:3000,https://example.com')).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ]);
  });

  it('should trim whitespace from origins', () => {
    expect(processAllowedOriginsString(' http://localhost:3000 , https://example.com  ')).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ]);
  });

  it('should handle trailing commas', () => {
    expect(processAllowedOriginsString('http://localhost:3000,')).toEqual([
      'http://localhost:3000',
      '',
    ]);
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
